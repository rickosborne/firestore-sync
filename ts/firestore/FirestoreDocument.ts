import * as admin from "firebase-admin";
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {notImplemented} from "../impl/NotImplemented";
import {buildReadablePropertyLike, buildWritablePropertyLike, DOCUMENT_ROOT_PATH} from "../impl/PropertyLikeBuilder";

export class FirestoreDocument implements DocumentLike, WithLogger {
  protected dataPromise?: Promise<admin.firestore.DocumentData | undefined>;
  public readonly id: string;
  public readonly path: string;
  protected snapshotPromise?: Promise<admin.firestore.DocumentSnapshot>;

  protected get data(): Promise<admin.firestore.DocumentData | undefined> {
    if (this.dataPromise == null) {
      this.dataPromise = this.snapshot.then((snapshot) => snapshot.data());
    }
    return this.dataPromise;
  }

  public get exists(): Promise<boolean> {
    return this.snapshot.then((snap) => snap.exists);
  }

  protected get snapshot(): Promise<admin.firestore.DocumentSnapshot> {
    if (this.snapshotPromise == null) {
      this.snapshotPromise = this.documentRef.get();
    }
    return this.snapshotPromise;
  }

  constructor(
    private readonly documentRef: admin.firestore.DocumentReference,
    public readonly dryRun: boolean,
    public readonly logger: Logger,
  ) {
    this.id = documentRef.id;
    this.path = documentRef.path;
  }

  public buildEmptyReadableProperty(property: PropertyLike): PropertyLike {
    return property.buildEmptyReadableProperty();
  }

  public async getReadableProperties(): Promise<PropertyLike[]> {
    const data = await this.data;
    if (data == null) {
      return [];
    }
    return buildReadablePropertyLike(this.id + ':' + DOCUMENT_ROOT_PATH, this.path, DOCUMENT_ROOT_PATH, data, this.dryRun, this.logger);
  }

  public updateFrom(document: DocumentLike): Promise<void> {
    return notImplemented(this, 'updateFrom');
  }
}

// tslint:disable-next-line:max-classes-per-file
export class WritableFirestoreDocument extends FirestoreDocument implements WritableDocumentLike {
  public buildEmptyWritableProperty(property: PropertyLike): WritablePropertyLike {
    return property.buildEmptyWritableProperty();
  }

  public async getWritableProperties(): Promise<WritablePropertyLike[]> {
    const data = await this.data;
    if (data == null) {
      return [];
    }
    return buildWritablePropertyLike(this.id + ':', this.path, DOCUMENT_ROOT_PATH, data, this.dryRun, this.logger);
  }
}
