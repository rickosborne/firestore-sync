import {CollectionLike} from "./CollectionLike";
import {DocumentLike} from "./DocumentLike";
import {WritableDocumentLike} from "./WritableDocumentLike";

export interface WritableCollectionLike<RD extends DocumentLike, WD extends RD & WritableDocumentLike> extends CollectionLike<RD> {
  buildEmptyWritableDocument(readableDocument: DocumentLike): WD;

  getDocuments(): Promise<WD[]>;
}
