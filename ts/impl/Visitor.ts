import {Identified, sortById} from "../base/Identified";
import {Logger, WithLogger} from "../base/Logger";
import {CollectionVisitor} from "./CollectionVisitor";
import {DocumentVisitor} from "./DocumentVisitor";
import {PropertyVisitor} from "./PropertyVisitor";

interface ArrayIndex {
  [id: string]: number;
}

export abstract class Visitor<R extends Identified, W extends R & Identified> implements WithLogger, Identified {
  protected constructor(
    public readonly logger: Logger,
    public readonly id: string,
  ) {
  }

  public async commit(): Promise<void> {
    throw new Error(`Not implemented: ${this.constructor.name}#commit`);
  }

  public async getCollectionVisitors(): Promise<CollectionVisitor[]> {
    return Promise.resolve([]);
  }

  public async getDocumentVisitors(): Promise<DocumentVisitor[]> {
    return Promise.resolve([]);
  }

  public async getPropertyVisitors(): Promise<PropertyVisitor[]> {
    return Promise.resolve([]);
  }

  // noinspection JSMethodCanBeStatic
  protected makeIndex<M extends Identified>(items: M[]): ArrayIndex {
    return items.reduce((prev, cur, idx) => {
      prev[cur.id] = idx;
      return prev;
    }, {} as { [id: string]: number });
  }

  protected merge<RR extends Identified, WW extends RR & Identified, V extends Visitor<RR, WW>>(
    readItems: RR[],
    writeItems: WW[],
    readableBuilder: (writable: WW) => RR,
    writableBuilder: (readable: RR) => WW,
    assembler: (read: RR, write: WW) => V,
  ): V[] {
    const readIndex = this.makeIndex(readItems);
    const writeIndex = this.makeIndex(writeItems);
    return readItems
      .map((readItem) => assembler(readItem, readItem.id in writeIndex ? writeItems[writeIndex[readItem.id]] : writableBuilder(readItem)))
      .concat(writeItems
        .filter((writeItem) => !(writeItem.id in readIndex))
        .map((writeItem) => assembler(readableBuilder(writeItem), writeItem)))
      .sort(sortById);
  }
}
