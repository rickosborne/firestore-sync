import {Identified} from "./Identified";

export interface Like extends Identified {
  readonly dryRun: boolean;
  readonly exists: boolean | Promise<boolean>;
}
