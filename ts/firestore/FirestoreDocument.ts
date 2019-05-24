import * as admin from "firebase-admin";
import {DocumentLike} from "../base/DocumentLike";

export class FirestoreDocument implements DocumentLike {
  constructor(
    public readonly id: string,
    protected readonly data: admin.firestore.DocumentData | undefined,
  ) {
  }

}
