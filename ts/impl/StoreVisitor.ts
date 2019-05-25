import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {ReadableStore} from "../base/ReadableStore";
import {StoreLike} from "../base/StoreLike";
import {WritableCollectionLike} from "../base/WritableCollectionLike";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {WritableStore} from "../base/WritableStore";
import {WritableStoreLike} from "../base/WritableStoreLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {CollectionVisitor} from "./CollectionVisitor";
import {Visitor} from "./Visitor";

export class StoreVisitor extends Visitor<StoreLike, WritableStoreLike> {
  constructor(
    private readonly readStore: ReadableStore<CollectionLike<any>, DocumentLike>,
    private readonly writeStore: WritableStore<CollectionLike<any>, WritableCollectionLike<any, any>, DocumentLike, WritableDocumentLike>,
    private readonly config: FirestoreSyncProfileOperationAdapter,
    id: string,
  ) {
    super(config.logger, id);
  }

  public async getCollectionVisitors(): Promise<CollectionVisitor[]> {
    const readCollections = await this.readStore.getReadableCollections();
    const writeCollections = await this.writeStore.getWritableCollections();
    return this.merge(
      readCollections,
      writeCollections,
      (writable) => this.readStore.buildEmptyReadableCollection(writable),
      (readable) => this.writeStore.buildEmptyWritableCollection(readable),
      (r, w) => new CollectionVisitor(this.config, r, w),
    );
  }
}
