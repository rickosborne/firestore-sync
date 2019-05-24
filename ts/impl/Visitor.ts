import {Logger, WithLogger} from "../base/Logger";
import {Fail} from "./Fail";

export abstract class Visitor<T extends {id: string}> implements WithLogger {
  protected constructor(
    public readonly noun: string,
    public readonly doCreate: boolean,
    public readonly doUpdate: boolean,
    public readonly doDelete: boolean,
    public readonly logSkips: boolean,
    public readonly logger: Logger,
  ) {
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
