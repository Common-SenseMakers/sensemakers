import os
from dotenv import load_dotenv

# Determine the environment and choose the appropriate .env file
environment = os.getenv('ENVIRONMENT', 'development')  # Default to 'development' if not set

if environment == 'production':
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env.prod')
elif environment == 'staging's:
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env.staging')
else:
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')  # Default to .env for development

# Load the environment variables from the chosen file
load_dotenv(dotenv_path)

openai_api_key = os.environ.get("OPENROUTER_API_KEY")