import re
from typing import List, Dict
from ....shared_functions.web_extractors.citoid import fetch_citation
from datetime import datetime


class CheckPublication:
    def __init__(self, data: List[Dict]):
        self.data = data
        self.url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    
    def extract_urls(self, text: str) -> List[str]:
        """Extract URLs from a given text."""
        return re.findall(self.url_pattern, text)
    
    def process_data(self) -> List[Dict]:
        """Process each item in the data list to check for publication metadata and enhance with citation info."""
        for row in self.data:
            urls = self.extract_urls(row['content'])
            metadata_columns = {}
            for i, url in enumerate(urls):
                citation = fetch_citation(url)
                if citation and 'DOI' in citation:
                    metadata_columns[f'url_{i+1}_meta_info'] = citation
                else:
                    metadata_columns[f'url_{i+1}_meta_info'] = None

            if any(metadata_columns.values()):
                row['publication'] = 1
            else:
                row['publication'] = 0
            row.update(metadata_columns)
        return self.data



