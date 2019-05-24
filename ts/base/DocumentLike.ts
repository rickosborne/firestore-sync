export type MaybeDocumentConsumer<D extends DocumentLike> = (document?: D) => void;

export interface DocumentLike {
  id: string;
}
