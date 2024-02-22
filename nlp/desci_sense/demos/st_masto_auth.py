"""
Simple code to demo Mastodon OAuth in streamlit

"""
import streamlit as st
from mastodon import Mastodon

from desci_sense.configs import environ

# Environment variables must be set with your Mastodon application id and secret
api_base_url = "https://mastodon.social/"
client_id = environ["MASTO_CLIENT_ID"]
client_secret = environ["MASTO_CLIENT_SECRET"]
redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
# redirect_uri = "http://localhost:8501"  # Your redirect URI

# Initialize Mastodon
mastodon = Mastodon(
    client_id=client_id, client_secret=client_secret, api_base_url=api_base_url
)

# Generate authentication URL
auth_request_url = mastodon.auth_request_url(
    scopes=["read", "write", "follow"], redirect_uris=redirect_uri
)

# initializing session state vars

if "access_token" not in st.session_state:
    st.session_state["access_token"] = None

if "passed_authentication_stage" not in st.session_state:
    st.session_state["passed_authentication_stage"] = False

if "user_masto_api" not in st.session_state:
    st.session_state["user_masto_api"] = None

# app

st.title("Mastodon Authentication App")

if st.button("Authenticate with Mastodon"):
    st.markdown(
        f"[Authenticate with Mastodon]({auth_request_url})", unsafe_allow_html=True
    )


authorization_code = st.text_input("Enter the authorization code here")

if authorization_code and not st.session_state["passed_authentication_stage"]:
    try:
        access_token = mastodon.log_in(
            code=authorization_code,
            redirect_uri=redirect_uri,
            scopes=["read", "write", "follow"],
        )
        st.success("Authentication Successful!")
        st.session_state["access_token"] = access_token
        st.session_state["passed_authentication_stage"] = True
        # You can now use the access_token to make Mastodon API calls

    except Exception as e:
        st.error(f"Authentication failed: {e}")

# else:
#     st.stop()


if not st.session_state["user_masto_api"] and st.session_state["access_token"]:
    m = Mastodon(
        api_base_url=api_base_url, access_token=st.session_state["access_token"]
    )
    st.session_state["created_user_masto_api"] = m

# Posting to Mastodon
post = st.text_area("Write your post:")
if st.button("Post to Mastodon"):
    st.session_state["created_user_masto_api"].toot(f"{post}")
    st.success("Posted successfully!")
