import {Visitor} from "./Visitor";

export class SyncWalker {

  public async walkCollections(visitor: Visitor<any>): Promise<void> {
    const collectionVisitors = await visitor.getCollectionVisitors();
    for (const collectionVisitor of collectionVisitors) {
      await this.walkDocuments(collectionVisitor);
    }
  }

  public async walkDocuments(visitor: Visitor<any>): Promise<void> {
    const documentVisitors = await visitor.getDocumentVisitors();
    for (const documentVisitor of documentVisitors) {
      await this.walkCollections(documentVisitor);
      await this.walkProperties(documentVisitor);
    }
  }

  public async walkProperties(visitor: Visitor<any>): Promise<void> {
    const propertyVisitors = await visitor.getPropertyVisitors();
    for (const propertyVisitor of propertyVisitors) {
      await this.walkProperties(propertyVisitor);
    }
  }
}
