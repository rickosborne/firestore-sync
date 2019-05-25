import {Logger} from "../base/Logger";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";

abstract class BaseProperty {
  // noinspection JSUnusedGlobalSymbols
  public get exists(): Promise<boolean> {
    return Promise.resolve(this.value !== undefined);
  }

  // noinspection JSUnusedGlobalSymbols
  public get isScalar(): Promise<boolean> {
    const type = typeof this.value;
    return Promise.resolve(type === 'string' || type === 'number' || type === "boolean" || this.value === null);
  }

  protected constructor(
    public readonly id: string,
    public readonly value: any,
    public readonly logger: Logger,
  ) {
  }

  // noinspection JSUnusedGlobalSymbols
  public async getReadableProperties(): Promise<PropertyLike[]> {
    return buildReadablePropertyLike(this.id, this.value, this.logger);
  }

  // noinspection JSUnusedGlobalSymbols
  public matches(other: PropertyLike): Promise<boolean> {
    return Promise.resolve(this.value === other.value);
  }
}

// tslint:disable-next-line
export class BasicProperty extends BaseProperty implements PropertyLike {
  constructor(
    id: string,
    value: any,
    logger: Logger,
  ) {
    super(id, value, logger);
  }

  public buildEmptyReadableProperty(): PropertyLike {
    return new BasicProperty(this.id, undefined, this.logger);
  }

  public buildEmptyWritableProperty(): WritablePropertyLike {
    return new WritableBasicProperty(this.id, undefined, this.logger);
  }
}

// tslint:disable-next-line
export class WritableBasicProperty extends BasicProperty implements WritablePropertyLike {
  constructor(
    id: string,
    value: any,
    logger: Logger,
  ) {
    super(id, value, logger);
  }

  public async getWritableProperties(): Promise<WritablePropertyLike[]> {
    return buildWritablePropertyLike(this.id, this.value, this.logger);
  }

  public async updateFrom(readProperty: PropertyLike): Promise<void> {
    throw new Error('Not implemented: WritableBasicProperty#updateFrom');
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ArrayEntryProperty extends BaseProperty implements PropertyLike {
  constructor(
    id: string,
    public readonly index: number,
    value: any,
    logger: Logger,
  ) {
    super(id, value, logger);
  }

  public buildEmptyReadableProperty(): PropertyLike {
    return new ArrayEntryProperty(this.id, this.index, undefined, this.logger);
  }

  public buildEmptyWritableProperty(): WritablePropertyLike {
    return new WritableArrayEntryProperty(this.id, this.index, undefined, this.logger);
  }

  public async getReadableProperties(): Promise<PropertyLike[]> {
    return buildReadablePropertyLike(this.id, this.value, this.logger);
  }
}

// tslint:disable-next-line
export class WritableArrayEntryProperty extends ArrayEntryProperty implements WritablePropertyLike {
  constructor(
    id: string,
    index: number,
    value: any,
    logger: Logger,
  ) {
    super(id, index, value, logger);
  }

  public async getWritableProperties(): Promise<WritablePropertyLike[]> {
    return buildWritablePropertyLike(this.id, this.value, this.logger);
  }

  public async updateFrom(readProperty: PropertyLike): Promise<void> {
    throw new Error('Not implemented: WritableArrayEntryProperty#updateFrom');
  }
}

export function buildWritablePropertyLike(id: string, value: any, logger: Logger): WritablePropertyLike[] {
  return buildPropertyLike(
    value,
    id,
    (_id, _value) => new WritableBasicProperty(_id, _value, logger),
    (_id, index, _value) => new WritableArrayEntryProperty(_id, index, _value, logger),
  );
}

export function buildReadablePropertyLike(id: string, value: any, logger: Logger): PropertyLike[] {
  return buildPropertyLike(
    value,
    id,
    (_id, _value) => new BasicProperty(_id, _value, logger),
    (_id, index, _value) => new ArrayEntryProperty(_id, index, _value, logger),
  );
}

function buildPropertyLike<A extends ArrayEntryProperty & P, B extends BasicProperty & P, P extends PropertyLike>(
  value: any,
  id: string,
  basicBuilder: (id: string, value: any) => B,
  arrayBuilder: (id: string, index: number, value: any) => A,
): P[] {
  const type = typeof value;
  switch (type) {
    case "bigint":
    case "boolean":
    case "number":
    case "undefined":
    case "string":
      return [];
    case "object":
      if (value === null || value instanceof Date) {
        return [];
      }
      if (Array.isArray(value)) {
        return value.map((item, index) => arrayBuilder(`${id}[${index}]`, index, item));
      }
      return Object
        .keys(value)
        .filter((key) => value.hasOwnProperty(key))
        .map((key) => basicBuilder(`${id}.${key}`, value[key]));
    default:
      throw new Error(`Unexpected ${type} at "${id}"`);
  }
}
