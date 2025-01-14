/**
 * This is a script for adding non-user accounts to whichever firebase project you want to add them to
 * You will need the following environment variables:
 * - FUNCTIONS_URL: the URL of the function that will add the accounts. I.e. https://us-central1-{firebase-project}.cloudfunctions.net
 * - ADMIN_API_KEY: the admin API key for the admin functions
 * - ./seed/output folder should include one csv file per cluster.
 * - It should be structured as an array of strings.
 * - e.g. ["https://bsky.app/profile/wesleyfinck.org", "https://x.com/rtk254", ...]
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { callAddProfiles } from '../scripts/scripts.utils';

dotenv.config({ path: './seed/.env.seed' });

const FUNCTION_URL = process.env.FUNCTIONS_URL as string;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY as string;

if (!ADMIN_API_KEY) {
  console.error('ADMIN_API_KEY environment variable is not set');
  process.exit(1);
}

async function processUserDataPayloads() {
  try {
    const files = fs.readdirSync('./seed/output');
    const csvFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === '.csv'
    );

    for (const clusterFile of csvFiles) {
      const fileContent = fs.readFileSync(
        `./seed/output/${clusterFile}`,
        'utf-8'
      );
      const rows = fileContent.split('\n'); // Split content by newline
      const profiles = rows
        .slice(1) // Skip the header row
        .map((row) => row.trim()) // Remove extra whitespace
        .filter((row) => row !== ''); // Remove empty rows

      const clusterName = clusterFile.slice(0, -4);

      const confirmed = true;
      // const confirmed = await askForConfirmation(
      //   `You will add ${profiles.length} profiles to cluster "${clusterName}". Do you want to continue?`
      // );

      if (confirmed) {
        await callAddProfiles(
          { profilesUrls: profiles, cluster: clusterName },
          FUNCTION_URL,
          ADMIN_API_KEY
        );
      }
    }

    console.log('Finished processing all user data payloads');
  } catch (error: any) {
    console.error('Error processing user data payloads:', error);
  }
}

processUserDataPayloads();
