import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './scripts/.script.env' });

const FUNCTION_URL = process.env.FUNCTION_URL;
const ADMIN_KEY = process.env.ADMIN_API_KEY;
const OPEN_SCIENCE_ACCOUNTS_PATH = process.env.OPEN_SCIENCE_ACCOUNTS_PATH;

if (!ADMIN_KEY) {
  console.error('ADMIN_API_KEY environment variable is not set');
  process.exit(1);
}

async function addAccountData(payload: string[]) {
  try {
    if (!FUNCTION_URL) {
      console.error('FUNCTION_URL environment variable is not set');
      process.exit(1);
    }
    const response = await axios.post(FUNCTION_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'admin-api-key': ADMIN_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error.message);
  }
}

async function processUserDataPayloads() {
  try {
    if (!OPEN_SCIENCE_ACCOUNTS_PATH) {
      console.error(
        'OPEN_SCIENCE_ACCOUNTS_PATH environment variable is not set'
      );
      process.exit(1);
    }
    const rawData = fs.readFileSync(OPEN_SCIENCE_ACCOUNTS_PATH, 'utf-8');
    const payloads: string[] = JSON.parse(rawData);

    await addAccountData(payloads);

    console.log('Finished processing all user data payloads');
  } catch (error: any) {
    console.error('Error processing user data payloads:', error);
  }
}

processUserDataPayloads();
