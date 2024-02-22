from jinja2 import Template

single_ref_template = Template(
    """
    You are an expert annotator tasked with converting social media posts about scientific research to a structured semantic format. The input post contains a reference to an external URL. Your job is to select the tags best characterizing the relation of the post to the external reference, from a predefined set of tags. {% if metadata_list|length > 0 %}  Details about the external reference will be provided alongside the input post under "Reference Metadata". {% endif %}

    The available tag types are:
    {%- for template in type_templates %}
    <{{template['label']}}>: {{template['prompt']}}
    {%- endfor %}

    A user will pass in a post, and you should think step by step, before selecting a set of tags that best match the post.

    Your final answer should be structured as follows:
    Reasoning Steps: (your reasoning steps)
    Candidate Tags: (For potential each tag you choose, explain why you chose it.)
    Final Answer: (a set of final tags, based on the Candidate Tags. The final tags must be included in the Candidate Tags list!)

    # Input post text:
    Author: {{ author_name }}
    Content: {{ content }}

    {{ references_metadata }}

    # Output:
    """
)
