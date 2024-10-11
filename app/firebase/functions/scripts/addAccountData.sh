#!/bin/bash

# Initialize variables with default values
USERNAME=""
PLATFORM_ID=""
AMOUNT=""
LATEST=""
USER_ID=""
ADMIN_KEY=""

# Parse command-line arguments using flags
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --username) USERNAME="$2"; shift ;;
        --platformId) PLATFORM_ID="$2"; shift ;;
        --amount) AMOUNT="$2"; shift ;;
        --latest) LATEST="$2"; shift ;;
        --userId) USER_ID="$2"; shift ;;
        --adminKey) ADMIN_KEY="$2"; shift ;;  # Admin key flag
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Check if required parameters are provided
if [[ -z "$USERNAME" || -z "$PLATFORM_ID" || -z "$AMOUNT" || -z "$ADMIN_KEY" ]]; then
    echo "Usage: $0 --username <username> --platformId <platformId> --amount <amount> --adminKey <adminKey> [--latest <latest>]"
    exit 1
fi

# Build the JSON body
JSON_BODY="{
  \"username\": \"$USERNAME\",
  \"platformId\": \"$PLATFORM_ID\",
  \"amount\": $AMOUNT"

# Append optional parameters to the JSON body if provided
if [ -n "$LATEST" ]; then
    JSON_BODY+=", \"latest\": $LATEST"
fi

# Close the JSON body
JSON_BODY+="}"

# Execute the curl command with the constructed JSON body and admin key
curl -X POST https://us-central1-sensenets-dataset.cloudfunctions.net/admin/addAccountData \
-H "Content-Type: application/json" \
-H "admin-api-key: $ADMIN_KEY" \
-d "$JSON_BODY"