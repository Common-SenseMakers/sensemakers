import fs from 'fs';

import { AddUserDataPayload } from '../../src/@shared/types/types.fetch';
import { IDENTITY_PLATFORM } from '../../src/@shared/types/types.platforms';
import { app } from '../scripts.services';

const firestore = app.firestore();

async function getUserDataPayloads(): Promise<AddUserDataPayload[]> {
  const profilesSnapshot = await firestore.collection('profiles').get();
  const payloads: AddUserDataPayload[] = [];

  for (const doc of profilesSnapshot.docs) {
    const data = doc.data();
    const username = data.profile.username;
    const platformId = data.platformId;

    if (username && platformId) {
      payloads.push({
        username,
        platformId: platformId as IDENTITY_PLATFORM,
        amount: 10,
        latest: true,
      });
    }
  }

  return payloads;
}

(async () => {
  try {
    const payloads = await getUserDataPayloads();
    fs.writeFileSync(
      'user-data-payloads.json',
      JSON.stringify(payloads, null, 2)
    );
  } catch (error) {
    console.error('Error getting user data payloads:', error);
  }
})();
