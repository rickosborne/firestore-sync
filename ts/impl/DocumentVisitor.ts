import {DocumentLike} from "../base/DocumentLike";
import {identify} from "../base/Identified";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {PropertyLike} from "./PropertyLike";
import {PropertyVisitor} from "./PropertyVisitor";
import {Visitor} from "./Visitor";

export class DocumentVisitor extends Visitor<DocumentLike> {
  constructor(
    private readonly config: FirestoreSyncProfileOperationAdapter,
    private readonly readDocument: DocumentLike | undefined,
    private readonly writeDocument: DocumentLike | undefined,
  ) {
    super(
      'document',
      config.createDocuments,
      config.updateDocuments,
      config.deleteDocuments,
      config.logSkips,
      config.logger,
      identify(readDocument, writeDocument),
    );
  }

  public async getPropertyVisitors(): Promise<PropertyVisitor[]> {
    const readProperties = this.readDocument == null ? [] : await this.readDocument.getProperties();
    const writeProperties = this.writeDocument == null ? [] : await this.writeDocument.getProperties();
    return this.merge(readProperties, writeProperties, (r, w) => new PropertyVisitor(this.config, r, w));
  }
}
