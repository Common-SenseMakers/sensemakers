#!/bin/bash

# Initialize variables with default values
USERNAME=""
PLATFORM_ID=""
AMOUNT=""
MASTODON_SERVER=""
LATEST=""
USER_ID=""
IS_GHOST=true  # isGhost is hardcoded to true

# Parse command-line arguments using flags
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --username) USERNAME="$2"; shift ;;
        --platformId) PLATFORM_ID="$2"; shift ;;
        --amount) AMOUNT="$2"; shift ;;
        --mastodonServer) MASTODON_SERVER="$2"; shift ;;
        --latest) LATEST="$2"; shift ;;
        --userId) USER_ID="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Check if required parameters are provided
if [[ -z "$USERNAME" || -z "$PLATFORM_ID" || -z "$AMOUNT" ]]; then
    echo "Usage: $0 --username <username> --platformId <platformId> --amount <amount> [--mastodonServer <mastodonServer>] [--latest <latest>] [--userId <userId>]"
    exit 1
fi

# Build the JSON body
JSON_BODY="{
  \"username\": \"$USERNAME\",
  \"platformId\": \"$PLATFORM_ID\",
  \"amount\": $AMOUNT,
  \"isGhost\": $IS_GHOST"

# Append optional parameters to the JSON body if provided
if [ -n "$MASTODON_SERVER" ]; then
    JSON_BODY+=", \"mastodonServer\": \"$MASTODON_SERVER\""
fi

if [ -n "$LATEST" ]; then
    JSON_BODY+=", \"latest\": $LATEST"
fi

if [ -n "$USER_ID" ]; then
    JSON_BODY+=", \"userId\": \"$USER_ID\""
fi

# Close the JSON body
JSON_BODY+="}"

# Execute the curl command with the constructed JSON body
curl -X POST http://127.0.0.1:5001/demo-sensenets/us-central1/api/posts/addUserData \
-H "Content-Type: application/json" \
-d "$JSON_BODY"
