DEFAULT_PREDICATE_LABEL = "default"

# map between the predicted label types and corresponding template name
LABEL_TEMPLATE_MAP = {
    "job": "announcement-job",
    "announce": "Announcement-research",
    "event": "Announcement-event",
    "discussion": "Discussion",
    "quote": "Includes-quotation-from",
    "question": "asks-question-about",
    "recommendation": "recommends",
    "review": "reviews",
    "default": "links to",
    "listening": "listening-consumption-status",
    "reading": "reading-consumption-status",
    "watching": "watching-consumption-status",
}

TEMPLATES = {
    "announcement-job": {
        "prompt": "",
        "description": "A post that describes a job listing, for example a call for graduate students or faculty applications.",
        "display_name": "📢 announces-job",
        "label": "job",
        "URI": "",
    },
    "Announcement-research": {
        "prompt": "",
        "description": "A post announcing a paper, dataset or other type of research output.",
        "display_name": "📢 announces-research",
        "label": "announce",
        "URI": "",
    },
    "Announcement-event": {
        "prompt": "",
        "description": "Announcement of an event. Either a real-world or an online event. Any kind of event is relevant, some examples of events could be seminars, meetups, or hackathons.",
        "display_name": "🗓️ announces-event",
        "label": "event",
        "URI": "",
    },
    "Discussion": {
        "prompt": "",
        "description": "Post discusses how the cited reference relates to other facts or claims. For example, a post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.",
        "display_name": "🗣️ discusses",
        "label": "discussion",
        "URI": "",
    },
    "Includes-quotation-from": {
        "prompt": "",
        "description": "A post is quoting text from an article it's referring to.",
        "display_name": "📝 quotes-from",
        "label": "quote",
        "URI": "",
    },
    "asks-question-about": {
        "prompt": "",
        "description": "This post is raising a question or questions about some content it's referring to. The content could be a research paper or other media like a podcast, video or blog post.",
        "display_name": "❔ ask-question-about",
        "label": "question",
        "URI": "",
    },
    "recommends": {
        "prompt": "",
        "description": "The author is recommending any kind of content: an article, a movie, podcast, book, another post, etc. This tag can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.",
        "display_name": "👌 recommends",
        "label": "recommendation",
        "URI": "",
    },
    "reviews": {
        "prompt": "",
        "description": "The post contains a review of another reference, such as a book, article or movie. The review could be positive or negative. A review can be detailed or a simple short endorsement.",
        "display_name": "🧐 reviews",
        "label": "review",
        "URI": "",
    },
    "links to": {
        "prompt": "",
        "description": "This is for cases that don't match any of the other labels, and simply denotes that the post mentions or refers to a particular external link.",
        "display_name": "⬛ links-to",
        "label": "default",
        "URI": "https://sparontologies.github.io/cito/current/cito.html#d4e1159",
    },
    "listening-consumption-status": {
        "prompt": "",
        "description": "The post describes the listening status of the author in relation to a reference, such as a podcast or talk. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.",
        "display_name": "🎧 listening-status",
        "label": "listening",
        "URI": "",
    },
    "reading-consumption-status": {
        "prompt": "",
        "description": "The post describes the reading status of the author in relation to a reference, such as a book or article. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.",
        "display_name": "📑 reading-status",
        "label": "reading",
        "URI": "",
    },
    "watching-consumption-status": {
        "prompt": "",
        "description": "The post describes the watching status of the author in relation to a reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.",
        "display_name": "👀 watching-status",
        "label": "watching",
        "URI": "",
    },
}

PREDICATE_LABELS = [x["label"] for x in TEMPLATES.values()]

DISP_NAME_TEMPLATES_MAP = {v["display_name"]: k for k, v in TEMPLATES.items()}
