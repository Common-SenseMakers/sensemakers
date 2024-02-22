from pydantic import BaseModel, Field
from typing import List


# Define a new Pydantic model
class PostTagsDataModel(BaseModel):
    is_announce_tag: bool = Field(
        description="Set to True if this post contains an announcement of new research. The announcement is likely made by the authors but may be a third party. The research should be a paper, dataset or other type of research output that is being announced publicly. False otherwise."
    )
    is_read_tag: bool = Field(
        description="Set to True if this post describes the reading status of the author in relation to a reference, such as a book or article. False otherwise."
    )
    is_event_tag: bool = Field(
        description="Set to True if this post describes an event, either real-world or an online event. Any kind of event is relevant, some examples of events could be seminars, meetups, or hackathons. False otherwise."
    )
    is_review_tag: bool = Field(
        description="Set to True if this post contains a review of another reference, such as a book, article or movie. The review could be positive or negative. A review can be detailed or a simple short endorsement. False otherwise."
    )
    is_recommendation_tag: bool = Field(
        description="Set to True if this post is recommending any kind of content: an article, a movie, podcast, book, another post, etc. This tag can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it. False otherwise."
    )
    is_listening_tag: bool = Field(
        description="Set to True if this post describes the listening status of the author in relation to a reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future. False otherwise."
    )
    is_job_tag: bool = Field(
        description="Set to True if this post describes a job listing, for example a call for graduate students or faculty applications. False otherwise."
    )
    is_quote_tag: bool = Field(
        description="Set to True if this post is quoting text from an article it's referring to. Symbols like '>' or quotation marks are often used to indicate quotations. False otherwise."
    )
    is_discussion_tag: bool = Field(
        description="Set to True if this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims. False otherwise."
    )
    is_question_tag: bool = Field(
        description="Set to True if this post is raising a question or questions about some content it's referring to. The content could be a research paper or other media like a podcast, video or blog post. False otherwise."
    )

    @classmethod
    def tags(cls):
        return [
            "announce",
            "reading",
            "event",
            "review",
            "recommendation",
            "listening",
            "job",
            "quote",
            "discussion",
            "watching",
            "question",
        ]

    def get_selected_tags(self):
        result = set()
        if self.is_announce_tag:
            result.add("announce")
        if self.is_read_tag:
            result.add("reading")
        if self.is_review_tag:
            result.add("review")
        if self.is_event_tag:
            result.add("event")
        if self.is_recommendation_tag:
            result.add("recommendation")
        if self.is_listening_tag:
            result.add("listening")
        if self.is_job_tag:
            result.add("job")
        if self.is_quote_tag:
            result.add("quote")
        if self.is_discussion_tag:
            result.add("discussion")
        if self.is_question_tag:
            result.add("question")
        return result

    def get_selected_tags_str(self):
        res_list = sorted(list(self.get_selected_tags()))
        return ", ".join(res_list)
