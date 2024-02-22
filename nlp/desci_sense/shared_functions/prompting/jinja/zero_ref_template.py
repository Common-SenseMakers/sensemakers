from jinja2 import Template

zero_ref_template = Template(
    """
  You are an expert annotator tasked with converting social media posts about scientific research to a structured semantic format. For an input post, your job is to select the tags most suitable to that post, from a predefined set of tags. 

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

  Output:
  """
)
