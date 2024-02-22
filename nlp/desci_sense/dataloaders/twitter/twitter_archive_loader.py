import zipfile
import os
import pytz
import pandas as pd
from datetime import datetime
from typing import List


from ...shared_functions.schema.post import RefPost
from ...dataloaders.twitter.twitter_archive_parser import (
    parse_tweets,
    PathConfig,
    extract_username,
    read_json_from_js_file,
)
from ...dataloaders.twitter.twitter_utils import convert_archive_tweet_to_ref_post


def create_dataframe_from_refposts(ref_posts: List[RefPost]):
    # Extracting data from each RefPost
    data = [
        {
            "post_url": post.url,
            "text": post.content,
            "date": post.created_at,
            "ref_urls": post.ref_urls,
        }
        for post in ref_posts
    ]

    # Creating a DataFrame
    df = pd.DataFrame(data, columns=["post_url", "text", "date"])

    return df


class TwitterArchiveLoader:
    def __init__(self) -> None:
        pass

    def load_ref_posts_from_archive_dir(
        self, archive_dir: str, cutoff_date: str = None
    ) -> List[RefPost]:
        """
        Loads tweets found at path specified by `archive_dir` and converts them to a list of RefPosts.
        """
        paths = PathConfig(dir_archive=archive_dir)
        username = extract_username(paths)

        tweets = []
        for tweets_js_filename in paths.files_input_tweets:
            json = read_json_from_js_file(tweets_js_filename)
            tweets += json

        ref_posts = []
        for tweet in tweets:
            ref_post = convert_archive_tweet_to_ref_post(tweet, username)
            ref_posts.append(ref_post)

        # Filter by cutoff_date if provided
        if cutoff_date is not None:
            cutoff_datetime = datetime.strptime(cutoff_date, "%Y-%m-%d").replace(
                tzinfo=pytz.UTC
            )
            ref_posts = [
                post for post in ref_posts if post.created_at >= cutoff_datetime
            ]

        return ref_posts

    def load_archive(self, path_to_zip: str, cutoff_date: str = None) -> List[RefPost]:
        """Extracts zip archive of tweets `path_to_zip` and converts them into RefPosts.
        If optional `cutoff_date` is provided, returns only posts with creation date equal to or greater than `cutoff_date`.

        Args:
            path_to_zip (str): zip archive of tweets to be converted.
            cutoff_date (str, optional): returns only posts with creation date equal to or greater than `cutoff_date`. Defaults to None.

        Returns:
            List[RefPost]: list of tweets converted to RefPosts
        """
        # Extract the zip archive
        with zipfile.ZipFile(path_to_zip, "r") as zip_ref:
            extract_path = os.path.splitext(path_to_zip)[0]
            zip_ref.extractall(extract_path)

        # Load tweets from the extracted directory
        ref_posts = self.load_ref_posts_from_archive_dir(extract_path, cutoff_date)

        return ref_posts
