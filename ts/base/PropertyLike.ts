import {Like} from "./Like";

export interface PropertyLike extends Like {
  readonly documentPath: string;
  readonly isScalar: boolean;
  readonly type: string;
  readonly value: any;
  readonly valuePath: string;

  buildEmptyReadableProperty(): PropertyLike;

  buildEmptyWritableProperty(): WritablePropertyLike;

  getReadableProperties(): PropertyLike[];

  matches(other: PropertyLike): Promise<boolean>;
}

export interface WritablePropertyLike extends PropertyLike {

  getWritableProperties(): WritablePropertyLike[];

  updateFrom(readProperty: PropertyLike): Promise<void>;
}
