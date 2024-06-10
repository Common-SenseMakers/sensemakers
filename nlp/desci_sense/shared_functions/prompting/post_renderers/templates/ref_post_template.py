from jinja2 import Template


ref_post_template = Template(
    """
{%- if author_name %}
- Author: {{ author_name }}
{%- endif %}
- Content: {{ content }}
{%- if references_metadata|length > 0 %}
- References: 
{%- for ref_md in references_metadata %}
{{ loop.index }}: {{ ref_md.url }}
Item type: {{ ref_md.item_type }}
Title: {{ ref_md.title }}
Summary: {{ ref_md.summary }}
------------------
{%- endfor %}
{% endif %}
"""
)
