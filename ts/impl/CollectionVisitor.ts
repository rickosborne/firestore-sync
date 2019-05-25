import {CollectionLike} from "../base/CollectionLike";
import {identify} from "../base/Identified";
import {WritableCollectionLike} from "../base/WritableCollectionLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {DocumentVisitor} from "./DocumentVisitor";
import {Visitor} from "./Visitor";

export class CollectionVisitor extends Visitor<CollectionLike<any>, WritableCollectionLike<any, any>> {
  public constructor(
    private readonly config: FirestoreSyncProfileOperationAdapter,
    private readonly readCollection: CollectionLike<any>,
    private readonly writeCollection: WritableCollectionLike<any, any>,
  ) {
    super(config.logger, identify(readCollection, writeCollection));
  }

  public async getDocumentVisitors(): Promise<DocumentVisitor[]> {
    const readDocuments = this.readCollection == null ? [] : await this.readCollection.getDocuments();
    const writeDocuments = this.writeCollection == null ? [] : await this.writeCollection.getDocuments();
    return this.merge(
      readDocuments,
      writeDocuments,
      (readDocument) => this.readCollection.buildEmptyReadableDocument(readDocument),
      (writeDocument) => this.writeCollection.buildEmptyWritableDocument(writeDocument),
      (r, w) => new DocumentVisitor(this.config, r, w),
    );
  }
}
