import {CollectionLike} from "../base/CollectionLike";
import {SyncWalker} from "../base/SyncWalker";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";

export class FirestoreSyncWalker extends SyncWalker {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }

  public eachCollection(block: (collection: CollectionLike) => void): void {
    throw new Error('Not implemented: FirestoreSyncWalker#eachCollection');
  }
}
