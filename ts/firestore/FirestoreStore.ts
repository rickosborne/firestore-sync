import * as admin from 'firebase-admin';
import {CollectionLike} from "../base/CollectionLike";
import {Logger, WithLogger} from "../base/Logger";
import {ReadableStore} from "../base/ReadableStore";
import {WritableStore} from "../base/WritableStore";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {notImplemented} from "../impl/NotImplemented";
import {FirestoreCollection, WritableFirestoreCollection} from "./FirestoreCollection";
import {FirestoreDocument, WritableFirestoreDocument} from "./FirestoreDocument";

export class FirestoreStore implements ReadableStore<FirestoreCollection, FirestoreDocument>, WithLogger {
  protected readonly firestore: FirebaseFirestore.Firestore;
  public readonly logger: Logger;

  public get exists(): Promise<boolean> {
    return this.firestore.runTransaction(() => Promise.resolve(true));
  }

  constructor(
    public readonly id: string,
    private readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
    this.logger = config.logger;
    this.firestore = admin.initializeApp({
      credential: admin.credential.cert(config.profile.serviceAccountKeyPath),
      databaseURL: config.profile.databaseURL,
    }).firestore();
  }

  public buildEmptyReadableCollection(writableCollection: CollectionLike<any>): FirestoreCollection {
    return new FirestoreCollection(this.firestore.collection(writableCollection.id), this.logger);
  }

  public async getReadableCollections(): Promise<FirestoreCollection[]> {
    const firestoreCollections = await this.firestore.listCollections();
    return firestoreCollections.map((collectionRef) => new FirestoreCollection(collectionRef, this.logger));
  }
}

// tslint:disable-next-line
export class FirestoreWriter extends FirestoreStore
  implements WritableStore<FirestoreCollection, WritableFirestoreCollection, FirestoreDocument, WritableFirestoreDocument> {
  constructor(
    id: string,
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(id, config);
  }

  public buildEmptyWritableCollection(collection: CollectionLike<any>): WritableFirestoreCollection {
    return new WritableFirestoreCollection(this.firestore.collection(collection.id), this.logger);
  }

  public createCollection(collection: CollectionLike<any>): void {
    notImplemented(this, 'createCollection');
  }

  public async getWritableCollections(): Promise<WritableFirestoreCollection[]> {
    const firestoreCollections = await this.firestore.listCollections();
    return firestoreCollections.map((collectionRef) => new WritableFirestoreCollection(collectionRef, this.logger));
  }

  public async updateFrom(item: ReadableStore<FirestoreCollection, FirestoreDocument>): Promise<void> {
    notImplemented(this, 'updateFrom');
  }
}
