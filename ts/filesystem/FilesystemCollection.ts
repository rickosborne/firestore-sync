import * as fs from 'fs';
import * as osPath from 'path';
import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {WritableCollectionLike} from "../base/WritableCollectionLike";
import {Fail} from "../impl/Fail";
import {notImplemented} from "../impl/NotImplemented";
import {FilesystemDocument, WritableFilesystemDocument} from "./FilesystemDocument";
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class FilesystemCollection implements CollectionLike<FilesystemDocument>, WithLogger {
  private readonly name: string;

  public get exists(): Promise<boolean> {
    return new Promise((resolve) => {
      fs.stat(this.directory, (err, stats) => resolve(err ? false : stats.isDirectory()));
    });
  }

  constructor(
    public readonly id: string,
    protected readonly directory: string,
    public readonly path: string,
    protected readonly nameCodec: FilesystemNameCodec,
    public readonly dryRun: boolean,
    public readonly logger: Logger,
  ) {
    this.name = nameCodec.encode(id);
  }

  public buildEmptyReadableDocument(document: DocumentLike): FilesystemDocument {
    return new FilesystemDocument(document.id, this.directory, document.path, this.nameFromId(document.id), this.dryRun, this.logger);
  }

  public async getDocuments(): Promise<FilesystemDocument[]> {
    return this.getDocumentsWithBuilder(false, (id, name, path, directory) => {
      return new FilesystemDocument(id, directory, path, name, this.dryRun, this.logger);
    });
  }

  protected async getDocumentsWithBuilder<D>(
    createDirectory: boolean,
    builder: (id: string, name: string, path: string, directory: string) => D,
  ): Promise<D[]> {
    return new Promise((resolve) => {
      fs.readdir(this.directory, {encoding: 'utf8'}, (err, fileNames) => {
        if (err != null && err.code === 'ENOENT' && createDirectory) {
          fs.mkdirSync(this.directory);
          resolve([]);
        } else {
          Fail.when(err, 'getDocuments', this, () => `Could not readdir "${this.directory}"`);
          const documents = fileNames.map((name) => {
            const docId = this.idFromName(name);
            return builder(docId, name, `${this.path}/${docId}`, osPath.join(this.directory, name));
          });
          resolve(documents);
        }
      });
    });
  }

  protected idFromName(name: string): string {
    const encodedId = name.replace(/\.json$/, '');
    return this.nameCodec.decode(encodedId);
  }

  protected nameFromId(id: string): string {
    return this.nameCodec.encode(id) + '.json';
  }
}

// tslint:disable-next-line
export class WritableFilesystemCollection extends FilesystemCollection implements WritableCollectionLike<FilesystemDocument, WritableFilesystemDocument> {
  constructor(
    id: string,
    directory: string,
    path: string,
    nameCodec: FilesystemNameCodec,
    dryRun: boolean,
    logger: Logger,
  ) {
    super(id, directory, path, nameCodec, dryRun, logger);
  }

  public buildEmptyWritableDocument(document: DocumentLike): WritableFilesystemDocument {
    return new WritableFilesystemDocument(
      document.id,
      this.directory,
      document.path,
      this.nameFromId(document.id),
      this.dryRun,
      this.logger,
    );
  }

  public async getDocuments(): Promise<WritableFilesystemDocument[]> {
    return this.getDocumentsWithBuilder(true, (id, name, path, directory) => {
      return new WritableFilesystemDocument(id, directory, path, name, this.dryRun, this.logger);
    });
  }

  public async updateFrom(collection: CollectionLike<any>): Promise<void> {
    notImplemented(this, 'updateFrom');
  }
}
