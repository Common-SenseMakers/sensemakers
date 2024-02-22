import { AppUser, DefinedIfTrue, EthAccountDetails } from '../@shared/types';
import { collections } from '../db/db';

export const getUser = async <T extends boolean>(
  userId: string,
  shouldThrow?: T
): Promise<DefinedIfTrue<T, AppUser>> => {
  const ref = collections.users.doc(userId);
  const doc = await ref.get();
  const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

  if (!doc.exists) {
    if (_shouldThrow) throw new Error(`User ${userId} not found`);
    else return undefined as DefinedIfTrue<T, AppUser>;
  }

  return {
    ...doc.data(),
  } as unknown as DefinedIfTrue<T, AppUser>;
};

export const setUser = async (user: AppUser): Promise<string> => {
  const id = user.userId;
  const docRef = collections.users.doc(id);
  await docRef.set(user, { merge: true });
  return docRef.id;
};

export const setUserEthDetails = async (
  userId: string,
  details: EthAccountDetails
) => {
  const docRef = collections.users.doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`User ${userId} not found`);
  }

  await docRef.set({ eth: details }, { merge: true });
};
