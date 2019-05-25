import {Identified} from "../base/Identified";

export interface PropertyLike extends Identified {
  getProperties(): Promise<PropertyLike[]>;
}
