import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.dataloaders import scrape_post
from desci_sense.shared_functions.web_extractors.metadata_extractors import (
    extract_posts_ref_metadata_dict,
    get_ref_post_metadata_list,
    RefMetadata,
)
from desci_sense.shared_functions.prompting.post_renderers import RefPostRenderer
from desci_sense.shared_functions.configs import MetadataExtractionType

RENDER_TEST_RESULT = """
- Author: Seeds of Science
- Content: Seeds of Science would like to announce the SoS Research Collective - a first-of-its-kind virtual organization for independent researchers (and academics thinking independently). See the announcement post for more info! 

https://www.theseedsofscience.pub/p/announcing-the-sos-research-collective
- References:
1: https://www.theseedsofscience.pub/p/announcing-the-sos-research-collective
Item type: webpage
Title: Announcing the SoS Research Collective
Summary: + offering paid subscriptions (author: Roger's Bacon)
------------------
"""

def test_ref_render_1():
    tweet_url = "https://x.com/science_seeds/status/1752087818099159338"
    quote_ref_post = scrape_post(tweet_url)
    md_dict = extract_posts_ref_metadata_dict([quote_ref_post])
    md_list = get_ref_post_metadata_list(quote_ref_post, md_dict)
    ref_post_renderer = RefPostRenderer(quote_ref_post, md_list)
    rendered = ref_post_renderer.render()
    assert rendered == RENDER_TEST_RESULT
    


if __name__ == "__main__":
    tweet_url = "https://x.com/science_seeds/status/1752087818099159338"
    quote_ref_post = scrape_post(tweet_url)
    md_dict = extract_posts_ref_metadata_dict([quote_ref_post])
    md_list = get_ref_post_metadata_list(quote_ref_post, md_dict)
    ref_post_renderer = RefPostRenderer(quote_ref_post, md_list)
    rendered = ref_post_renderer.render()
    print(rendered)
