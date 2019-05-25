import {Identified} from "./Identified";

export interface PropertyLike extends Identified {
  readonly exists: Promise<boolean>;
  readonly isScalar: Promise<boolean>;
  readonly value: any;

  buildEmptyReadableProperty(): PropertyLike;

  buildEmptyWritableProperty(): WritablePropertyLike;

  getReadableProperties(): Promise<PropertyLike[]>;

  matches(other: PropertyLike): Promise<boolean>;
}

export interface WritablePropertyLike extends PropertyLike {

  getWritableProperties(): Promise<WritablePropertyLike[]>;

  updateFrom(readProperty: PropertyLike): Promise<void>;
}
