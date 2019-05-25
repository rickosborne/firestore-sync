import * as admin from "firebase-admin";
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {buildReadablePropertyLike, buildWritablePropertyLike} from "../impl/PropertyLikeBuilder";

export class FirestoreDocument implements DocumentLike, WithLogger {
  protected dataPromise?: Promise<admin.firestore.DocumentData | undefined>;
  public readonly id: string;
  protected snapshotPromise?: Promise<admin.firestore.DocumentSnapshot>;

  protected get data(): Promise<admin.firestore.DocumentData | undefined> {
    if (this.dataPromise == null) {
      this.dataPromise = this.snapshot.then((snapshot) => snapshot.data());
    }
    return this.dataPromise;
  }

  protected get snapshot(): Promise<admin.firestore.DocumentSnapshot> {
    if (this.snapshotPromise == null) {
      this.snapshotPromise = this.documentRef.get();
    }
    return this.snapshotPromise;
  }

  constructor(
    private readonly documentRef: admin.firestore.DocumentReference,
    public readonly logger: Logger,
  ) {
    this.id = documentRef.id;
  }

  public buildEmptyReadableProperty(property: PropertyLike): PropertyLike {
    return property.buildEmptyReadableProperty();
  }

  public async getReadableProperties(): Promise<PropertyLike[]> {
    const data = await this.data;
    if (data == null) {
      return [];
    }
    return buildReadablePropertyLike(this.id + ':', data, this.logger);
  }

}

// tslint:disable-next-line:max-classes-per-file
export class WritableFirestoreDocument extends FirestoreDocument implements WritableDocumentLike {
  constructor(
    documentRef: admin.firestore.DocumentReference,
    logger: Logger,
  ) {
    super(documentRef, logger);
  }

  public buildEmptyWritableProperty(property: PropertyLike): WritablePropertyLike {
    return property.buildEmptyWritableProperty();
  }

  public async getWritableProperties(): Promise<WritablePropertyLike[]> {
    const data = await this.data;
    if (data == null) {
      return [];
    }
    return buildWritablePropertyLike(this.id + ':', data, this.logger);
  }
}
