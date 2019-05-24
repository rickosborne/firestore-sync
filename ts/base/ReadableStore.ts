import {CollectionLike, MaybeCollectionConsumer} from "./CollectionLike";
import {DocumentLike, MaybeDocumentConsumer} from "./DocumentLike";

export interface ReadableStore<C extends CollectionLike<D>, D extends DocumentLike> {
  withCollection(
    collection: CollectionLike<any>,
    block: MaybeCollectionConsumer<C, D>,
  ): void;

  withCollections(block: (readCollections: C[]) => void): void;

  withDocument(
    collection: CollectionLike<any>,
    documentId: string,
    block: MaybeDocumentConsumer<D>,
  ): void;

}
