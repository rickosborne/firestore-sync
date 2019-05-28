import {PropertyConfig, PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {FirestoreOnTypeMismatch} from "../config/FirestoreSyncConfig";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";

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

export interface PropertyConfigImpl extends PropertyConfig {
  readonly logSkips: boolean;
  readonly writable: boolean;
}

abstract class BaseProperty<VALUE, IMPL extends BaseProperty<VALUE, IMPL>> implements PropertyLike, WritablePropertyLike {
  public removed: boolean = false;
  protected written?: VALUE;

  public get readableProperties(): PropertyLike[] {
    return this.config.writable ? [] : this.children;
  }

  public get writableProperties(): WritablePropertyLike[] {
    return this.config.writable ? this.children : [];
  }

  public constructor(
    public readonly id: string,
    public readonly valuePath: string,
    public readonly value: VALUE | undefined,
    public readonly key: string | undefined,
    public readonly index: number | undefined,
    public readonly children: Array<BaseProperty<any, any>> = [],
    public readonly config: PropertyConfigImpl,
    public readonly type = typeof value,
    public readonly exists = hasAnyValue(value),
    public readonly isScalar = hasScalarValue(value),
  ) {
  }

  public asUpdated(): any {
    if (this.removed) {
      return undefined;
    }
    return this.written;
  }

  public abstract buildEmpty(writable: boolean): IMPL;

  public buildEmptyReadableProperty(): PropertyLike {
    return this.buildEmpty(false);
  }

  public buildEmptyWritableProperty(): WritablePropertyLike {
    return this.buildEmpty(true);
  }

  protected canAssignFrom(readable: BaseProperty<any, any>): boolean {
    return this.value == null || readable.value == null || this.type === readable.type;
  }

  protected checkForTypeMismatch(readable: any): FirestoreOnTypeMismatch | undefined {
    if (!this.canAssignFrom(readable)) {
      switch (this.config.onTypeMismatch) {
        case FirestoreOnTypeMismatch.LOG:
          this.config.logger(this.constructor.name, 'updateFrom', `Type mismatch ${readable.type} => ${this.type}`);
          break;
        case FirestoreOnTypeMismatch.FAIL:
          throw new Error(`Type mismatch (${readable.type} => ${this.type}) in ${this.config.documentPath} ${this.valuePath}`);
        case FirestoreOnTypeMismatch.SKIP_VALUE:
          if (this.config.logSkips) {
            this.config.logger(
              this.constructor.name,
              'updateFrom',
              `Skip because of type mismatch (${readable.type} => ${this.type}) in ${this.config.documentPath} ${this.valuePath}`,
            );
          }
          break;
        case FirestoreOnTypeMismatch.SKIP_DOCUMENT:
          throw FirestoreOnTypeMismatch.SKIP_DOCUMENT;
        default:
          throw new Error(`Unknown onTypeMismatch option: ${this.config.onTypeMismatch}`);
      }
      return this.config.onTypeMismatch;
    }
    return undefined;
  }

  protected childrenWith(writable: boolean): Array<BaseProperty<any, any>> {
    return this.children.map((child) => child.buildEmpty(writable));
  }

  protected configWith(writable: boolean): PropertyConfigImpl {
    if (this.config.writable === writable) {
      return this.config;
    }
    return {
      ...this.config,
      writable,
    };
  }

  protected getPrepared(): VALUE | undefined {
    return this.value;
  }

  public matches(other: PropertyLike): Promise<boolean> {
    return Promise.resolve(this.value === other.value);
  }

  public async updateFrom(readable: PropertyLike): Promise<void> {
    if (!this.config.writable) {
      throw new Error(`Not writable: ${this.constructor.name} ${this.config.documentPath} ${this.valuePath}`);
    }
    if (!this.config.dryRun) {
      const maybeOnMismatch = this.checkForTypeMismatch(readable.value);
      if (maybeOnMismatch === FirestoreOnTypeMismatch.SKIP_VALUE) {
        return;
      }
      this.written = (readable as BaseProperty<any, any>).getPrepared();
      if (this.written === undefined) {
        this.removed = true;
      }
      this.config.logger(
        this.constructor.name,
        'updateFrom',
        `${readable.exists ? '' : 'empty '}${readable.constructor.name} => ${readable.config.documentPath} ${readable.valuePath}`,
      );
    }
  }
}

// tslint:disable-next-line
class BasicProperty extends BaseProperty<any, BasicProperty> {
  public buildEmpty(writable: boolean): BasicProperty {
    return new BasicProperty(
      this.id,
      this.valuePath,
      undefined,
      this.key,
      this.index,
      this.childrenWith(writable),
      this.configWith(writable),
      this.type,
      false,
      this.isScalar,
    );
  }

  public async updateFrom(readable: PropertyLike): Promise<void> {
    return super.updateFrom(readable);
  }
}

// tslint:disable-next-line
class DateProperty extends BaseProperty<Date, DateProperty> {
  public buildEmpty(writable: boolean): DateProperty {
    return new DateProperty(
      this.id,
      this.valuePath,
      undefined,
      this.key,
      this.index,
      this.childrenWith(writable),
      this.configWith(writable),
      this.type,
      false,
      this.isScalar,
    );
  }

  protected canAssignFrom(readable: BaseProperty<any, any>): boolean {
    return this.value == null || readable.value == null || readable.value instanceof Date;
  }
}

// tslint:disable-next-line
class ArrayProperty extends BaseProperty<any[], ArrayProperty> {
  public asUpdated(): any[] | undefined {
    if (this.removed) {
      return undefined;
    }
    const result: any[] = [];
    this.children.forEach((child) => {
      if (child.index != null) {
        if (!child.removed) {
          const childValue = child.asUpdated();
          if (childValue !== undefined) {
            result[child.index] = childValue;
          } else {
            throw new Error(`Unexpected undefined item ${child.index} ${child.config.documentPath} ${child.valuePath}`);
          }
        }
      } else {
        throw new Error(`Item without an index: ${child.config.documentPath} ${child.valuePath}`);
      }
    });
    return result;
  }

  public buildEmpty(writable: boolean): ArrayProperty {
    return new ArrayProperty(
      this.id,
      this.valuePath,
      undefined,
      this.key,
      this.index,
      this.childrenWith(writable),
      this.configWith(writable),
      this.type,
      false,
      this.isScalar,
    );
  }

  protected canAssignFrom(readable: BaseProperty<any, any>): boolean {
    return this.value == null || readable.value == null || Array.isArray(readable.value);
  }
}

export interface JsonObject {
  [key: string]: any;
}

// tslint:disable-next-line
class ObjectProperty extends BaseProperty<JsonObject, ObjectProperty> {
  public buildEmpty(writable: boolean): ObjectProperty {
    return new ObjectProperty(
      this.id,
      this.valuePath,
      undefined,
      this.key,
      this.index,
      this.childrenWith(writable),
      this.configWith(writable),
      this.type,
      false,
      this.isScalar,
    );
  }

  protected canAssignFrom(readable: BaseProperty<any, any>): boolean {
    return this.value == null || readable.value == null || readable instanceof ObjectProperty;
  }

  protected getPrepared(): JsonObject | undefined {
    if (this.value == null) {
      return undefined;
    }
    const result: JsonObject = {};
    Object
      .entries(this.value)
      .sort(([ak], [bk]) => ak.localeCompare(bk))
      .forEach(([k, v]) => result[k] = v);
    return result;
  }
}

export function buildWritablePropertyLike(
  id: string,
  documentPath: string,
  valuePath: string,
  value: any,
  config: FirestoreSyncProfileOperationAdapter,
): WritablePropertyLike {
  return buildPropertyLike(
    id,
    valuePath,
    value,
    {
      documentPath,
      dryRun: config.dryRun,
      logSkips: config.logSkips,
      logger: config.logger,
      onTypeMismatch: config.onTypeMismatch,
      writable: true,
    },
  );
}

export function buildReadablePropertyLike(
  id: string,
  documentPath: string,
  valuePath: string,
  value: any,
  config: FirestoreSyncProfileOperationAdapter,
): PropertyLike {
  return buildPropertyLike(
    id,
    valuePath,
    value,
    {
      documentPath,
      dryRun: config.dryRun,
      logSkips: config.logSkips,
      logger: config.logger,
      onTypeMismatch: config.onTypeMismatch,
      writable: false,
    },
  );
}

function buildPropertyLike(
  id: string,
  valuePath: string,
  value: any,
  config: PropertyConfigImpl,
  key?: string,
  index?: number,
): BaseProperty<any, any> {
  const type = typeof value;
  switch (type) {
    case "bigint":
    case "boolean":
    case "number":
    case "undefined":
    case "string":
      return new BasicProperty(id, valuePath, value, key, index, [], config);
    case "object":
      if (value == null) {
        return new BasicProperty(id, valuePath, value, key, index, [], config);
      } else if (Array.isArray(value)) {
        const items = value.map((item, n) => buildPropertyLike(`${id}[${n}]`, `${valuePath}[${n}]`, item, config, undefined, n));
        return new ArrayProperty(id, valuePath, value, key, index, items, config);
      } else if (value instanceof Date) {
        return new DateProperty(id, valuePath, value, key, index, [], config);
      } else {
        const props = Object.entries(value)
          .filter(([k]) => value.hasOwnProperty(k))
          .map(([k, v]) => {
            const subpath = asSubpath(k);
            return buildPropertyLike(`${id}${subpath}`, `${valuePath}${subpath}`, v, config, k, undefined);
          });
        return new ObjectProperty(id, valuePath, value, key, index, props, config);
      }
    default:
      throw new Error(`Unexpected ${type} at "${id}"`);
  }
}
