import {CollectionVisitor} from "../base/CollectionVisitor";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";

export class FilesystemCollectionVisitor extends CollectionVisitor {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }
}
