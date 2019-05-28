import {FirestoreOnTypeMismatch} from "../config/FirestoreSyncConfig";
import {Like} from "./Like";
import {Logger} from "./Logger";

export enum PropertyApplyEffect {
  NONE = 'none',
  SKIP = 'skip',
  TYPE_MISMATCH = 'type-mismatch',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface PropertyConfig {
  readonly documentPath: string;
  readonly dryRun: boolean;
  readonly logger: Logger;
  readonly onTypeMismatch: FirestoreOnTypeMismatch;
}

export interface PropertyLike extends Like {
  readonly config: PropertyConfig;
  readonly documentPath: string;
  readonly isScalar: boolean;
  readonly path: string;
  readonly readableProperties: PropertyLike[];
  readonly type: string;
  readonly value: any;
  readonly valuePath: string;

  buildEmptyReadableProperty(): PropertyLike;

  buildEmptyWritableProperty(): WritablePropertyLike;

  matches(other: PropertyLike): boolean;
}

export interface WritablePropertyLike extends PropertyLike {
  readonly writableProperties: WritablePropertyLike[];

  asUpdated(): any;

  effectFrom(readProperty: PropertyLike): PropertyApplyEffect;

  updateFrom(readProperty: PropertyLike): Promise<void>;
}
