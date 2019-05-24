import {CollectionLike} from "../base/CollectionLike";
import {ReadableStore} from "../base/ReadableStore";

import * as admin from 'firebase-admin';
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {FirestoreCollection} from "./FirestoreCollection";
import {FirestoreDocument} from "./FirestoreDocument";

export class FirestoreReader implements ReadableStore<FirestoreCollection, FirestoreDocument> {
  protected readonly firestore: FirebaseFirestore.Firestore;

  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    this.firestore = admin.initializeApp().firestore();
  }

  public withCollection(collection: CollectionLike<any>, block: (collection?: FirestoreCollection) => void): void {
    const collectionId = collection.id;
    const collectionRef: admin.firestore.CollectionReference = this.firestore.collection(collectionId);
    block(new FirestoreCollection(collectionId, collectionRef));
  }

  public withCollections(block: (readCollections: FirestoreCollection[]) => void): void {
    throw new Error('Not implemented: FirestoreClient#withCollections');
  }

  public withDocument(collection: CollectionLike<any>, documentId: string, block: (document?: FirestoreDocument) => void): void {
    throw new Error('Not implemented: FirestoreClient#withDocument');
  }
}
