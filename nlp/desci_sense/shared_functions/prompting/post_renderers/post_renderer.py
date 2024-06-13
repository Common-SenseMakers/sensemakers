from abc import ABC, abstractmethod
from typing import List
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)
from ...schema.post import RefPost


class PostRenderer(ABC):
    @property
    def post(self) -> RefPost:
        return self._post

    @property
    def metadata_list(self) -> List[RefMetadata]:
        return self._metadata_list

    @abstractmethod
    def render(self) -> str:
        """
        Returns:
            str: Instantiated template.
        """
        pass
