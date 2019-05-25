import {Logger} from "../base/Logger";
import {ArrayEntryProperty} from "./ArrayEntryProperty";
import {PropertyLike} from "./PropertyLike";

export class BasicProperty implements PropertyLike {
  constructor(
    public readonly id: string,
    public readonly value: any,
    public readonly logger: Logger,
  ) {
  }

  public getProperties(): Promise<PropertyLike[]> {
    const type = typeof this.value;
    switch (type) {
      case "bigint":
      case "boolean":
      case "number":
      case "undefined":
      case "string":
        return Promise.resolve([]);
      case "object":
        if (this.value === null || this.value instanceof Date) {
          return Promise.resolve([]);
        }
        if (Array.isArray(this.value)) {
          return Promise.resolve(this.value.map((item, index) => new ArrayEntryProperty(`${this.id}[${index}]`, index, item, this.logger)));
        }
        return Promise.resolve(Object
          .keys(this.value)
          .filter((key) => this.value.hasOwnProperty(key))
          .map((key) => new BasicProperty(`${this.id}.${key}`, this.value[key], this.logger)));
      default:
        throw new Error(`Unexpected ${type} at "${this.id}"`);
    }
  }
}
