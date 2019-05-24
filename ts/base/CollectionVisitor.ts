import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {CollectionLike} from "./CollectionLike";

export abstract class CollectionVisitor {

  protected constructor(
    public readonly config: FirestoreSyncProfileOperationAdapter,
  ) {}

  public visiting(readCollection: CollectionLike | undefined, writeCollection: CollectionLike | undefined, block: () => void) {
    block();
  }
}
