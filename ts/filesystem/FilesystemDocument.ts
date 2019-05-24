import * as fs from "fs";
import * as path from 'path';
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {Fail} from "../impl/Fail";

export class FilesystemDocument implements DocumentLike, WithLogger {
  private content?: string;
  public readonly fullPath: string;

  constructor(
    public readonly id: string,
    public readonly directory: string,
    public readonly fileName: string,
    public readonly logger: Logger,
  ) {
    this.fullPath = path.join(directory, this.fileName);
  }

  public load(block: (document: FilesystemDocument) => void) {
    if (this.content != null) {
      block(this);
    } else {
      fs.readFile(this.fullPath, {encoding: 'utf8'}, (err, json) => {
        Fail.when(err, 'load', this, () => `Could not readFile "${this.fullPath}"`);
        this.content = json;
        block(this);
      });
    }
  }
}
