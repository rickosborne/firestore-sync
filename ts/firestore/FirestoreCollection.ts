import * as admin from "firebase-admin";
import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {WritableCollectionLike} from "../base/WritableCollectionLike";
import {FirestoreDocument, WritableFirestoreDocument} from "./FirestoreDocument";

export class FirestoreCollection implements CollectionLike<FirestoreDocument>, WithLogger {
  public readonly id: string;

  constructor(
    public readonly collectionRef: admin.firestore.CollectionReference,
    public readonly logger: Logger,
  ) {
    this.id = collectionRef.id;
  }

  public buildEmptyReadableDocument(document: DocumentLike): FirestoreDocument {
    return new FirestoreDocument(this.collectionRef.doc(document.id), this.logger);
  }

  public async getDocuments(): Promise<FirestoreDocument[]> {
    const documentRefs = await this.collectionRef.listDocuments();
    return documentRefs.map((documentRef) => new FirestoreDocument(documentRef, this.logger));
  }
}

// tslint:disable-next-line
export class WritableFirestoreCollection extends FirestoreCollection implements WritableCollectionLike<FirestoreDocument, WritableFirestoreDocument> {
  public buildEmptyWritableDocument(readableDocument: DocumentLike): WritableFirestoreDocument {
    return new WritableFirestoreDocument(this.collectionRef.doc(readableDocument.id), this.logger);
  }

  public async getDocuments(): Promise<WritableFirestoreDocument[]> {
    const documentRefs = await this.collectionRef.listDocuments();
    return documentRefs.map((documentRef) => new WritableFirestoreDocument(documentRef, this.logger));
  }
}
