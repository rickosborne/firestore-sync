import {CollectionLike} from "../base/CollectionLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {Visitor} from "./Visitor";

export class CollectionVisitor extends Visitor<CollectionLike<any>> {
  public constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(
      'collection',
      config.createCollections,
      config.updateCollections,
      config.deleteCollections,
      config.logSkips,
      config.logger,
    );
  }
}
