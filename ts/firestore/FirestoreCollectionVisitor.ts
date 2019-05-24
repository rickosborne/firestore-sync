import {CollectionVisitor} from "../base/CollectionVisitor";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";

export class FirestoreCollectionVisitor extends CollectionVisitor {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }
}
