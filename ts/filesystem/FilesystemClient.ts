import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {StoreLike} from "../base/StoreLike";

export class FilesystemClient implements StoreLike {
  public withCollection(ourCollection: CollectionLike, block: (theirCollection: CollectionLike) => void): void {
    throw new Error('Not implemented: FilesystemClient#withCollection');
  }

  public withDocument(collection: CollectionLike, documentId: string, block: (document: DocumentLike) => void): void {
    throw new Error('Not implemented: FilesystemClient#withDocument');
  }
}
