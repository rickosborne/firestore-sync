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
    private readonly readDocument: DocumentLike,
    private readonly writeDocument: WritableDocumentLike,
  ) {
    super(identify(readDocument, writeDocument), pathify(readDocument, writeDocument), config);
  }

  public async applyHasEffect(): Promise<boolean> {
    return this.getPropertyVisitors()
      .then((pvs) => pvs.find((pv) => pv.applyHasEffect()) != null);
  }

  protected buildApply(action: OpAction, doAction: boolean, effects: boolean, logAction: boolean): OpApply {
    return this.buildGenericApply(this.readDocument, this.writeDocument, this.config.logSkips, action, doAction, effects, logAction);
  }

  public async commit(): Promise<void> {
    notImplemented(this, 'commit');
  }

  public async getPropertyVisitors(): Promise<PropertyVisitor[]> {
    const readProperties = await this.readDocument.getReadableProperties();
    const writeProperties = await this.writeDocument.getWritableProperties();
    return this.merge(
      readProperties,
      writeProperties,
      (prop) => this.readDocument.buildEmptyReadableProperty(prop),
      (prop) => this.writeDocument.buildEmptyWritableProperty(prop),
      (r, w) => new PropertyVisitor(this.config, r, w),
    );
  }

  public async prepare(): Promise<TransactionOp> {
    return this.prepareGeneric(
      this.readDocument,
      this.writeDocument,
      this.config.createDocuments,
      this.config.updateDocuments,
      this.config.updateDocuments,
    );
  }
}
