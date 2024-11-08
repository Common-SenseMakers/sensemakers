from notion_client import Client
import time
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_ID = "137268ae33ab815bb01acd9bb0c877bd"

NOTION_API_TOKEN = os.getenv('SN_NOTION_TOKEN')
# Initialize the Notion client
notion = Client(auth=NOTION_API_TOKEN)

def get_database_pages(database_id):
    # Retrieve all pages in the database
    pages = []
    response = notion.databases.query(database_id=database_id)
    pages.extend(response["results"])
    
    # Paginate through results if there are more than one page of results
    while response.get("has_more"):
        response = notion.databases.query(
            database_id=database_id, start_cursor=response["next_cursor"]
        )
        pages.extend(response["results"])
    
    return pages

def delete_page(page_id):
    # Archive the page, which effectively deletes it from the database
    notion.pages.update(page_id=page_id, archived=True)

def delete_all_pages_in_database(database_id):
    pages = get_database_pages(database_id)
    for page in pages:
        page_id = page["id"]
        delete_page(page_id)
        print(f"Deleted page {page_id}")
        time.sleep(0.5)  # Wait a bit to avoid hitting rate limits

if __name__ == "__main__":
    delete_all_pages_in_database(DATABASE_ID)
    print("All pages have been deleted.")
