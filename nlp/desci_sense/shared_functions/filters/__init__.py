from enum import Enum


class SciFilterClassfication(Enum):
    NOT_CLASSIFIED = "not_classified"
    NOT_RESEARCH = "not_research"
    AI_DETECTED_RESEARCH = "ai_detected_research"
    CITOID_DETECTED_RESEARCH = "citoid_detected_research"
