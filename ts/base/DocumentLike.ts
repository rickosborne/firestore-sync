import {PropertyLike} from "../impl/PropertyLike";

export type MaybeDocumentConsumer<D extends DocumentLike> = (document?: D) => void;

export interface DocumentLike {
  id: string;

  getProperties(): Promise<PropertyLike[]>;
}
