import {DocumentLike} from "../base/DocumentLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {Visitor} from "./Visitor";

export class DocumentVisitor extends Visitor<DocumentLike> {
  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    super(
      'document',
      config.createDocuments,
      config.updateDocuments,
      config.deleteDocuments,
      config.logSkips,
      config.logger,
    );
  }
}
