import {CollectionLike} from "./CollectionLike";
import {DocumentLike} from "./DocumentLike";
import {ReadableStore} from "./ReadableStore";

export interface WritableStore<C extends CollectionLike<D>, D extends DocumentLike> extends ReadableStore<C, D> {
  createCollection(collection: CollectionLike<any>): void;
}
