/**
 * This is a script for adding non-user accounts to whichever firebase project you want to add them to
 * You will need the following environment variables:
 * - FUNCTIONS_URL: the URL of the function that will add the accounts. I.e. https://us-central1-{firebase-project}.cloudfunctions.net
 * - ADMIN_API_KEY: the admin API key for the admin functions
 * - ACCOUNTS_FILE_PATH: the path to the JSON file containing the profile urls of the accounts you want to add.
 * - It should be structured as an array of strings.
 * - e.g. ["https://bsky.app/profile/wesleyfinck.org", "https://x.com/rtk254", ...]
 */
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

import { callAddProfiles } from '../scripts.utils';

dotenv.config({ path: './scripts/.script.env' });

const FUNCTION_URL = process.env.FUNCTIONS_URL as string;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY as string;
const ACCOUNTS_FILE_PATH = process.env.ACCOUNTS_FILE_PATH;

if (!ADMIN_API_KEY) {
  console.error('ADMIN_API_KEY environment variable is not set');
  process.exit(1);
}

async function processUserDataPayloads() {
  try {
    if (!ACCOUNTS_FILE_PATH) {
      console.error('ACCOUNTS_FILE_PATH environment variable is not set');
      process.exit(1);
    }
    const rawData = fs.readFileSync(ACCOUNTS_FILE_PATH, 'utf-8');
    const profiles: string[] = JSON.parse(rawData);

    await callAddProfiles(profiles, FUNCTION_URL, ADMIN_API_KEY);

    console.log('Finished processing all user data payloads');
  } catch (error: any) {
    console.error('Error processing user data payloads:', error);
  }
}

processUserDataPayloads();
