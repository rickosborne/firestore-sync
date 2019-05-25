import {Identified, sortById} from "../base/Identified";
import {Logger, WithLogger} from "../base/Logger";
import {CollectionVisitor} from "./CollectionVisitor";
import {DocumentVisitor} from "./DocumentVisitor";
import {Fail} from "./Fail";
import {PropertyVisitor} from "./PropertyVisitor";

interface ArrayIndex {
  [id: string]: number;
}

export abstract class Visitor<T extends Identified> implements WithLogger, Identified {
  protected constructor(
    public readonly noun: string,
    public readonly doCreate: boolean,
    public readonly doUpdate: boolean,
    public readonly doDelete: boolean,
    public readonly logSkips: boolean,
    public readonly logger: Logger,
    public readonly id: string,
  ) {
  }

  public getCollectionVisitors(): Promise<CollectionVisitor[]> {
    return Promise.resolve([]);
  }

  public getDocumentVisitors(): Promise<DocumentVisitor[]> {
    return Promise.resolve([]);
  }

  public getPropertyVisitors(): Promise<PropertyVisitor[]> {
    return Promise.resolve([]);
  }

  // noinspection JSMethodCanBeStatic
  protected makeIndex<M extends Identified>(items: M[]): ArrayIndex {
    return items.reduce((prev, cur, idx) => {
      prev[cur.id] = idx;
      return prev;
    }, {} as { [id: string]: number });
  }

  protected merge<M extends Identified, V extends Visitor<M>>(
    readItems: M[],
    writeItems: M[],
    assembler: (read: M | undefined, write: M | undefined) => V,
  ): V[] {
    const readIndex = this.makeIndex(readItems);
    const writeIndex = this.makeIndex(writeItems);
    return readItems
      .map((readItem) => assembler(readItem, readItem.id in writeIndex ? writeItems[writeIndex[readItem.id]] : undefined))
      .concat(writeItems
        .filter((writeItem) => !(writeItem.id in readIndex))
        .map((writeItem) => assembler(undefined, writeItem)))
      .sort(sortById);
  }

  public visit(
    readItem: T | undefined,
    writeItem: T | undefined,
    block: () => void,
  ): void {
    Fail.if(readItem == null && writeItem == null, 'visit', this,
      () => `Unexpected: both read and write ${this.noun}s are undefined`);
    if (
      (readItem != null && writeItem != null && this.doUpdate) ||
      (readItem != null && writeItem == null && this.doCreate) ||
      (readItem == null && writeItem != null && this.doDelete)
    ) {
      block();
    } else if (this.logSkips) {
      const id = readItem != null ? readItem.id : writeItem != null ? writeItem.id : '?';
      this.logger(this.constructor.name, 'visit', `Skip ${this.noun}: ${id}`);
    }
  }
}
