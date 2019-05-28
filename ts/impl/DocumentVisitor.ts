import {DocumentLike} from "../base/DocumentLike";
import {identify} from "../base/Identified";
import {pathify} from "../base/Pathed";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {notImplemented} from "./NotImplemented";
import {PropertyVisitor} from "./PropertyVisitor";
import {OpAction, OpApply, TransactionOp} from "./TransactionOp";
import {Visitor} from "./Visitor";

export class DocumentVisitor extends Visitor<DocumentLike, WritableDocumentLike> {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
    readDocument: DocumentLike,
    writeDocument: WritableDocumentLike,
  ) {
    super(
      identify(readDocument, writeDocument),
      pathify(readDocument, writeDocument),
      readDocument,
      writeDocument,
      config,
    );
  }

  public async applyHasEffect(): Promise<boolean> {
    const propertyVisitors = await this.getPropertyVisitors();
    const effects = propertyVisitors.map((pv) => pv.applyHasEffect());
    return effects.indexOf(true) > -1;
  }

  protected buildApply(action: OpAction, doAction: boolean, effects: boolean, logAction: boolean): OpApply {
    return this.buildGenericApply(this.config.logSkips, action, doAction, effects, logAction);
  }

  public async commit(): Promise<void> {
    notImplemented(this, 'commit');
  }

  public async getPropertyVisitors(): Promise<PropertyVisitor[]> {
    const readProperties = await this.readItem.getReadableProperties();
    const writeProperties = await this.writeItem.getWritableProperties();
    return this.merge(
      readProperties,
      writeProperties,
      (prop) => this.readItem.buildEmptyReadableProperty(prop),
      (prop) => this.writeItem.buildEmptyWritableProperty(prop),
      (r, w) => new PropertyVisitor(this.config, r, w),
    );
  }

  public async prepare(): Promise<TransactionOp> {
    return this.prepareGeneric(
      this.config.createDocuments,
      this.config.updateDocuments,
      this.config.updateDocuments,
    );
  }
}
