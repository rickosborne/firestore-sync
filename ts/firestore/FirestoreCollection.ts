import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";

export class FirestoreCollection implements CollectionLike {
  public withDocument(id: string, block: (document: DocumentLike) => void): void {
    return;
  }

  public withDocumentIds(block: (documentIds: string[]) => void): void {
    return;
  }

}
