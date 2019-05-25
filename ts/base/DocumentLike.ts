import {PropertyLike} from "./PropertyLike";

export interface DocumentLike {
  id: string;

  buildEmptyReadableProperty(property: PropertyLike): PropertyLike;

  getReadableProperties(): Promise<PropertyLike[]>;
}
