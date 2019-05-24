import {DocumentLike} from "../base/DocumentLike";
import {DocumentVisitor} from "../base/DocumentVisitor";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";

export class FirestoreDocumentVisitor extends DocumentVisitor {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }

  public startDocument(documentId: string): void {
    return;
  }

  public visit(read: DocumentLike | undefined, write: DocumentLike | undefined): void {
    return;
  }

}
