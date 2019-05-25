import {DocumentLike} from "./DocumentLike";

export interface CollectionLike<D extends DocumentLike> {
  readonly id: string;

  buildEmptyReadableDocument(document: DocumentLike): D;

  getDocuments(): Promise<D[]>;
}
