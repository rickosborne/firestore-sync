import {DocumentLike} from "./DocumentLike";
import {Like} from "./Like";
import {Pathed} from "./Pathed";

export const COLLECTION_ROOT_PATH = '/';

export interface CollectionLike<D extends DocumentLike> extends Like, Pathed {

  buildEmptyReadableDocument(document: DocumentLike): D;

  getDocuments(): Promise<D[]>;
}
