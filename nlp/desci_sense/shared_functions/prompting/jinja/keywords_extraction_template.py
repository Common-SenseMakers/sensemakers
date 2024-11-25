from jinja2 import Template

keywords_extraction_template = Template(
    """
You are an expert annotator tasked with assigning keywords to social media posts. At the end of the prompt you will be given the text content of a post which you will extract and return the keywords from.

The keywords should represent the most salient topics and concepts introduced in the post. The keywords should consist of two types: general topics and specific concepts. The topics keywords should indicate the general topics discussed by the posts and its references, like "#climate-change" or "#blockchain". The specific concept keywords should help people in the field better understand the post's contents and concepts it introduces (like "#monte-carlo-tree-search", or "#consensus-algorithms"). The concept keywords should capture the concept clearly and not leave space for ambiguity. e.g. if the post talk about collective efforts, use #collective-efforts, not #collective . In addition to the above, you should also add a special '#academic' keyword if the post is related to academic research. Academic research is to be defined broadly, as anything that the author is likely to see as related to their research, including academic job offers, code repositories, blog posts and so on. If the post is clearly not related in any way to academic research, add '#not-academic'. {% if metadata_list|length > 0 %}  The post also includes references to external content. Details about the external references will be provided alongside the input post under "Reference Metadata". The keywords should also represent the external references! {% endif %}

Rules:
- You should choose up to {{ max_keywords}} keywords, plus the additional special academic/non-academic keyword!
- Keywords should be prefixed with a hashtag, e.g., #ai
- Keywords should should be normalized to a consistent form of lowercase acronym e.g. 'AI' should be returned as 'ai' and separated words should be separated with a hyphen, e.g. 'ModelTheory' should be 'model-theory'    
- do not separated compound words like blockchain.
- reduce ambiguity by adding minimal amount of words to the keyword to add context. e.g. instead of #revolution use #french-revolution if the post has that extra context. 

- If there is not enough context in the post content or meta data, e.g. there are no words or the text is to short so there is ambiguity, return only the special keyword ( #academic or #not-academic)
- Your final answer should be structured as follows:
    - Reasoning Steps: (your reasoning steps)
    - Candidate Keywords: (For each potential keyword you choose, explain why you chose it.)
    - Final Answer: (a set of {{ max_keywords + 1}} final keywords, based on the Candidate Keywords. One of the keywords should be #academic or #not-academic. The rest of the final keywords must be included in the Candidate Keywords list!)

# Below is the content of the post you need to extract keywords from:
{{ rendered_post }}

# Output:
"""
)

''' - Repeat the exact text of the post content given to you at the end of the prompt (should be the same text as the post content)
    - Keywords context: a dictionary where each keyword is paired with a short description that captures the meaning conveyed in the post  e.g. {'pulsar':'a highly magnetized rotating neutron star that emits beams of electromagnetic radiation out of its magnetic poles.'} 
    - context: a dictionary where each keyword is paired with a short description that captures the meaning conveyed in the post  e.g. {'pulsar':'a highly magnetized rotating neutron star that emits beams of electromagnetic radiation out of its magnetic poles.'} 

    '''