import { CollectionReference } from 'firebase-admin/firestore';

export interface Cluster {}

export interface ClusterInstance {
  collection(collectionPath: string): CollectionReference;
}
