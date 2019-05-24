import * as admin from "firebase-admin";
import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {FirestoreDocument} from "./FirestoreDocument";

export class FirestoreCollection implements CollectionLike {
  constructor(
    public readonly id: string,
    public readonly collectionRef: admin.firestore.CollectionReference,
  ) {
  }

  public withDocument(id: string, block: (document: DocumentLike) => void): void {
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
