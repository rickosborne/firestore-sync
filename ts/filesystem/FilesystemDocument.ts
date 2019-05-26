import * as fs from "fs";
import * as osPath from 'path';
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {Fail} from "../impl/Fail";
import {notImplemented} from "../impl/NotImplemented";
import {buildReadablePropertyLike, buildWritablePropertyLike, DOCUMENT_ROOT_PATH} from "../impl/PropertyLikeBuilder";

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

  public get exists(): Promise<boolean> {
    return new Promise((resolve) => {
      fs.stat(this.fullPath, (err, stats) => resolve(err ? false : stats.isFile()));
    });
  }

  constructor(
    public readonly id: string,
    public readonly directory: string,
    public readonly path: string,
    public readonly fileName: string,
    public readonly logger: Logger,
  ) {
    this.fullPath = osPath.join(directory, this.fileName);
  }

  public buildEmptyReadableProperty(property: PropertyLike): PropertyLike {
    return property.buildEmptyReadableProperty();
  }

  protected async getPropertiesWithBuilder<P extends PropertyLike>(builder: (id: string, obj: any) => P[]): Promise<P[]> {
    const obj = await this.data;
    return builder(this.id + ':', obj);
  }

  public async getReadableProperties(): Promise<PropertyLike[]> {
    return await this.getPropertiesWithBuilder((id, obj) => buildReadablePropertyLike(id, this.path, DOCUMENT_ROOT_PATH, obj, this.logger));
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

  public async updateFrom(document: DocumentLike): Promise<void> {
    notImplemented(this, 'updateFrom');
  }
}

// tslint:disable-next-line:max-classes-per-file
export class WritableFilesystemDocument extends FilesystemDocument implements WritableDocumentLike {
  constructor(
    id: string,
    directory: string,
    path: string,
    fileName: string,
    logger: Logger,
  ) {
    super(id, directory, path, fileName, logger);
  }

  public buildEmptyWritableProperty(property: PropertyLike): WritablePropertyLike {
    return property.buildEmptyWritableProperty();
  }

  public async getWritableProperties(): Promise<WritablePropertyLike[]> {
    return this.getPropertiesWithBuilder((id, obj) => buildWritablePropertyLike(id, this.path, DOCUMENT_ROOT_PATH, obj, this.logger));
  }
}
