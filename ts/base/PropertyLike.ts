import {FirestoreOnTypeMismatch} from "../config/FirestoreSyncConfig";
import {Like} from "./Like";
import {Logger} from "./Logger";

export interface PropertyConfig {
  readonly documentPath: string;
  readonly dryRun: boolean;
  readonly logger: Logger;
  readonly onTypeMismatch: FirestoreOnTypeMismatch;
}

export interface PropertyLike extends Like {
  readonly config: PropertyConfig;
  readonly isScalar: boolean;
  readonly readableProperties: PropertyLike[];
  readonly type: string;
  readonly value: any;
  readonly valuePath: string;

  buildEmptyReadableProperty(): PropertyLike;

  buildEmptyWritableProperty(): WritablePropertyLike;

  matches(other: PropertyLike): Promise<boolean>;
}

export interface WritablePropertyLike extends PropertyLike {
  readonly writableProperties: WritablePropertyLike[];

  asUpdated(): any;

  updateFrom(readProperty: PropertyLike): Promise<void>;
}
