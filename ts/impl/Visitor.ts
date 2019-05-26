import {Identified, sortById} from "../base/Identified";
import {Like} from "../base/Like";
import {Logger, WithLogger} from "../base/Logger";
import {Pathed} from "../base/Pathed";
import {Updatable} from "../base/Updatable";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {CollectionVisitor} from "./CollectionVisitor";
import {DocumentVisitor} from "./DocumentVisitor";
import {Fail} from "./Fail";
import {notImplemented} from "./NotImplemented";
import {PropertyVisitor} from "./PropertyVisitor";
import {OpAction, OpApply, OpLevel, OpStatus, TransactionOp} from "./TransactionOp";

interface ArrayIndex {
  [id: string]: number;
}

export abstract class Visitor<R extends Like, W extends R & Like> implements WithLogger, Identified, Pathed {
  protected anyEffect?: boolean;
  public readonly logger: Logger;

  protected constructor(
    public readonly id: string,
    public readonly path: string,
    protected readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
    this.logger = config.logger;
  }

  protected abstract applyHasEffect(): Promise<boolean> | boolean;

  protected buildApply(action: OpAction, doAction: boolean, effects: boolean, logAction: boolean): OpApply {
    return notImplemented(this, 'buildApply');
  }

  protected buildGenericApply(
    readItem: R,
    writeItem: W & Updatable<R>,
    logSkips: boolean,
    action: OpAction,
    doAction: boolean,
    effects: boolean,
    logAction: boolean,
  ): OpApply {
    const commitAction = 'commit:' + action;
    return async (): Promise<OpStatus> => {
      if (effects) {
        if (doAction) {
          if (logAction) {
            this.logger(this.constructor.name, commitAction, `Commit ${action}: ${this.id}`);
          }
          return writeItem.updateFrom(readItem)
            .then(() => OpStatus.SUCCESS)
            .catch(Fail.catchAndReturn(OpStatus.FAILED, commitAction, this));
        } else if (logSkips) {
          this.logger(this.constructor.name, commitAction, `Skipped: ${this.id}`);
        }
        return OpStatus.SKIPPED;
      }
      return OpStatus.NOOP;
    };
  }

  public async commit(): Promise<void> {
    notImplemented(this, 'commit');
  }

  public async getCollectionVisitors(): Promise<CollectionVisitor[]> {
    return Promise.resolve([]);
  }

  public async getDocumentVisitors(): Promise<DocumentVisitor[]> {
    return Promise.resolve([]);
  }

  public getPropertyVisitors(): Promise<PropertyVisitor[]> | PropertyVisitor[] {
    return [];
  }

  // noinspection JSMethodCanBeStatic
  protected makeIndex<M extends Identified>(items: M[]): ArrayIndex {
    return items.reduce((prev, cur, idx) => {
      prev[cur.id] = idx;
      return prev;
    }, {} as { [id: string]: number });
  }

  protected merge<RR extends Like, WW extends RR & Like, V extends Visitor<RR, WW>>(
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

  public async prepare(): Promise<TransactionOp> {
    return notImplemented(this, 'prepare');
  }

  protected async prepareGeneric(
    readItem: R,
    writeItem: W,
    doCreate: boolean,
    doUpdate: boolean,
    doDelete: boolean,
  ): Promise<TransactionOp> {
    return Promise.all([
      readItem.exists,
      writeItem.exists,
    ]).then(([readExists, writeExists]): TransactionOp | Promise<TransactionOp> => {
      if (readExists && writeExists) {
        return Promise.resolve(this.applyHasEffect())
          .then((effective): TransactionOp => {
            return {
              action: OpAction.UPDATE,
              apply: this.buildApply(OpAction.UPDATE, doUpdate, effective, this.config.logUpdates),
              level: OpLevel.DOCUMENT,
              path: this.path,
            };
          });
      } else if (readExists) {
        this.anyEffect = true;
        return {
          action: OpAction.CREATE,
          apply: this.buildApply(OpAction.CREATE, doCreate, true, this.config.logCreates),
          level: OpLevel.DOCUMENT,
          path: this.path,
        };
      } else if (writeExists) {
        this.anyEffect = true;
        return {
          action: OpAction.DELETE,
          apply: this.buildApply(OpAction.DELETE, doDelete, true, this.config.logDeletes),
          level: OpLevel.DOCUMENT,
          path: this.path,
        };
      } else {
        throw new Error(`Expected either read or write for ${this.path}`);
      }
    });
  }
}
