import streamlit as st
import json
import pymupdf
from os import getenv
from openai import OpenAI
import requests
from PIL import Image
from io import BytesIO


if "result" not in st.session_state:
    st.session_state.result = {}


@st.cache_resource
def load_model():
    model = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=getenv("OPENROUTER_API_KEY"),
    )
    return model


def extract_highlighted_text(
    img_url: str,
    model,
) -> str:
    """
    Returns highlighted text in image stored at `img_url`.
    """
    completion = model.chat.completions.create(
        model="openai/gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What is the highlighted text in this image? Return just the highlighted text and nothing else!",
                    },
                    {
                        "type": "image_url",
                        "image_url": img_url,
                    },
                ],
            }
        ],
        max_tokens=500,
    )
    return completion.choices[0].message.content


# Function to find the page number containing the text and highlight the text
def find_page_number_and_highlight(pdf_document, text):
    print(f"search for {text}")
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        text_instances = page.search_for(text)
        if text_instances:
            for inst in text_instances:
                page.add_highlight_annot(inst)
            return page_num + 1  # Page numbers are 1-based
    return None


# Function to create the annotation JSON
def create_annotation_json(screenshot_text, pdf_url, page_num):
    annotation = {
        "@context": "http://www.w3.org/ns/anno.jsonld",
        "id": "http://example.org/annotations/1",
        "type": "Annotation",
        "body": {
            "type": "TextualBody",
            "value": screenshot_text,
            "format": "text/plain",
            "language": "en",
        },
        "target": {
            "source": pdf_url,
            "selector": [
                {"type": "TextQuoteSelector", "exact": screenshot_text},
                {
                    "type": "FragmentSelector",
                    "conformsTo": "http://www.w3.org/TR/media-frags/",
                    "value": f"page={page_num}",
                },
            ],
        },
    }
    return annotation


# Streamlit app
st.title("PDF Annotation Creator")

with st.spinner("Creating model..."):
    model = load_model()

st.header("Inputs")

# Input for the image URL
image_url = st.text_input("Enter the URL of the image containing highlighted text:")

# Display the image
if image_url:
    try:
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content))
        st.image(image, caption="Uploaded Image", use_column_width=True)
    except Exception as e:
        st.error(f"Error loading image: {e}")

# Input for the PDF URL
# pdf_url = st.text_input("Enter the URL of the PDF:")

# File uploader for the PDF
pdf_file = st.file_uploader("Upload the PDF:", type=["pdf"])

if st.button("Extract Text"):
    if image_url:
        st.session_state.result["screenshot_text"] = extract_highlighted_text(
            image_url,
            model,
        )
        st.write("Extracted Text:")
        st.write(st.session_state.result["screenshot_text"])
    else:
        st.error("Please enter the image URL.")

if st.button("Generate Annotation"):
    if image_url and pdf_file and "screenshot_text" in st.session_state.result:
        pdf_document = pymupdf.open(stream=pdf_file.read(), filetype="pdf")

        page_num = find_page_number_and_highlight(
            pdf_document,
            st.session_state.result["screenshot_text"],
        )
        if page_num:
            # Save the annotated PDF
            output_pdf_path = "annotated_document.pdf"
            pdf_document.save(output_pdf_path)

            # annotation_json = create_annotation_json(
            #     screenshot_text,
            #     pdf_url,
            #     page_num,
            # )
            # st.header("Generated Annotation JSON")
            # st.json(annotation_json)

            # Provide a download link for the annotated PDF
            with open(output_pdf_path, "rb") as f:
                st.download_button(
                    label="Download Annotated PDF",
                    data=f,
                    file_name="annotated_document.pdf",
                    mime="application/pdf",
                )
        else:
            st.error("Text not found in the PDF.")
    else:
        st.error("Please ensure all fields are filled out correctly.")
