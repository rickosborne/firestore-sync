import {CollectionLike, MaybeCollectionConsumer} from "./CollectionLike";
import {MaybeDocumentConsumer} from "./DocumentLike";

export abstract class StoreLike {

  public abstract withCollection(
    readCollection: CollectionLike,
    block: MaybeCollectionConsumer,
  ): void;

  public abstract withDocument(
    collection: CollectionLike,
    documentId: string,
    block: MaybeDocumentConsumer,
  ): void;

}
