import {Like} from "./Like";
import {Pathed} from "./Pathed";
import {PropertyLike} from "./PropertyLike";

export interface DocumentLike extends Like, Pathed {

  buildEmptyReadableProperty(property: PropertyLike): PropertyLike;

  getReadableProperties(): Promise<PropertyLike[]>;

  updateFrom(document: DocumentLike): Promise<void>;
}
