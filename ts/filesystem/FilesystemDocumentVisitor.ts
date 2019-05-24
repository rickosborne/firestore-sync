import {DocumentLike} from "../base/DocumentLike";
import {DocumentVisitor} from "../base/DocumentVisitor";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";

export class FilesystemDocumentVisitor extends DocumentVisitor {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(config);
  }

  public visit(read: DocumentLike | undefined, write: DocumentLike | undefined): void {
    throw new Error('Not implemented: FilesystemDocumentVisitor#visit');
  }
}
