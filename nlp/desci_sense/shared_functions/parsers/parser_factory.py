# from . import ParserChainType
from ..configs import (
    MultiParserChainConfig,
    PostParserChainConfig,
    ParserChainType,
)
from .keyword_pparser import KeywordPostParserChain
from .reference_tagger import ReferenceTaggerParserChain
from .topics_pparser import TopicsParserChain
from ..schema.ontology_base import OntologyBase


def parser_factory(
    pparser_config: PostParserChainConfig,
    multi_chain_config: MultiParserChainConfig,
    ontology: OntologyBase,
):
    pparser_type: ParserChainType = pparser_config.type
    if pparser_type == ParserChainType.KEYWORDS:
        pparser = KeywordPostParserChain(
            pparser_config,
            multi_chain_config,
            ontology,
        )
    elif pparser_type == ParserChainType.REFERENCE_TAGGER:
        pparser = ReferenceTaggerParserChain(
            pparser_config,
            multi_chain_config,
            ontology,
        )
    elif pparser_type == ParserChainType.TOPICS:
        pparser = TopicsParserChain(
            pparser_config,
            multi_chain_config,
            ontology,
        )
    else:
        raise ValueError(f"Unsupported parser type: {pparser_type}")

    return pparser
