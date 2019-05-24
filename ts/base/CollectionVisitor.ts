import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {CollectionLike} from "./CollectionLike";
import {ReadableStore} from "./ReadableStore";

export abstract class CollectionVisitor {

  protected constructor(
    public readonly config: FirestoreSyncProfileOperationAdapter,
  ) {}

  public visit(
    readCollection: CollectionLike<any> | undefined,
    writeCollection: CollectionLike<any> | undefined,
    writeStore: ReadableStore<any, any>,
    block: () => void,
  ) {
    block();
  }
}
