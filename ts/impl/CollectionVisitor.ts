import {CollectionLike} from "../base/CollectionLike";
import {identify} from "../base/Identified";
import {Pathed, pathify} from "../base/Pathed";
import {WritableCollectionLike} from "../base/WritableCollectionLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {DocumentVisitor} from "./DocumentVisitor";
import {notImplemented} from "./NotImplemented";
import {firstToResolveLike} from "./PromiseUtil";
import {OpAction, OpApply, TransactionOp} from "./TransactionOp";
import {Visitor} from "./Visitor";

export class CollectionVisitor extends Visitor<CollectionLike<any>, WritableCollectionLike<any, any>> implements Pathed {
  private documentVisitors?: DocumentVisitor[];

  public constructor(
    config: FirestoreSyncProfileOperationAdapter,
    private readonly readCollection: CollectionLike<any>,
    private readonly writeCollection: WritableCollectionLike<any, any>,
  ) {
    super(identify(readCollection, writeCollection), pathify(readCollection, writeCollection), config);
  }

  public async applyHasEffect(): Promise<boolean> {
    if (this.anyEffect != null) {
      return this.anyEffect;
    }
    return this.getDocumentVisitors()
      .then((dvs) => dvs.map((dv) => dv.applyHasEffect()))
      .then((effects) => firstToResolveLike(effects, (effect) => effect))
      .then((effect) => {
        return this.anyEffect = (effect === true);
      });
  }

  protected buildApply(action: OpAction, doAction: boolean, effects: boolean, logAction: boolean): OpApply {
    return this.buildGenericApply(this.readCollection, this.writeCollection, this.config.logSkips, action, doAction, effects, logAction);
  }

  public async commit(): Promise<void> {
    notImplemented(this, 'commit');
  }

  public async getDocumentVisitors(): Promise<DocumentVisitor[]> {
    if (this.documentVisitors == null) {
      const readDocuments = await this.readCollection.getDocuments();
      const writeDocuments = await this.writeCollection.getDocuments();
      this.documentVisitors = this.merge(
        readDocuments,
        writeDocuments,
        (readDocument) => this.readCollection.buildEmptyReadableDocument(readDocument),
        (writeDocument) => this.writeCollection.buildEmptyWritableDocument(writeDocument),
        (r, w) => new DocumentVisitor(this.config, r, w),
      );
    }
    return this.documentVisitors;
  }

  public async prepare(): Promise<TransactionOp> {
    return this.prepareGeneric(
      this.readCollection,
      this.writeCollection,
      this.config.createCollections,
      this.config.updateCollections,
      this.config.deleteCollections,
    );
  }
}
