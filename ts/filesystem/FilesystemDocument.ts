import * as fs from "fs";
import * as path from 'path';
import * as punycode from 'punycode';
import {DocumentLike} from "../base/DocumentLike";

export class FilesystemDocument implements DocumentLike {
  private content?: string;
  public readonly fileName: string;
  public readonly fullPath: string;

  constructor(
    public readonly directory: string,
    public readonly id: string,
  ) {
    this.fileName = punycode.encode(id) + '.json';
    this.fullPath = path.join(directory, this.fileName);
  }

  public load(block: (document: DocumentLike) => void) {
    if (this.content != null) {
      block(this);
    } else {
      fs.readFile(this.fullPath, {encoding: 'utf8'}, (err, json) => {
        if (err) {
          throw new Error(err.message);
        }
        this.content = json;
        block(this);
      });
    }
  }
}