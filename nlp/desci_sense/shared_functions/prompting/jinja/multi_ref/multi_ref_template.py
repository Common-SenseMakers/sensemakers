from jinja2 import Template

multi_ref_template = Template(
    """
You are an expert annotator tasked with converting social media posts about scientific research to a structured semantic format. The post contains external references in the form of links (URLs). Your job is to select, for each reference, the tags best characterizing the relation of the post to the reference.

# Instructions
## Tag types
The tags are to be selected from a predefined set of tags. The available tag types are:
{%- for template in type_templates %}
<{{template['label']}}>: {{template['prompt_multi_ref']}}
{%- endfor %}

A user will pass in a post, and you should reason step by step, before selecting a set of tags for each reference that best that reference's relation with the post.

Each reference will be marked by a number for convenient identification, in order of appearance in the post. The first reference will be number 1, the second 2, etc. Additional metadata may also be provided for references.

## Required output format
Your final answer should be structured as a JSON Answer object with a list of SubAnswer objects, as described by the following schemas:

{% raw %}
```
class SubAnswer:
	ref_number: int # ID number of current reference
	reasoning_steps: str # your reasoning steps
	candidate_tags: str # For potential each tag you choose, explain why you chose it.
	final_answer: List[str] # a set of final tags, based on the Candidate Tags. The final tags must be included in the Candidate Tags list!

class Answer:
  sub_answers: List[SubAnswer]
```
{% endraw %}

For example, for a post with 2 references, the output would be structured as follows:
{% raw %}
```
{
  "sub_answers": [
  {
    "ref_number": 1,
    "reasoning_steps": "<your reasoning steps...>",
    "candidate_tags": "[<tag1>, <tag2>]",
    "final_answer": [
      "<tag1>"
    ]
  },
  {
    "ref_number": 2,
    "reasoning_steps": "<your reasoning steps...>",
    "candidate_tags": "[<tag1>, <tag3>, <tag4>]",
    "final_answer": [
      "<tag3>",
      "<tag4>"
    ]
  }
]
}
```
{% endraw %}

# Input post text:
{{ rendered_post }}

# Output:


"""
)
