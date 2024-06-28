from jinja2 import Template

# set of allowed topics - in the future this could come from the ontology
ALLOWED_TOPICS = [
    "technology",
    "science",
    "academia",
    "research",
    "design",
    "climate",
    "sustainability",
    "software & hardware",
    "philosophy",
    "health",
    "culture",
    "economics",
    "business",
    "politics",
    "news",
    "finance",
    "sports",
    "entertainment & leisure",
    "art",
    "literature",
    "travel",
    "personal",
    "humour",
    "other",
]


topics_template = Template(
    """
You are an expert annotator tasked with assigning topics to social media posts. The assigned topics should represent the most salient topics discussed by the post.  {% if metadata_list|length > 0 %}  The post also includes references to external content. Details about the external references will be provided alongside the input post under "Reference Metadata". The topics should also represent the external references! {% endif %}

The available topic types are:
{%- for topic in topics %}
- {{topic}}
{%- endfor %}

A user will pass in a post, and you should think step by step, before selecting a set of topics that best match the post. You must only use the topics in the list!


Rules:
- Your final answer should be structured as follows:
    - Reasoning Steps: (your reasoning steps)
    - Candidate Topics: (For potential each topic you choose, explain why you chose it.)
    - Final Answer: (a set of final topics, based on the Candidate Topics. The rest of the final keywords must be included in the Candidate Topics list!)


# Input post text:
{{ rendered_post }}

# Output:
"""
)
