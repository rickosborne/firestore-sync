import {CollectionLike} from "../base/CollectionLike";
import {WritableStore} from "../base/WritableStore";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {FilesystemCollection} from "./FilesystemCollection";
import {FilesystemDocument} from "./FilesystemDocument";
import {FilesystemReader} from "./FilesystemReader";

export class FilesystemWriter extends FilesystemReader implements WritableStore<FilesystemCollection, FilesystemDocument> {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }

  public createCollection(collection: CollectionLike<any>): void {
    throw new Error('Not implemented: FilesystemWriter#createCollection');
  }
}
