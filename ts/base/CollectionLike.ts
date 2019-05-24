import {MaybeDocumentConsumer} from "./DocumentLike";

export type MaybeCollectionConsumer = (collection: CollectionLike | undefined) => void;
export type DocumentIdsConsumer = (documentIds: string[]) => void;

export interface CollectionLike {
  readonly id: string;

  withDocument(id: string, block: MaybeDocumentConsumer): void;

  withDocumentIds(block: DocumentIdsConsumer): void;
}
