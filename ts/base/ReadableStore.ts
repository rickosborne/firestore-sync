import {CollectionLike} from "./CollectionLike";
import {DocumentLike} from "./DocumentLike";

export interface ReadableStore<C extends CollectionLike<D>, D extends DocumentLike> {
  buildEmptyReadableCollection(writableCollection: CollectionLike<D>): C;

  getReadableCollections(): Promise<C[]>;
}
