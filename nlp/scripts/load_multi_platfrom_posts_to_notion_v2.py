"""Script to map posts from the app to Notion.

Usage:
  laod_posts_to_notion.py [--count=<count>] [--origin=<origin>]


Options:
--count=<count> Optional amounts of posts to load.
--origin=<origin> optional platform

"""
import os
from dotenv import load_dotenv
from notion_client import Client
import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import docopt
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import threading
from threading import Semaphore
# Create locks for profiles and keywords to ensure only one thread can create them at a time
profile_lock = threading.Lock()

#functions for mapping json to Notion profile table
def lookup_notion_profile(firebase_id):
    response = notion.databases.query(
        **{
            "database_id": PROFILES_DATABASE_ID,
            "filter": {
                "property": "firebase_id",  # The property name in Notion
                "rich_text": {
                    "equals": firebase_id  # Use 'equals' to match the authorId exactly
                }
            }
        }
    )
    
    # Check if any results are found
    if response["results"]:
        print(f"Profile found for authorId: {firebase_id}")
        return response["results"][0]["id"]  # Return the first matched profile ID if it exists
    else:
        print(f"No profile found for authorId: {firebase_id}")
        return None
    
def build_base_notion_profile(profile_doc:dict,profile_id:str):
    print("in build profile page")
    platform = profile_doc["platformId"]
    profile = profile_doc["profile"]
    #make handle modular to include mastodon
    handle = profile["username"]
    
    name = profile['displayName']
    try:
        description = profile['description']
    except:
        print(f"profile {profile_id} has no description")
        description = ''

    platform_id = profile['id']
    firebase_id = profile_id
    response = notion.pages.create(
        **{
            "parent": {"database_id": PROFILES_DATABASE_ID},
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {"content": name}
                        }
                    ]
                },
                "Platform Handle": {
                     "rich_text": [
                        {
                            "text": {"content": handle}
                        }
                    ]
                },
                "firebase_id": {
                     "rich_text": [
                        {
                            "text": {"content": firebase_id}
                        }
                    ]
                },
                 "Description": {
                     "rich_text": [
                        {
                            "text": {"content": description}
                        }
                    ]
                },
                "platform_id": {
                     "rich_text": [
                        {
                            "text": {"content": platform_id}
                        }
                    ]
                },
                 "Platforms": {
                    "multi_select": [
                        {"name": platform} 
                    ]
                }
            }
        }
    )
    
    print(f"Created new page for profile with name: {name}")
    return response["id"]  # Return the page ID of the created URL page
def get_firebase_profile_doc(firebase_id):
    # Query the profile collection by postId
    profile_ref = db.collection('profiles').document(firebase_id)

    # Execute the query
    doc = profile_ref.get()
    if doc.exists:
        print(f'Document data: {doc.to_dict()}')
        return doc.to_dict()
    else:
        print('No such document!')
        return None
    
def load_profile_to_notion(firebase_id:str):
    with profile_lock:
        notion_id = lookup_notion_profile(firebase_id)
        if  not notion_id:
            profile_dict = get_firebase_profile_doc(firebase_id)
            notion_id = build_base_notion_profile(profile_dict,firebase_id)
        return notion_id

#Updating Zotero Item types from triples when creating the url object
def get_url_zotero_triples(url:str):
    triples_ref = db.collection('triples').where('subject','==',url).where('predicate','==','https://sense-nets.xyz/hasZoteroItemType')

    # Execute the query
    docs = triples_ref.stream()
    triples = []
    # Print the results
    for doc in docs:
        triples.append(doc.to_dict())
        #print(f'{doc.id} => {doc.to_dict()}')
    print(f'query resulted with {len(triples)} triples')
    return triples

def get_zotero_types_from_triples(triples:list):
    types = set(triple["object"] for triple in triples)
    return types

def get_zotero_types_from_url(url:str):
    return get_zotero_types_from_triples(get_url_zotero_triples(url))

#Creating URL pages
def url_notion_lookup(url:str):
    response = notion.databases.query(
        **{
            "database_id": URLS_DATABASE_ID,
            "filter": {
                "property": "URL",  # The property name in Notion
                "url": {
                    "equals": url  # Use 'equals' to match the authorId exactly
                }
            }
        }
    )
    
    # Check if any results are found
    if response["results"]:
        print(f"page found for url: {url}")
        return response["results"][0]["id"]  # Return the first matched profile ID if it exists
    else:
        print(f"No page found for url: {url}")
        return None
    
def create_url_notion_page(url:str):
    print("in create url page")
    types = get_zotero_types_from_url(url)
    response = notion.pages.create(
        **{
            "parent": {"database_id": URLS_DATABASE_ID},
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {"content": url}
                        }
                    ]
                },
                "URL": {
                    "url": url
                },
                "hasZoteroItemType":{
                    "multi_select": [{'name':typ} for typ in types]
                }
            }
        }
    )
    
    print(f"Created new page for URL: {url}")
    return response["id"]  # Return the page ID of the created URL page

#Create Keyword page
def keyword_notion_lookup(keyword:str):
    response = notion.databases.query(
        **{
            "database_id": KEYWORDS_DATABASE_ID,
            "filter": {
                "property": "Name",  # The property name in Notion
                "title": {
                    "equals": keyword  # Use 'equals' to match the authorId exactly
                }
            }
        }
    )
    
    # Check if any results are found
    if response["results"]:
        print(f"page found for keyword: {keyword}")
        return response["results"][0]["id"]  # Return the first matched profile ID if it exists
    else:
        print(f"No page found for keyword: {keyword}")
        return None

def create_keyword_notion_page(keyword:str):
    print("in create page")
    response = notion.pages.create(
        **{
            "parent": {"database_id": KEYWORDS_DATABASE_ID},
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {"content": keyword}
                        }
                    ]
                }
            }
        }
    )
    
    print(f"Created new page for keyword: {keyword}")
    return response["id"]  # Return the page ID of the created URL page

#Concatenate Threads
def get_thread(thread_list:list):
    full_text = ''
    url = thread_list[0]["url"]
    for post_dict in thread_list:
        full_text = f'{full_text} {post_dict["content"]}'
    return full_text,url

def get_post_triples(post_firebase_id:str):
    triples_ref = db.collection('triples').where('postId','==',post_firebase_id).where('predicate','in',props)

    # Execute the query
    docs = triples_ref.stream()
    triples = []
    # Print the results
    for doc in docs:
        triples.append(doc.to_dict())
        #print(f'{doc.id} => {doc.to_dict()}')
    print(f'query resulted with {len(triples)} triples')
    return triples

#RDF properties to filter triples by
props = ['https://sense-nets.xyz/summarizes',
'https://sense-nets.xyz/mentionsCallForPapers',
'https://sense-nets.xyz/endorses',
'http://purl.org/spar/cito/disagreesWith',
'http://purl.org/spar/cito/agreesWith',
'https://sense-nets.xyz/indicatesInterest',
'https://sense-nets.xyz/mentionsFundingOpportunity',
'https://sense-nets.xyz/mentionsWatchingStatus',
'https://sense-nets.xyz/mentionsReadingStatus',
'https://sense-nets.xyz/mentionsListeningStatus',
'http://purl.org/spar/cito/reviews',
'https://sense-nets.xyz/recommends',
'https://sense-nets.xyz/asksQuestionAbout',
'http://purl.org/spar/cito/includesQuotationFrom',
'http://purl.org/spar/cito/discusses',
'https://sense-nets.xyz/announcesEvent',
'https://sense-nets.xyz/announcesJob',
'https://sense-nets.xyz/announcesResource',
'https://sense-nets.xyz/possibleMissingReference',
'http://purl.org/spar/cito/linksTo',
'https://schema.org/keywords']

classes = ['https://sense-nets.xyz/possibleMissingReference',
'https://schema.org/Observation',
'https://schema.org/Claim',
'https://schema.org/Question']

def get_uri_property_name(props:list):
    return [uri.split('/')[-1] for uri in props]

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

def get_classes_list(triples):
    classes_list = []
    for triple in triples:
        classes_list.append(triple["object"])
    return get_uri_property_name(classes_list)

def get_dg_class_triples(post_firebase_id,classes):
    triples_ref = db.collection('triples').where('postId','==',post_firebase_id).where('object','in',classes)

    # Execute the query
    docs = triples_ref.stream()
    triples = []
    # Print the results
    for doc in docs:
        triples.append(doc.to_dict())
        #print(f'{doc.id} => {doc.to_dict()}')
    print(f'dg query resulted with {len(triples)} triples')
    return triples

"""def get_profiles(origin):
    users_ref = db.collection('users')
    if origin == 'bluesky':
        query = users_ref.where('twitter','==',None).where('mastodon','==',None)
    else:
        query = users_ref.where('accounts','==',None)
    docs = query.stream()
    return [(doc.to_dict(),doc.id) for doc in docs]

def load_profiles_to_notion(origin):
    profiles = get_profiles(origin)
    print(f'got {len(profiles)} profiles')
    for p,firebase_id in profiles:
        notion_id = lookup_notion_profile(firebase_id)
        if  not notion_id:
            notion_id = build_base_notion_profile(p,firebase_id)
        return notion_id"""



def convert_timestamp_to_notion_date(createdAtMs):
    # Convert milliseconds to seconds
    timestamp_s = createdAtMs / 1000
    # Convert to a Python datetime object (in UTC)
    dt = datetime.datetime.utcfromtimestamp(timestamp_s)
    # Convert to ISO 8601 format
    return dt.isoformat()  # Notion expects ISO 8601 format

def build_dynamic_postpage_properties(post_dict: dict, post_firebase_id: str):
    post_text, post_url = get_thread(post_dict["generic"]["thread"])
    author_handle = post_dict["generic"]["author"]["username"]
    post_title = create_post_name(post_text, author_handle)
    profile_notion_id = load_profile_to_notion(post_dict["authorProfileId"])
    post_Ms = post_dict["createdAtMs"]
    creation_time =  convert_timestamp_to_notion_date(post_Ms)
    filter_classification = post_dict["originalParsed"]["filter_classification"]
    properties = {
        "Name": {
            "title": [
                {
                    "text": {"content": post_title}
                }
            ]
        },
        "Text": {
            "rich_text": [
                {
                    "text": {"content": post_text[:1900]}
                }
            ]
        },
        "Creators handle": {
            "rich_text": [
                {
                    "text": {"content": author_handle}
                }
            ]
        },
        "firebase_id": {
            "rich_text": [
                {
                    "text": {"content": post_firebase_id}
                }
            ]
        },
        "createdAtMs": {
            "rich_text": [
                {
                    "text": {"content": str(post_Ms)}
                }
            ]
        },
        "Author": {
            "relation": [{"id": profile_notion_id}]
        },
        "Post URL": {
            "url": post_url
            },
        "publish date": {
            "date": {
                "start": creation_time  # Notion date field
            }
        },
        "filter_classification": {
            "select": {
                "name": filter_classification  
            }
        },
        "origin":{
            "select":{"name":post_dict["origin"]}
        }
    }
    

    # Initialize a dictionary to collect multiple relations for each prop_name
    relations = {}
    # Initialize a list for all urls to add under linksTo 
    urls = []
    prop_name_set = set()
    # Get triples from the post
    triples = get_post_triples(post_firebase_id)
    print("got triplets")
    for triple in triples:
        prop_name = triple["predicate"].split('/')[-1]
        
        # Initialize the relation list for each property if it doesn't exist
        if prop_name not in relations:
            relations[prop_name] = []


        # Handle keywords as an example
        if prop_name == "keywords":
            keyword_id = keyword_notion_lookup(triple["object"])
            if not keyword_id:
                keyword_id = create_keyword_notion_page(triple["object"])

            # Append keyword_id to the relations dictionary under the "keywords" key
            relations[prop_name].append({"id": keyword_id})

        else:
            # Handle other relation properties dynamically (e.g., URLs)
            url_id = url_notion_lookup(triple["object"])
            if not url_id:
                url_id = create_url_notion_page(triple["object"])

            # Append the new relation to the corresponding prop_name
            relations[prop_name].append({"id": url_id})
            urls.append({"id": url_id})
            prop_name_set.add(prop_name)
            print(f'prop name set is {prop_name_set}')

    # After processing all triples, update the properties with collected relations
    for prop_name, relation_list in relations.items():
        properties[prop_name] = {"relation": relation_list}
    properties["linksTo"] = {"relation":urls}
    properties["relations tags"] = {"multi_select":[{"name":p} for p in prop_name_set]}
    discourse_types = get_classes_list(get_dg_class_triples(post_firebase_id,classes))
    properties["Discourse Type"] = {"multi_select":[{"name":tp} for tp in discourse_types]}
    return properties

def create_notion_post_page(post_dict:dict,post_firebase_id:str):
    post_text, post_url = get_thread(post_dict["generic"]["thread"])
    author_handle = post_dict["generic"]["author"]["username"]
    post_title = create_post_name(post_text,author_handle)
    response = notion.pages.create(
        **{
            "parent": {"database_id": POSTS_DATABASE_ID},
            "properties": build_dynamic_postpage_properties(post_dict,post_firebase_id)
        }
    )
    print(f"Created new post page for '{post_title}'.")
    return response["id"]  # Return the page ID of the created post page


def create_post_name(post_text,post_handle):
    # Create the post name as "User name : First 10 characters of content"
    return f"{post_handle}: {post_text[:60]}"

# Define a rate limiter (3 requests per second)
RATE_LIMIT = 3
semaphore = Semaphore(RATE_LIMIT)

# Function to handle each post loading task with rate limiting
def load_post(post_dict, post_id):
    with semaphore:  # This ensures no more than 3 requests per second
        if not post_notion_lookup(post_id):
            create_notion_post_page(post_dict, post_id)
            print(f'post page with id {post_id} was loaded to Notion')

        # Sleep to ensure we don’t exceed 3 requests per second
        time.sleep(1 / RATE_LIMIT)

# Function to load posts to Notion in parallel with rate limiting
def load_posts_to_notion(post_tuple_list: list):
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(load_post, post_dict, post_id) for post_dict, post_id in post_tuple_list]

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f'Error occurred: {e}')

"""def load_posts_to_notion(post_tuple_list:list):
    for post_dict, post_id in post_tuple_list:
        if not post_notion_lookup(post_id):
            create_notion_post_page(post_dict,post_id)
            print(f'post page with id {post_id} was loaded to Notion')
"""
def get_posts(count_limit = None,post_platform = None):
    if post_platform:
        posts_ref = db.collection('posts').where("parsedStatus", '==', "processed").where("origin","==",post_platform).limit(count_limit)
        print(f'Getting {post_platform} posts with count limit {count_limit}')
    else:
        posts_ref = db.collection('posts').limit(count_limit)
        print(f'Getting posts from all platforms with count limit {count_limit}')

    # Execute the query
    docs = posts_ref.stream()
    posts = []
    # Print the results
    for doc in docs:
        posts.append((doc.to_dict(),doc.id))
        #print(f'{doc.id} => {doc.to_dict()}')
    print(f'query resulted with {len(posts)} posts')
    return posts

if __name__ == "__main__":

    load_dotenv()

    #Config for the MC4 workspace
    """NOTION_API_TOKEN = os.getenv('NOTION_SENSENETS_TOKEN')
    URLS_DATABASE_ID = os.getenv('NOTION_URLS_DATABASE_ID')
    POSTS_DATABASE_ID = os.getenv('NOTION_POSTS_DATABASE_ID')
    PROFILES_DATABASE_ID =os.getenv('NOTION_PROFILES_DATABASE_ID')
    KEYWORDS_DATABASE_ID = os.getenv("NOTION_KEYWORDS_DATABASE_ID")"""

    #config for SenseNets V1
    """NOTION_API_TOKEN = os.getenv('SN_NOTION_TOKEN')
    URLS_DATABASE_ID = os.getenv('SN_URLS_DATABASE_ID')
    POSTS_DATABASE_ID = os.getenv('SN_POSTS_DATABASE_ID')
    PROFILES_DATABASE_ID =os.getenv('SN_PROFILES_DATABASE_ID')
    KEYWORDS_DATABASE_ID = os.getenv("SN_KEYWORDS_DATABASE_ID")"""

    #config for SenseNets V2 Karthic
    """NOTION_API_TOKEN = os.getenv('SN_NOTION_TOKEN')
    URLS_DATABASE_ID = '135268ae33ab81859df9f6a06209e51d'
    POSTS_DATABASE_ID = '135268ae33ab8129a0fdc454b660a1df'
    PROFILES_DATABASE_ID ='135268ae33ab8152ba96c8f1af87b521'
    KEYWORDS_DATABASE_ID = "135268ae33ab81f5b44cde287f3eafc1"
"""
    #config for DeSci
    NOTION_API_TOKEN = os.getenv('SN_NOTION_TOKEN')
    URLS_DATABASE_ID = '138268ae33ab81f8acf8d858e5f23d70'
    POSTS_DATABASE_ID = '138268ae33ab814d836cda75ff2a00ac'
    PROFILES_DATABASE_ID ='138268ae33ab812cba3bd2e99428470f'
    KEYWORDS_DATABASE_ID = '138268ae33ab81c2a34cca19959d4127'

    notion = Client(auth=NOTION_API_TOKEN)

    #Initiate firebase client
    cred = credentials.Certificate('nlp/scripts/creds/sensenets-dataset-firebase-adminsdk-rpero-9c552cac56.json')
    firebase_admin.initialize_app(cred)

    # Initialize Firestore DB
    db = firestore.client()

    arguments = docopt.docopt(__doc__)

    post_count_limit = arguments.get("--count")

    post_platform = arguments.get("--origin")

    print("got arg")
    if post_count_limit:
        post_count_limit = int(post_count_limit)
    else:
        post_count_limit = None
    
    print(f'limit to {post_count_limit} posts')

    #load_profiles_to_notion(post_platform)

    posts = get_posts(post_count_limit,post_platform)

    load_posts_to_notion(posts)


