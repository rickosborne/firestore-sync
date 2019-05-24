import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {DocumentLike} from "./DocumentLike";

export abstract class DocumentVisitor {
  protected constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
  }

  public abstract startDocument(documentId: string): void;

  public abstract visit(read: DocumentLike | undefined, write: DocumentLike | undefined): void;
}
