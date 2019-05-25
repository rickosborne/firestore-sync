import {Logger} from "../base/Logger";
import {BasicProperty} from "./BasicProperty";

export class ArrayEntryProperty extends BasicProperty {
  constructor(
    public readonly id: string,
    public readonly index: number,
    public readonly value: any,
    public readonly logger: Logger,
  ) {
    super(id, value, logger);
  }
}
