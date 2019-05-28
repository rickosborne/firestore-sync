import {DocumentLike} from "./DocumentLike";
import {PropertyLike, WritablePropertyLike} from "./PropertyLike";

export interface WritableDocumentLike extends DocumentLike {
  buildEmptyWritableProperty(property: PropertyLike): WritablePropertyLike;

  getWritableProperties(): Promise<WritablePropertyLike[]>;

  updateFrom(document: DocumentLike): Promise<void>;
}
