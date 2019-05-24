import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {StoreLike} from "../base/StoreLike";

import * as admin from 'firebase-admin';
import {FirestoreCollection} from "./FirestoreCollection";

export class FirestoreClient extends StoreLike {
  protected readonly firestore: FirebaseFirestore.Firestore;

  constructor() {
    super();
    this.firestore = admin.initializeApp().firestore();
  }

  public withCollection(collection: CollectionLike, block: (collection: CollectionLike) => void): void {
    const collectionId = collection.id;
    const collectionRef: admin.firestore.CollectionReference = this.firestore.collection(collectionId);
    block(new FirestoreCollection(collectionId, collectionRef));
  }

  public withDocument(collection: CollectionLike, documentId: string, block: (document: DocumentLike) => void): void {
    throw new Error('Not implemented: FirestoreClient#withDocument');
  }
}
