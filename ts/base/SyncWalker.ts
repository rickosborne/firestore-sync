import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {CollectionLike} from "./CollectionLike";
import {CollectionVisitor} from "./CollectionVisitor";
import {DocumentLike} from "./DocumentLike";
import {DocumentVisitor} from "./DocumentVisitor";
import {StoreLike} from "./StoreLike";

export abstract class SyncWalker {
  protected constructor(
    protected readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
  }

  public abstract eachCollection(block: (collection: CollectionLike) => void): void;

  public walk(
    them: StoreLike,
    collectionVisitor: CollectionVisitor,
    docVisitor: DocumentVisitor,
  ): void {
    this.eachCollection((readCollection) => {
      them.withCollection(readCollection, (writeCollection) => {
        collectionVisitor.visiting(readCollection, writeCollection, () => {
          readCollection.withDocumentIds((documentIds: string[]) => {
            for (const documentId of documentIds) {
              readCollection.withDocument(documentId, (readDocument: DocumentLike) => {
                them.withDocument(readCollection, documentId, (writeDocument) => {
                  docVisitor.visit(readDocument, writeDocument);
                });
              });
            }
          });
        });
      });
    });
  }
}
