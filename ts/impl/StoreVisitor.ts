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
import {notImplemented} from "./NotImplemented";
import {firstToResolveLike} from "./PromiseUtil";
import {TransactionOp} from "./TransactionOp";
import {Visitor} from "./Visitor";

export class StoreVisitor extends Visitor<StoreLike, WritableStoreLike> {
  protected collectionVisitors?: CollectionVisitor[];

  constructor(
    private readonly readStore: ReadableStore<CollectionLike<any>, DocumentLike>,
    private readonly writeStore: WritableStore<CollectionLike<any>, WritableCollectionLike<any, any>, DocumentLike, WritableDocumentLike>,
    config: FirestoreSyncProfileOperationAdapter,
    id: string,
  ) {
    super(id, '', config);
  }

  protected async applyHasEffect(): Promise<boolean> {
    return this.getCollectionVisitors()
      .then((cvs) => cvs.map((cv) => cv.applyHasEffect()))
      .then((effects) => firstToResolveLike(effects, (effect) => effect))
      .then((effect) => effect === true);
  }

  public async getCollectionVisitors(): Promise<CollectionVisitor[]> {
    if (this.collectionVisitors == null) {
      const readCollections = await this.readStore.getReadableCollections();
      const writeCollections = await this.writeStore.getWritableCollections();
      this.collectionVisitors = this.merge(
        readCollections,
        writeCollections,
        (writable) => this.readStore.buildEmptyReadableCollection(writable),
        (readable) => this.writeStore.buildEmptyWritableCollection(readable),
        (r, w) => new CollectionVisitor(this.config, r, w),
      );
    }
    return this.collectionVisitors;
  }

  public async prepare(): Promise<TransactionOp> {
    return notImplemented(this, 'prepare');
  }
}
