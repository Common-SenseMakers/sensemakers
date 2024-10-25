import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

import { AddUserDataPayload } from '../src/@shared/types/types.fetch';

dotenv.config({ path: './scripts/.script.env' });

const API_URL =
  'https://us-central1-sensenets-dataset.cloudfunctions.net/admin/addAccountsData';
const ADMIN_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_KEY) {
  console.error('ADMIN_API_KEY environment variable is not set');
  process.exit(1);
}

async function addAccountData(payload: AddUserDataPayload[]) {
  try {
    const response = await axios.post(API_URL, payload, {
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
    const rawData = fs.readFileSync('user-data-payloads.json', 'utf-8');
    const payloads: AddUserDataPayload[] = JSON.parse(rawData);

    const testData = payloads.slice(0, 2);
    await addAccountData(testData);

    console.log('Finished processing all user data payloads');
  } catch (error: any) {
    console.error('Error processing user data payloads:', error);
  }
}

processUserDataPayloads();
