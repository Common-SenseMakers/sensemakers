#!/bin/bash

# Check if the correct number of arguments is provided (minimum 1, maximum 2)
if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
    echo "Usage: $0 <username> [userId]"
    exit 1
fi

# Assign command-line arguments to variables
USERNAME=$1
USER_ID=$2

# Build the curl command with required arguments
CURL_COMMAND="curl -X POST http://127.0.0.1:5001/demo-sensenets/us-central1/api/auth/twitter/signup \
-H \"Content-Type: application/json\" \
-d '{
  \"username\": \"${USERNAME}\",
  \"isGhost\": true
}'"

# If the userId is provided, append the header to the curl command
if [ -n "$USER_ID" ]; then
    CURL_COMMAND="curl -X POST http://127.0.0.1:5001/demo-sensenets/us-central1/api/auth/twitter/signup \
-H \"Content-Type: application/json\" \
-H \"userId: $USER_ID\" \
-d '{
  \"username\": \"${USERNAME}\",
  \"isGhost\": true
}'"
fi

# Execute the constructed curl command
eval $CURL_COMMAND
