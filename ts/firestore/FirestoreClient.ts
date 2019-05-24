import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {StoreLike} from "../base/StoreLike";

export class FirestoreClient extends StoreLike {
  public withCollection(ourCollection: CollectionLike, block: (theirCollection: CollectionLike) => void): void {
    return;
  }

  public withDocument(collection: CollectionLike, documentId: string, block: (document: DocumentLike) => void): void {
    return;
  }
}
