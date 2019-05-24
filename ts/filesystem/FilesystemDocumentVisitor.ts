import {DocumentLike} from "../base/DocumentLike";
import {DocumentVisitor} from "../base/DocumentVisitor";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";

export class FilesystemDocumentVisitor extends DocumentVisitor {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }

  public startDocument(documentId: string): void {
    throw new Error('Not implemented: FilesystemDocumentVisitor#startDocument');
  }

  public visit(read: DocumentLike | undefined, write: DocumentLike | undefined): void {
    throw new Error('Not implemented: FilesystemDocumentVisitor#visit');
  }
}
