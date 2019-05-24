import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {ReadableStore} from "../base/ReadableStore";
import {WritableStore} from "../base/WritableStore";
import {CollectionVisitor} from "./CollectionVisitor";
import {DocumentVisitor} from "./DocumentVisitor";

export class SyncWalker {
  public static walk<RC extends CollectionLike<RD>, WC extends CollectionLike<WD>, RD extends DocumentLike, WD extends DocumentLike>(
    readStore: ReadableStore<RC, RD>,
    writeStore: WritableStore<WC, WD>,
    collectionVisitor: CollectionVisitor,
    docVisitor: DocumentVisitor,
  ): void {
    readStore.withCollections((collections) => {
      for (const readCollection of collections) {
        readStore.withCollection(readCollection, (writeCollection) => {
          collectionVisitor.visit(readCollection, writeCollection, () => {
            readCollection.withDocumentIds((documentIds: string[]) => {
              for (const documentId of documentIds) {
                readCollection.withDocument(documentId, (readDocument) => {
                  readStore.withDocument(readCollection, documentId, (writeDocument) => {
                    docVisitor.visit(readDocument, writeDocument, () => {
                      return;
                    });
                  });
                });
              }
            });
          });
        });
      }
    });
  }
}
