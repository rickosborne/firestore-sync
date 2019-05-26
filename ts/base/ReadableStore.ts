import {CollectionLike} from "./CollectionLike";
import {DocumentLike} from "./DocumentLike";
import {StoreLike} from "./StoreLike";

export interface ReadableStore<C extends CollectionLike<D>, D extends DocumentLike> extends StoreLike {
  buildEmptyReadableCollection(writableCollection: CollectionLike<D>): C;

  getReadableCollections(): Promise<C[]>;
}
