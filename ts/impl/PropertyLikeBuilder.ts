import {Logger} from "../base/Logger";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {notImplemented} from "./NotImplemented";

export const DOCUMENT_ROOT_PATH = '$';

export function hasAnyValue(value: any): boolean {
  return value !== undefined;
}

export function hasScalarValue(value: any): boolean {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === "boolean" || value === null;
}

export function asSubpath(keyName: string): string {
  if (keyName.match(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/)) {
    return '.' + keyName;
  }
  return '[' + JSON.stringify(keyName) + ']';
}

abstract class BaseProperty {
  protected constructor(
    public readonly id: string,
    public readonly documentPath: string,
    public readonly valuePath: string,
    public readonly value: any,
    public readonly logger: Logger,
    public readonly type = typeof value,
    public readonly exists = hasAnyValue(value),
    public readonly isScalar = hasScalarValue(value),
  ) {
  }

  // noinspection JSUnusedGlobalSymbols
  public getReadableProperties(): PropertyLike[] {
    return buildReadablePropertyLike(this.id, this.documentPath, this.valuePath, this.value, this.logger);
  }

  // noinspection JSUnusedGlobalSymbols
  public matches(other: PropertyLike): Promise<boolean> {
    return Promise.resolve(this.value === other.value);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class KeyedProperty extends BaseProperty implements PropertyLike {
  constructor(
    id: string,
    documentPath: string,
    valuePath: string,
    public readonly key: string,
    value: any,
    logger: Logger,
    type = typeof value,
    exists = hasAnyValue(value),
    isScalar = hasScalarValue(value),
  ) {
    super(id, documentPath, valuePath, value, logger, type, exists, isScalar);
  }

  public buildEmptyReadableProperty(): PropertyLike {
    return new KeyedProperty(
      this.id,
      this.documentPath,
      this.valuePath,
      this.key,
      undefined,  // empty
      this.logger,
      this.type,  // ... but the correct type
      false,  // empty
      this.isScalar,  // ... but the correct answer here
    );
  }

  public buildEmptyWritableProperty(): WritablePropertyLike {
    return new WritableKeyedProperty(
      this.id,
      this.documentPath,
      this.valuePath,
      this.key,
      undefined,  // empty
      this.logger,
      this.type,  // ... but the correct type
      false,  // empty
      this.isScalar,  // ... but the correct answer here
    );
  }
}

// tslint:disable-next-line
export class WritableKeyedProperty extends KeyedProperty implements WritablePropertyLike {
  protected written: any;

  constructor(
    id: string,
    documentPath: string,
    valuePath: string,
    key: string,
    value: any,
    logger: Logger,
    type = typeof value,
    exists = hasAnyValue(value),
    isScalar = hasScalarValue(value),
  ) {
    super(id, documentPath, valuePath, key, value, logger, type, exists, isScalar);
  }

  public getWritableProperties(): WritablePropertyLike[] {
    return buildWritablePropertyLike(this.id, this.documentPath, this.valuePath, this.value, this.logger);
  }

  public async updateFrom(readProperty: PropertyLike): Promise<void> {
    this.written = readProperty.value;
  }
}

// tslint:disable-next-line
export class BasicProperty extends BaseProperty implements PropertyLike {
  constructor(
    id: string,
    documentPath: string,
    valuePath: string,
    value: any,
    logger: Logger,
    type = typeof value,
    exists = hasAnyValue(value),
    isScalar = hasScalarValue(value),
  ) {
    super(id, documentPath, valuePath, value, logger, type, exists, isScalar);
  }

  public buildEmptyReadableProperty(): PropertyLike {
    return new BasicProperty(this.id, this.documentPath, this.valuePath, undefined, this.logger, this.type, false, this.isScalar);
  }

  public buildEmptyWritableProperty(): WritablePropertyLike {
    return new WritableBasicProperty(
      this.id,
      this.documentPath,
      this.valuePath,
      undefined,
      this.logger,
      this.type,
      false,
      this.isScalar,
    );
  }
}

// tslint:disable-next-line
export class WritableBasicProperty extends BasicProperty implements WritablePropertyLike {
  constructor(
    id: string,
    documentPath: string,
    valuePath: string,
    value: any,
    logger: Logger,
    type = typeof value,
    exists = hasAnyValue(value),
    isScalar = hasScalarValue(value),
  ) {
    super(id, documentPath, valuePath, value, logger, type, exists, isScalar);
  }

  public getWritableProperties(): WritablePropertyLike[] {
    return buildWritablePropertyLike(this.id, this.documentPath, this.valuePath, this.value, this.logger);
  }

  public async updateFrom(readProperty: PropertyLike): Promise<void> {
    notImplemented(this, 'updateFrom');
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ArrayEntryProperty extends BaseProperty implements PropertyLike {
  constructor(
    id: string,
    documentPath: string,
    valuePath: string,
    public readonly index: number,
    value: any,
    logger: Logger,
    type = typeof value,
    exists = hasAnyValue(value),
    isScalar = hasScalarValue(value),
  ) {
    super(id, documentPath, valuePath, value, logger, type, exists, isScalar);
  }

  public buildEmptyReadableProperty(): PropertyLike {
    return new ArrayEntryProperty(
      this.id,
      this.documentPath,
      this.valuePath,
      this.index,
      undefined,
      this.logger,
      this.type,
      false,
      this.isScalar,
    );
  }

  public buildEmptyWritableProperty(): WritablePropertyLike {
    return new WritableArrayEntryProperty(
      this.id,
      this.documentPath,
      this.valuePath,
      this.index,
      undefined,
      this.logger,
      this.type,
      false,
      this.isScalar,
    );
  }

  public getReadableProperties(): PropertyLike[] {
    return buildReadablePropertyLike(this.id, this.documentPath, this.valuePath, this.value, this.logger);
  }
}

// tslint:disable-next-line
export class WritableArrayEntryProperty extends ArrayEntryProperty implements WritablePropertyLike {
  constructor(
    id: string,
    documentPath: string,
    valuePath: string,
    index: number,
    value: any,
    logger: Logger,
    type = typeof value,
    exists = hasAnyValue(value),
    isScalar = hasScalarValue(value),
  ) {
    super(id, documentPath, valuePath, index, value, logger, type, exists, isScalar);
  }

  public getWritableProperties(): WritablePropertyLike[] {
    return buildWritablePropertyLike(this.id, this.documentPath, this.valuePath, this.value, this.logger);
  }

  public async updateFrom(readProperty: PropertyLike): Promise<void> {
    notImplemented(this, 'updateFrom');
  }
}

export function buildWritablePropertyLike(
  id: string,
  documentPath: string,
  valuePath: string,
  value: any,
  logger: Logger,
): WritablePropertyLike[] {
  return buildPropertyLike(
    id,
    documentPath,
    valuePath,
    value,
    (_id, dp, vp, _value) => new WritableBasicProperty(_id, dp, vp, _value, logger),
    (_id, dp, vp, key, _value) => new WritableKeyedProperty(_id, dp, vp, key, _value, logger),
    (_id, dp, vp, index, _value) => new WritableArrayEntryProperty(_id, dp, vp, index, _value, logger),
  );
}

export function buildReadablePropertyLike(
  id: string,
  documentPath: string,
  valuePath: string,
  value: any,
  logger: Logger,
): PropertyLike[] {
  return buildPropertyLike(
    id,
    documentPath,
    valuePath,
    value,
    (_id, dp, vp, _value) => new BasicProperty(_id, dp, vp, _value, logger),
    (_id, dp, vp, key, _value) => new KeyedProperty(_id, dp, vp, key, _value, logger),
    (_id, dp, vp, index, _value) => new ArrayEntryProperty(_id, dp, vp, index, _value, logger),
  );
}

function buildPropertyLike<B extends BasicProperty & P,
  K extends KeyedProperty & P,
  A extends ArrayEntryProperty & P,
  P extends PropertyLike,
  >(
  id: string,
  documentPath: string,
  valuePath: string,
  value: any,
  basicBuilder: (id: string, documentPath: string, valuePath: string, value: any) => B,
  keyedBuilder: (id: string, documentPath: string, valuePath: string, key: string, value: any) => K,
  arrayBuilder: (id: string, documentPath: string, valuePath: string, index: number, value: any) => A,
): P[] {
  const type = typeof value;
  switch (type) {
    case "bigint":
    case "boolean":
    case "number":
    case "undefined":
    case "string":
      return [];
    // return [basicBuilder(id, documentPath, valuePath, value)];
    case "object":
      if (value === null || value instanceof Date) {
        return [];
        // return [basicBuilder(id, documentPath, valuePath, value)];
      }
      if (Array.isArray(value)) {
        return value.map((item, index) => arrayBuilder(`${id}[${index}]`, documentPath, `${valuePath}[${index}]`, index, item));
      }
      return Object
        .keys(value)
        .filter((key) => value.hasOwnProperty(key))
        .map((key) => {
          const subpath = asSubpath(key);
          return keyedBuilder(id + subpath, documentPath, valuePath + subpath, key, value[key]);
        });
    default:
      throw new Error(`Unexpected ${type} at "${id}"`);
  }
}
