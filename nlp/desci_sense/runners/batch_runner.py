from loguru import logger
from tqdm import tqdm

from ..dataloaders.mastodon.mastodon_loader import MastodonLoader
from ..parsers.base_parser import BaseParser
from ..filters.simple_sci_filter import SimpleCitoidSciFilter


class MastodonBatchRunner:
    def __init__(self) -> None:
        self.loader = MastodonLoader()
        self.filter = SimpleCitoidSciFilter()
        # self.model = BaseParser()

    def process_account(self, mastodon_account: str, max_posts: int = 5):
        # TODO check if chrono order
        logger.info(f"Loading Mastodon profiles (max={max_posts})...")
        posts = self.loader.load_profiles([mastodon_account], number_toots=max_posts)

        logger.info(f"Processing posts...")
        passed = []
        for post in tqdm(posts, total=len(posts)):
            res = self.filter.filter(post)
            logger.debug(f"passed filter: {res} | Post: {post}")
            if res:
                passed.append(post)

        return posts, passed
