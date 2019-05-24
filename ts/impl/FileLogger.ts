import * as fs from 'fs';
import {Logger} from "../base/Logger";

export class FileLogger {
  public static appendTo(fileName: string, encoding: string = 'utf8'): Logger {
    return (message) => fs.appendFileSync(fileName, message, {encoding});
  }
}
