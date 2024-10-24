import fs from 'fs';
import axios from 'axios';
import { AddUserDataPayload } from '../src/@shared/types/types.fetch';

const API_URL = 'https://us-central1-sensenets-dataset.cloudfunctions.net/admin/addAccountData';
const ADMIN_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_KEY) {
  console.error('ADMIN_API_KEY environment variable is not set');
  process.exit(1);
}

async function addAccountData(payload: AddUserDataPayload) {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'admin-api-key': ADMIN_KEY
      }
    });
    console.log(`Successfully added account data for ${payload.username}`);
    return response.data;
  } catch (error) {
    console.error(`Error adding account data for ${payload.username}:`, error.response?.data || error.message);
  }
}

async function processUserDataPayloads() {
  try {
    const rawData = fs.readFileSync('user-data-payloads.json', 'utf-8');
    const payloads: AddUserDataPayload[] = JSON.parse(rawData);

    for (const payload of payloads) {
      await addAccountData(payload);
    }

    console.log('Finished processing all user data payloads');
  } catch (error) {
    console.error('Error processing user data payloads:', error);
  }
}

processUserDataPayloads();
