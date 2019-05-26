import {StoreLike} from "./StoreLike";
import {Updatable} from "./Updatable";

// tslint:disable-next-line
export interface WritableStoreLike extends StoreLike, Updatable<StoreLike> {

}
