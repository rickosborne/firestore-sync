import {ReadableStore} from "../base/ReadableStore";

import * as admin from 'firebase-admin';
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {FirestoreCollection} from "./FirestoreCollection";
import {FirestoreDocument} from "./FirestoreDocument";

export class FirestoreReader implements ReadableStore<FirestoreCollection, FirestoreDocument> {
  protected readonly firestore: FirebaseFirestore.Firestore;

  constructor(
    private readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
    this.firestore = admin.initializeApp().firestore();
  }

  public getCollections(): Promise<FirestoreCollection[]> {
    throw new Error('Not implemented: FirestoreReader#getCollections');
  }
}
