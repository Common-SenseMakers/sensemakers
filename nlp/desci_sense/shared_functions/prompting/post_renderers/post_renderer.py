from abc import ABC, abstractmethod
from typing import List
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)
from ...schema.post import RefPost


class PostRenderer(ABC):
    @abstractmethod
    def render_instructions(self, post) -> str:
        """

        Returns:
            str: Instructions section for prompt
        """

    @abstractmethod
    def render(
        self,
        post: RefPost,
        md_list: List[RefMetadata],
    ) -> str:
        """
        Returns:
            str: Instantiated template.
        """
        pass
