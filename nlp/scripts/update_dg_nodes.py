import os
from dotenv import load_dotenv
from notion_client import Client
import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import docopt
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
from threading import Semaphore

from load_posts_to_notion import  get_uri_property_name
def get_posts(start_Ms = 0,count_limit = None):
    if start_Ms:
        posts_ref = db.collection('posts').where("parsedStatus", '==', "processed").where("createdAtMs", '>', start_Ms).limit(count_limit)
    else:
        posts_ref = db.collection('posts').where("parsedStatus", '==', "processed").limit(count_limit)
    # Execute the query
    docs = posts_ref.stream()
    posts = []
    # Print the results
    for doc in docs:
        posts.append((doc.to_dict(),doc.id))
        #print(f'{doc.id} => {doc.to_dict()}')
    print(f'query resulted with {len(posts)} posts')
    return posts
def get_dg_class_triples(post_firebase_id,classes):
    triples_ref = db.collection('triples').where('postId','==',post_firebase_id).where('object','in',classes)

    # Execute the query
    docs = triples_ref.stream()
    triples = []
    # Print the results
    for doc in docs:
        triples.append(doc.to_dict())
        #print(f'{doc.id} => {doc.to_dict()}')
    print(f'query resulted with {len(triples)} triples')
    return triples



classes = ['https://sense-nets.xyz/possibleMissingReference',
'https://schema.org/Observation',
'https://schema.org/Claim',
'https://schema.org/Question']

def get_classes_list(triples):
    classes_list = []
    for triple in triples:
        classes_list.append(triple["object"])
    return get_uri_property_name(classes_list)

def post_notion_lookup(postDocId:str):
    response = notion.databases.query(
        **{
            "database_id": POSTS_DATABASE_ID,
            "filter": {
                "property": "firebase_id",  # The property name in Notion
                "rich_text": {
                    "equals": postDocId  # Use 'equals' to match the authorId exactly
                }
            }
        }
    )
    
    # Check if any results are found
    if response["results"]:
        print(f"page found for post with id: {postDocId}")
        return response["results"][0]["id"]  # Return the first matched profile ID if it exists
    else:
        print(f"No page found for post with id: {postDocId}")
        return None

def update_dg_post_page(notion_post_id:str,classes_list:dict):
    try:
        # Convert the discourse_types list into the format expected by Notion's multi_select property
        multi_select_options = [{"name": discourse_type} for discourse_type in classes_list]

        # Update the Notion page with the new discourse types
        response = notion.pages.update(
            page_id=notion_post_id,
            properties={
                "Discourse Type": {
                    "multi_select": multi_select_options
                }
            }
        )
        print(f"Updated page {notion_post_id} with discourse types: {classes_list}")
        return response
    except Exception as e:
        print(f"Error updating page: {e}")
        return None

"""def update_posts(posts):
    for post,firebase_id in posts:
        triples = get_dg_class_triples(firebase_id,classes)
        notion_post_id = post_notion_lookup
        update_dg_post_page(post_notion_lookup(firebase_id),get_classes_list(triples))
"""

RATE_LIMIT = 3
semaphore = Semaphore(RATE_LIMIT)

# Function to update a single post in parallel
def update_single_post(post, firebase_id, classes):
    try:
        with semaphore:  # This ensures no more than 3 requests per second
            # Get discourse class triples for the post
            triples = get_dg_class_triples(firebase_id, classes)
            if triples:
                # Lookup the post in Notion by firebase_id
                notion_post_id = post_notion_lookup(firebase_id)
                
                # Update the post in Notion with the retrieved classes
                if notion_post_id:
                    update_dg_post_page(notion_post_id, get_classes_list(triples))
                    print(f"Updated post with firebase_id: {firebase_id} in Notion.")
                else:
                    print(f"No page found for firebase_id: {firebase_id}. Skipping.")
            else:
                print("No triples")    
            # Sleep to respect rate limits (3 requests per second)
            time.sleep(1 / RATE_LIMIT)
    except Exception as e:
        print(f"Error occurred while updating post with firebase_id: {firebase_id}: {e}")

# Main function to update posts in parallel
def update_posts(posts, classes):
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(update_single_post, post, firebase_id, classes) for post, firebase_id in posts]

        for future in as_completed(futures):
            try:
                future.result()  # This will raise any exception that occurred during processing
            except Exception as e:
                print(f"Error in processing: {e}")


if __name__ == "__main__":

    load_dotenv()

    """NOTION_API_TOKEN = os.getenv('NOTION_SENSENETS_TOKEN')
    URLS_DATABASE_ID = os.getenv('NOTION_URLS_DATABASE_ID')
    POSTS_DATABASE_ID = os.getenv('NOTION_POSTS_DATABASE_ID')
    PROFILES_DATABASE_ID =os.getenv('NOTION_PROFILES_DATABASE_ID')
    KEYWORDS_DATABASE_ID = os.getenv("NOTION_KEYWORDS_DATABASE_ID")"""

    NOTION_API_TOKEN = os.getenv('SN_NOTION_TOKEN')
    URLS_DATABASE_ID = os.getenv('SN_URLS_DATABASE_ID')
    POSTS_DATABASE_ID = os.getenv('SN_POSTS_DATABASE_ID')
    PROFILES_DATABASE_ID =os.getenv('SN_PROFILES_DATABASE_ID')
    KEYWORDS_DATABASE_ID = os.getenv("SN_KEYWORDS_DATABASE_ID")
    notion = Client(auth=NOTION_API_TOKEN)

    #Initiate firebase client
    cred = credentials.Certificate('nlp/scripts/creds/sensenets-dataset-firebase-adminsdk-rpero-9c552cac56.json')
    firebase_admin.initialize_app(cred)

    # Initialize Firestore DB
    db = firestore.client()

    
    posts = get_posts()

    update_posts(posts,classes)
