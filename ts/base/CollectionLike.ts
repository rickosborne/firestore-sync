import {DocumentLike} from "./DocumentLike";

export interface CollectionLike<D extends DocumentLike> {
  readonly id: string;

  getDocuments(): Promise<D[]>;
}
