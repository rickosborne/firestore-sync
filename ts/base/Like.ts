import {Identified} from "./Identified";

export interface Like extends Identified {
  readonly exists: boolean | Promise<boolean>;
}
