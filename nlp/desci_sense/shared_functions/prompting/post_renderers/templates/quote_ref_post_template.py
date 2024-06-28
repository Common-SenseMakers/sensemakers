from jinja2 import Template


quote_ref_post_template = Template(
    """
{%- if author_name %}
- Author: {{ author_name }}
{%- endif %}
- Content: {{ content }}
{%- if rendered_metadata %}
- References: 
{{ rendered_metadata }}
{%- endif %}
"""
)
