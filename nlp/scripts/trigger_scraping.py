import json
import requests
import argparse
import os
from dotenv import load_dotenv
# Boolean constant for ghosting feature
IS_GHOST = True

def scrape_posts_for_users(users, admin_key):
    for user in users:
        # Build the JSON body
        data = {
            "username": user["username"],  # excludes the '@' character
            "platformId": user["platformId"],  # "twitter" or "mastodon"
            "amount": user["amount"],  # the number of threads you want to fetch from the platform
            "isGhost": IS_GHOST  # should always be true
        }

        # Add optional parameters if they are provided
        if "mastodonServer" in user and user["mastodonServer"]:
            data["mastodonServer"] = user["mastodonServer"]  # e.g. 'mastodon.social'
        
        if "latest" in user and user["latest"]:
            data["latest"] = user["latest"]  # fetch latest posts if true

        if "userId" in user and user["userId"]:
            data["userId"] = user["userId"]  # optional user ID

        # Convert the dictionary to a JSON string
        json_body = json.dumps(data)

        # Define the headers
        headers = {
            "Content-Type": "application/json",
            "admin-api-key": admin_key  # your admin key for authentication
        }

        # Execute the POST request
        response = requests.post(
            'https://us-central1-sensenets-dataset.cloudfunctions.net/admin/addUserData',
            headers=headers,
            data=json_body
        )

        # Handle the response
        if response.status_code == 200:
            print(f"Success for {user['username']}:", response.json())
        else:
            print(f"Failed for {user['username']} with status code {response.status_code}: {response.text}")

if __name__ == "__main__":
    # Parse the arguments
    load_dotenv()
    admin_key = os.getenv('FIREBASE_ADMIN_API_KEY')
    parser = argparse.ArgumentParser(description="Scrape posts for multiple users from a JSON file")
    parser.add_argument("--jsonFile", required=True, help="Path to the JSON file containing users' data")

    args = parser.parse_args()

    # Load users data from the JSON file
    with open(args.jsonFile, 'r') as file:
        users = json.load(file)
    #users = json.load('nlp/scripts/data/profile_list.json')

    # Call the function to scrape posts for all users in the JSON
    scrape_posts_for_users(users, admin_key)
