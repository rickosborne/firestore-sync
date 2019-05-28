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
    readCollection: CollectionLike<any>,
    writeCollection: WritableCollectionLike<any, any>,
  ) {
    super(
      identify(readCollection, writeCollection),
      pathify(readCollection, writeCollection),
      readCollection,
      writeCollection,
      config,
    );
  }

  public async applyHasEffect(): Promise<boolean> {
    if (this.anyEffect != null) {
      return this.anyEffect;
    }
    const documentVisitors = await this.getDocumentVisitors();
    const effects = documentVisitors.map((dv) => dv.applyHasEffect());
    const effect = await Promise.all(effects).then((all) => all.indexOf(true) > -1);
    // const effect = await firstToResolveLike(effects, (eff) => eff);
    return (this.anyEffect = (effect === true));
  }

  protected buildApply(action: OpAction, doAction: boolean, effects: boolean, logAction: boolean): OpApply {
    return this.buildGenericApply(this.config.logSkips, action, doAction, effects, logAction);
  }

  public async commit(): Promise<void> {
    notImplemented(this, 'commit');
  }

  public async getDocumentVisitors(): Promise<DocumentVisitor[]> {
    if (this.documentVisitors == null) {
      const readDocuments = await this.readItem.getDocuments();
      const writeDocuments = await this.writeItem.getDocuments();
      this.documentVisitors = this.merge(
        readDocuments,
        writeDocuments,
        (readDocument) => this.readItem.buildEmptyReadableDocument(readDocument),
        (writeDocument) => this.writeItem.buildEmptyWritableDocument(writeDocument),
        (r, w) => new DocumentVisitor(this.config, r, w),
      );
    }
    return this.documentVisitors;
  }

  public async prepare(): Promise<TransactionOp> {
    return this.prepareGeneric(
      this.config.createCollections,
      this.config.updateCollections,
      this.config.deleteCollections,
    );
  }
}
