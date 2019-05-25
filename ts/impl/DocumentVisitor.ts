import {DocumentLike} from "../base/DocumentLike";
import {identify} from "../base/Identified";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {PropertyVisitor} from "./PropertyVisitor";
import {Visitor} from "./Visitor";

export class DocumentVisitor extends Visitor<DocumentLike, WritableDocumentLike> {
  constructor(
    private readonly config: FirestoreSyncProfileOperationAdapter,
    private readonly readDocument: DocumentLike,
    private readonly writeDocument: WritableDocumentLike,
  ) {
    super(config.logger, identify(readDocument, writeDocument));
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
}
