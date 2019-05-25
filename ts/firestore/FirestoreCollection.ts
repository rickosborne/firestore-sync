import * as admin from "firebase-admin";
import {CollectionLike} from "../base/CollectionLike";
import {FirestoreDocument} from "./FirestoreDocument";

export class FirestoreCollection implements CollectionLike<FirestoreDocument> {
  constructor(
    public readonly id: string,
    public readonly collectionRef: admin.firestore.CollectionReference,
  ) {
  }

  public async getDocuments(): Promise<FirestoreDocument[]> {
    throw new Error('Not implemented: FirestoreCollection#getDocuments');
  }
}
