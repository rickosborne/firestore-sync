import {CollectionLike} from "../base/CollectionLike";
import {WritableStore} from "../base/WritableStore";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {FirestoreCollection} from "./FirestoreCollection";
import {FirestoreDocument} from "./FirestoreDocument";
import {FirestoreReader} from "./FirestoreReader";

export class FirestoreWriter extends FirestoreReader implements WritableStore<FirestoreCollection, FirestoreDocument> {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }

  public createCollection(collection: CollectionLike<any>): void {
    throw new Error('Not implemented: FirestoreWriter#createCollection');
  }
}
