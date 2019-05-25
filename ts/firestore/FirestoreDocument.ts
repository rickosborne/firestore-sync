import * as admin from "firebase-admin";
import {DocumentLike} from "../base/DocumentLike";
import {PropertyLike} from "../impl/PropertyLike";

export class FirestoreDocument implements DocumentLike {
  constructor(
    public readonly id: string,
    protected readonly data: admin.firestore.DocumentData | undefined,
  ) {
  }

  public async getProperties(): Promise<PropertyLike[]> {
    throw new Error('Not implemented: FirestoreDocument#getProperties');
  }

}
