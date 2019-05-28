import * as fs from "fs";
import * as osPath from 'path';
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {PropertyLike, WritablePropertyLike} from "../base/PropertyLike";
import {WritableDocumentLike} from "../base/WritableDocumentLike";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {Fail} from "../impl/Fail";
import {buildReadablePropertyLike, buildWritablePropertyLike, DOCUMENT_ROOT_PATH} from "../impl/PropertyLikeBuilder";

export class FilesystemDocument implements DocumentLike, WithLogger {
  protected content?: string;
  protected dataPromise?: Promise<{ [key: string]: any } | undefined> = undefined;
  public readonly fullPath: string;
  protected readablePropertiesPromise?: Promise<PropertyLike[]>;

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

  public get dryRun(): boolean {
    return this.config.dryRun;
  }

  public get exists(): Promise<boolean> {
    return new Promise((resolve) => {
      fs.stat(this.fullPath, (err, stats) => resolve(err ? false : stats.isFile()));
    });
  }

  public get logger(): Logger {
    return this.config.logger;
  }

  constructor(
    public readonly id: string,
    public readonly directory: string,
    public readonly path: string,
    public readonly fileName: string,
    protected readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
    this.fullPath = osPath.join(directory, this.fileName);
  }

  public buildEmptyReadableProperty(property: PropertyLike): PropertyLike {
    return property.buildEmptyReadableProperty();
  }

  public async getReadableProperties(): Promise<PropertyLike[]> {
    if (this.readablePropertiesPromise == null) {
      this.readablePropertiesPromise = this.data.then((obj) => {
        return [buildReadablePropertyLike(
          this.id + ':' + DOCUMENT_ROOT_PATH,
          this.path,
          DOCUMENT_ROOT_PATH,
          obj,
          this.config,
        )];
      });
    }
    return this.readablePropertiesPromise;
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
  protected writablePropertiesPromise?: Promise<WritablePropertyLike[]>;

  public buildEmptyWritableProperty(property: PropertyLike): WritablePropertyLike {
    return property.buildEmptyWritableProperty();
  }

  public async getWritableProperties(): Promise<WritablePropertyLike[]> {
    if (this.writablePropertiesPromise == null) {
      this.writablePropertiesPromise = this.data.then((obj) => {
        return [buildWritablePropertyLike(
          this.id + ':' + DOCUMENT_ROOT_PATH,
          this.path,
          DOCUMENT_ROOT_PATH,
          obj,
          this.config,
        )];
      });
    }
    return this.writablePropertiesPromise;
  }

  public async updateFrom(document: DocumentLike): Promise<void> {
    if (!this.dryRun) {
      this.logger(this.constructor.name, 'updateFrom', `  ${document.constructor.name} ${this.path} => ${this.fullPath}`);
      const readables = await document.getReadableProperties();
      if (readables.length !== 1) {
        throw new Error(`Expected exactly 1 readable property for ${document.constructor.name} ${document.path}`);
      }
      const readable = readables[0];
      const writables = await this.getWritableProperties();
      if (writables.length !== 1) {
        throw new Error(`Expected exactly 1 writable property for ${this.constructor.name} ${this.path}`);
      }
      const writable = writables[0];
      await writable.updateFrom(readable);
      const updated = writable.asUpdated();
      return new Promise((resolve, reject) => fs.writeFile(
        this.fullPath,
        JSON.stringify(updated, null, this.config.profile.indentForStringify),
        {encoding: 'utf8'},
        Fail.withContext('updateFrom', this, reject).toCallbackHandler(resolve),
      ));
    }
  }
}
