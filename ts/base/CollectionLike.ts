import {DocumentLike, MaybeDocumentConsumer} from "./DocumentLike";

export type MaybeCollectionConsumer<C extends CollectionLike<D>, D extends DocumentLike> = (collection: C | undefined) => void;
export type DocumentIdsConsumer = (documentIds: string[]) => void;

export interface CollectionLike<D extends DocumentLike> {
  readonly id: string;

  withDocument(id: string, block: MaybeDocumentConsumer<D>): void;

  withDocumentIds(block: DocumentIdsConsumer): void;
}
