import * as admin from "firebase-admin";
import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {WritableCollectionLike} from "../base/WritableCollectionLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {notImplemented} from "../impl/NotImplemented";
import {FirestoreDocument, WritableFirestoreDocument} from "./FirestoreDocument";

export class FirestoreCollection implements CollectionLike<FirestoreDocument>, WithLogger {
  protected querySnapshotPromise?: Promise<admin.firestore.QuerySnapshot>;

  public get dryRun(): boolean {
    return this.config.dryRun;
  }

  public get exists(): Promise<boolean> {
    return this.querySnapshot.then((snap) => snap.size > 0).catch(() => false);
  }

  public get id(): string {
    return this.collectionRef.id;
  }

  public get logger(): Logger {
    return this.config.logger;
  }

  public get path(): string {
    return this.collectionRef.path;
  }

  protected get querySnapshot(): Promise<admin.firestore.QuerySnapshot> {
    if (this.querySnapshotPromise == null) {
      this.querySnapshotPromise = this.collectionRef.get();
    }
    return this.querySnapshotPromise;
  }

  constructor(
    public readonly collectionRef: admin.firestore.CollectionReference,
    protected readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
  }

  public buildEmptyReadableDocument(document: DocumentLike): FirestoreDocument {
    return new FirestoreDocument(this.collectionRef.doc(document.id), this.config);
  }

  public async getDocuments(): Promise<FirestoreDocument[]> {
    const documentRefs = await this.collectionRef.listDocuments();
    return documentRefs.map((documentRef) => new FirestoreDocument(documentRef, this.config));
  }
}

// tslint:disable-next-line
export class WritableFirestoreCollection extends FirestoreCollection implements WritableCollectionLike<FirestoreDocument, WritableFirestoreDocument> {
  public buildEmptyWritableDocument(readableDocument: DocumentLike): WritableFirestoreDocument {
    return new WritableFirestoreDocument(this.collectionRef.doc(readableDocument.id), this.config);
  }

  public async getDocuments(): Promise<WritableFirestoreDocument[]> {
    const documentRefs = await this.collectionRef.listDocuments();
    return documentRefs.map((documentRef) => new WritableFirestoreDocument(documentRef, this.config));
  }

  public async updateFrom(collection: CollectionLike<any>): Promise<void> {
    notImplemented(this, 'updateFrom');
  }
}
