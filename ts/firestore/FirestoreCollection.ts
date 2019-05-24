import * as admin from "firebase-admin";
import {CollectionLike} from "../base/CollectionLike";
import {FirestoreDocument} from "./FirestoreDocument";

export class FirestoreCollection implements CollectionLike<FirestoreDocument> {
  constructor(
    public readonly id: string,
    public readonly collectionRef: admin.firestore.CollectionReference,
  ) {
  }

  public withDocument(id: string, block: (document: FirestoreDocument) => void): void {
    this.collectionRef.doc(id).get().then((readDocument) => {
      block(new FirestoreDocument(readDocument.data()));
    });
  }

  public withDocumentIds(block: (documentIds: string[]) => void): void {
    this.collectionRef.listDocuments().then((documentRefs) => {
      const ids = documentRefs.map((documentRef) => documentRef.id);
      block(ids);
    });
  }

}
