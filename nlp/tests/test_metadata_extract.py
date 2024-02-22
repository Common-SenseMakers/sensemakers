import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.web_extractors.metadata_extractors import (
    extract_all_metadata_by_type,
    MetadataExtractionType,
)


def test_truncate():
    urls = ["https://link.springer.com/chapter/10.1007/978-3-031-37391-6_9"]
    md_list = extract_all_metadata_by_type(
        urls,
        md_type=MetadataExtractionType.CITOID,
        max_summary_length=4,
    )
    assert md_list[0].summary == "This"


def test_truncate_2():
    summary = "This chapter first examines historical foundations that gave rise to a reductive and quantitative approach to science, linked to a mechanical model of nature (Robbins, New organs of perception: Goethean science as a cultural therapeutics. Janus Head, 8(1), 113–126, 2005). This, it is suggested, has the tendency to separate humanity from nature whereby the scientist becomes an onlooker onto something of which they are not a part and has been contributary in the problems of the Anthropocene, posing a threat to humanity and all living things on the planet (Rockström et al., Planetary boundaries: Exploring the safe operating space for humanity. Ecology and Society, 14(2), 2009). However, the current reductive, quantitative model of science is not the only possibility, and there is growing interest in more holistic approaches that draw on our understanding of complex systems and result in integrated sustainability science (Kates et al., Sustainability science. Science, 292(5517), 641–642, 2001). Nevertheless, there is a need to complement this quantitative, reductive science education with a more qualitative, phenomenology-based science process (Østergaard et al., Doing phenomenology in science education: A research review. Studies in Science Education, 44(2), 93–121, 2008). One such approach was developed by Johann Wolfgang von Goethe (Richards, 2002), which can result in the metamorphosis of the scientist (Amrine, The metamorphosis of the scientist. In D. Seamon & A. Zajonc (Eds.), Goethe’s way of science (pp. 33–54). The State University of New York, 1998) and foster a deeper sense of responsibility and care for the natural world (Seamon, Goethe’s way of science as a phenomenology of nature. Janus Head, 8(1), 86–101, 2005). This chapter explores the possibilities for post-normal, sustainability and Goethean science."
    urls = ["https://link.springer.com/chapter/10.1007/978-3-031-37391-6_9"]
    md_list = extract_all_metadata_by_type(
        urls,
        md_type=MetadataExtractionType.CITOID,
        max_summary_length=-1,
    )
    assert md_list[0].summary == summary
