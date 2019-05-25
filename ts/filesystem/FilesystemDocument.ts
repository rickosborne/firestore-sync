import * as fs from "fs";
import * as path from 'path';
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {BasicProperty} from "../impl/BasicProperty";
import {Fail} from "../impl/Fail";
import {PropertyLike} from "../impl/PropertyLike";

export class FilesystemDocument implements DocumentLike, WithLogger {
  private content?: string;
  private dataPromise?: Promise<object> = undefined;
  public readonly fullPath: string;

  private get data(): Promise<{ [key: string]: any }> {
    if (this.dataPromise == null) {
      this.dataPromise = new Promise((resolve) => {
        fs.readFile(this.fullPath, {encoding: 'utf8'}, (err, data) => {
          Fail.when(err, 'data', this, () => `Could not read "${this.fullPath}"`);
          resolve(JSON.parse(data));
        });
      });
    }
    return this.dataPromise;
  }

  constructor(
    public readonly id: string,
    public readonly directory: string,
    public readonly fileName: string,
    public readonly logger: Logger,
  ) {
    this.fullPath = path.join(directory, this.fileName);
  }

  public async getProperties(): Promise<PropertyLike[]> {
    const obj = await this.data;
    return Object
      .keys(obj)
      .filter((key) => obj.hasOwnProperty(key))
      .map((key) => new BasicProperty(`${this.id}.${key}`, obj[key], this.logger));
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
