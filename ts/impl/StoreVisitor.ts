import {ReadableStore} from "../base/ReadableStore";
import {StoreLike} from "../base/StoreLike";
import {WritableStore} from "../base/WritableStore";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {CollectionVisitor} from "./CollectionVisitor";
import {Visitor} from "./Visitor";

export class StoreVisitor extends Visitor<StoreLike> {
  constructor(
    private readonly readStore: ReadableStore<any, any>,
    private readonly writeStore: WritableStore<any, any>,
    private readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
    super('store', true, true, false, true, config.logger, '');
  }

  public async getCollectionVisitors(): Promise<CollectionVisitor[]> {
    const readCollections = await this.readStore.getCollections();
    const writeCollections = await this.readStore.getCollections();
    return this.merge(readCollections, writeCollections, (r, w) => new CollectionVisitor(this.config, r, w));
  }
}
