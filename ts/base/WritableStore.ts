import {CollectionLike} from "./CollectionLike";
import {DocumentLike} from "./DocumentLike";
import {ReadableStore} from "./ReadableStore";
import {Updatable} from "./Updatable";
import {WritableCollectionLike} from "./WritableCollectionLike";
import {WritableDocumentLike} from "./WritableDocumentLike";

export interface WritableStore<RC extends CollectionLike<RD>,
  WC extends RC & WritableCollectionLike<RD, WD>,
  RD extends DocumentLike,
  WD extends WritableDocumentLike & RD,
  > extends ReadableStore<RC, RD>, Updatable<ReadableStore<RC, RD>> {
  buildEmptyWritableCollection(collection: CollectionLike<any>): WC;

  createCollection(collection: CollectionLike<any>): void;

  getWritableCollections(): Promise<WC[]>;
}
