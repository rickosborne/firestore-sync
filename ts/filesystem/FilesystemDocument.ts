import * as fs from "fs";
import * as path from 'path';
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {Fail} from "../impl/Fail";
import {buildReadablePropertyLike, buildWritablePropertyLike} from "../impl/PropertyLikeBuilder";

export class FilesystemDocument implements DocumentLike, WithLogger {
  protected content?: string;
  protected dataPromise?: Promise<{ [key: string]: any } | undefined> = undefined;
  public readonly fullPath: string;

  protected get data(): Promise<{ [key: string]: any } | undefined> {
    if (this.dataPromise == null) {
      this.dataPromise = new Promise((resolve) => {
        fs.readFile(this.fullPath, {encoding: 'utf8'}, (err, data) => {
          if (err != null && err.code === 'ENOENT') {
            resolve();
          } else {
            Fail.when(err, 'data', this, () => `Could not read "${this.fullPath}"`);
            resolve(JSON.parse(data));
          }
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

  public buildEmptyReadableProperty(property: PropertyLike): PropertyLike {
    return property.buildEmptyReadableProperty();
  }

  protected async getPropertiesWithBuilder<P extends PropertyLike>(builder: (id: string, obj: any) => P[]): Promise<P[]> {
    const obj = await this.data;
    return builder(this.id + ':', obj);
  }

  public async getReadableProperties(): Promise<PropertyLike[]> {
    return await this.getPropertiesWithBuilder((id, obj) => buildReadablePropertyLike(id, obj, this.logger));
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

// tslint:disable-next-line:max-classes-per-file
export class WritableFilesystemDocument extends FilesystemDocument implements WritableDocumentLike {
  constructor(
    id: string,
    directory: string,
    fileName: string,
    logger: Logger,
  ) {
    super(id, directory, fileName, logger);
  }

  public buildEmptyWritableProperty(property: PropertyLike): WritablePropertyLike {
    return property.buildEmptyWritableProperty();
  }

  public async getWritableProperties(): Promise<WritablePropertyLike[]> {
    return this.getPropertiesWithBuilder((id, obj) => buildWritablePropertyLike(id, obj, this.logger));
  }
}
