import {CollectionLike} from "../base/CollectionLike";
import {identify} from "../base/Identified";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {DocumentVisitor} from "./DocumentVisitor";
import {Visitor} from "./Visitor";

export class CollectionVisitor extends Visitor<CollectionLike<any>> {
  public constructor(
    private readonly config: FirestoreSyncProfileOperationAdapter,
    private readonly readCollection: CollectionLike<any> | undefined,
    private readonly writeCollection: CollectionLike<any> | undefined,
  ) {
    super(
      'collection',
      config.createCollections,
      config.updateCollections,
      config.deleteCollections,
      config.logSkips,
      config.logger,
      identify(readCollection, writeCollection),
    );
  }

  public async getDocumentVisitors(): Promise<DocumentVisitor[]> {
    const readDocuments = this.readCollection == null ? [] : await this.readCollection.getDocuments();
    const writeDocuments = this.writeCollection == null ? [] : await this.writeCollection.getDocuments();
    return this.merge(readDocuments, writeDocuments, (r, w) => new DocumentVisitor(this.config, r, w));
  }
}
