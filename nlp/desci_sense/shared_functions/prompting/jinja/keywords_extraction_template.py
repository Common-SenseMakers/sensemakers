from jinja2 import Template

keywords_extraction_template = Template(
    """
You are an expert annotator tasked with assigning keywords to social media posts. The keywords should represent the most salient topics discussed by the post. The keywords should consist of two types: general and specific. The general keywords should indicate the general topics discussed by the posts and its references, like "#AI" or "#blockchain". The specific keywords should highlight specific that will help people in the field better understand the post's contents (like "#monte-carlo-tree-search", or "#consensus-algorithms"). {% if metadata_list|length > 0 %}  The post also includes references to external content. Details about the external references will be provided alongside the input post under "Reference Metadata". The keywords should also represent the external references! {% endif %}

Rules:
- You should choose up to {{ max_keywords }} keywords, not more!
- Keywords should be prefixed with a hashtag, e.g., #AI
- Your final answer should be structured as follows:
    - Reasoning Steps: (your reasoning steps)
    - Candidate Keywords: (For potential each keyword you choose, explain why you chose it.)
    - Final Answer: (a set of {{ max_keywords }} final keywords, based on the Candidate Keywords. The final keywords must be included in the Candidate Keywords list!)


# Input post text:
Author: {{ author_name }}
Content: {{ content }}

{{ references_metadata }}

# Output:
"""
)
