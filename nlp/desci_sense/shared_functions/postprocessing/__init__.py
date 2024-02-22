from typing import List, Dict
from rdflib.namespace import RDF
from rdflib import URIRef, Literal, Graph
from ..interface import (
    RDFTriplet,
    isAConceptDefintion,
    KeywordConceptDefinition,
)
from ..schema.ontology_base import OntologyBase
from ..schema.post import RefPost


def convert_predicted_relations_to_rdf_triplets(
    prediction: Dict,
    ontology: OntologyBase,
) -> List[RDFTriplet]:
    post: RefPost = prediction.get("post")
    refs = post.ref_urls

    # extract predicted labels
    predicted_labels = prediction["answer"]["multi_tag"]

    triplets = []

    # for each tag decide if it's the object or predicate
    for label in predicted_labels:
        concept = ontology.get_concept_by_label(label)
        if concept.can_be_predicate():
            # for now, if concept can be predicate we assume triplet
            # of form assertion concept ref
            assert len(refs) > 0
            # TODO change to real URI once we have that
            triplets += [
                RDFTriplet(
                    predicate=URIRef(concept.uri),
                    object=URIRef(ref),
                )
                for ref in refs
            ]

        elif concept.can_be_object():
            # for now, if concept can be subject we assume triplet
            # of form assertion isA concept
            assert len(refs) == 0
            triplets += [
                RDFTriplet(
                    predicate=RDF.type,
                    object=URIRef(ref),
                )
                for ref in refs
            ]

        else:
            raise ValueError(
                f"Label type {label} is netiher a subject \
                              or predicate"
            )

    return triplets


def convert_keywords_to_triplets(prediction: Dict) -> List[RDFTriplet]:
    keywords = prediction["answer"].get("valid_keywords")

    triplets = [
        RDFTriplet(
            predicate=URIRef(KeywordConceptDefinition().uri),
            object=Literal(kw),
        )
        for kw in keywords
    ]

    return triplets


def convert_triplets_to_graph(triplets: List[RDFTriplet]) -> Graph:
    """Convert list of rdf triplets to rdf graph"""
    g = Graph()
    for t in triplets:
        g.add(t.to_tuple())
    return g
