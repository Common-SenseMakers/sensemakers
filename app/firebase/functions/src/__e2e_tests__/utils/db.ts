import { getFirestore } from "firebase-admin/firestore";

export const resetDB = async () => {
  /** DO NOT DELETE */
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      "Test can only run on emulator. It will delete all current data"
    );
  }

  if (!process.env.FIRESTORE_EMULATOR_HOST.includes('localhost')) {
    throw new Error(
      "Test can only run on emulator. It will delete all current data"
    );
  }

  const db = getFirestore();
 
  const collections = await db.listCollections();
  await Promise.all(
    collections.map(async (collection) => {
      return db.recursiveDelete(collection)
    })
  );
};
