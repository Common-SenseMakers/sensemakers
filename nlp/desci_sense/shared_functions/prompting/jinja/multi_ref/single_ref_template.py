from jinja2 import Template

single_ref_template = Template(
    """
You are an expert annotator tasked with converting social media posts about scientific research to a structured semantic format. The input post contains a reference to an external URL. Your job is to select the tags best characterizing the relation of the post to the external reference, from a predefined set of tags.

The available tag types are:
{%- for template in type_templates %}
<{{template['label']}}>: {{template['prompt_single_ref']}}
{%- endfor %}

A user will pass in a post, and you should think step by step, before selecting a set of tags that best match the post's relation to the reference.

{{ ref_metadata_instructions }}

# Required output format
Your final answer should be structured as a JSON Answer object with a list of a *single* SubAnswer object, as described by the following schemas:

{% raw %}
```
class SubAnswer:
	reasoning_steps: str # your reasoning steps
	candidate_tags: str # For potential each tag you choose, explain why you chose it.
	final_answer: List[str] # a set of final tags, based on the Candidate Tags. The final tags must be included in the Candidate Tags list!

class Answer:
  sub_answers: List[SubAnswer] # answer should contain a single SubAnswer!
```
{% endraw %}

# Input post text:
{{ rendered_post }}

# Output:
"""
)
