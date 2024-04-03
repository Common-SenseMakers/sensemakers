from ..postprocessing import CombinedParserOutput

item_types_whitelist = [
    "bookSection",
    "journalArticle",
    "preprint",
    "book",
    "manuscript",
    "thesis",
    "presentation",
    "conferencePaper",
    "report",
]


topics_whitelist = [
    "technology",
    "science",
    "academia",
    "research",
    "design",
    "climate",
    "sustainability",
    "software & hardware",
    "philosophy",
    "health",
    "culture",
    "economics",
    "business",
    "finance",
    "literature",
]


# TODO change so that doesn't have side effects
def apply_research_filter(result: CombinedParserOutput) -> bool:
    # if any item types on the whitelist, pass automatically
    if len(set(result.item_types).intersection(set(item_types_whitelist))) > 0:
        result.research_filter = "passed"

    # if item types inconclusive, use scoring system
    score = 0

    # if research related topics not present = 1 point
    if len(set(result.topics).intersection(set(topics_whitelist))) == 0:
        score += 1

    # if academic keyword not assigned = 1 point
    if result.research_filter != "academic":
        score += 1

    # if no references present = 1 point
    if len(result.reference_urls) == 0:
        score += 1

    if score >= 2:
        result.research_filter = "failed"
    else:
        result.research_filter = "passed"

    return result.research_filter
