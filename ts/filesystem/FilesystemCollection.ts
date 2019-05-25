import * as fs from 'fs';
import * as path from 'path';
import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {Logger, WithLogger} from "../base/Logger";
import {WritableCollectionLike} from "../base/WritableCollectionLike";
import {Fail} from "../impl/Fail";
import {FilesystemDocument, WritableFilesystemDocument} from "./FilesystemDocument";
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class FilesystemCollection implements CollectionLike<FilesystemDocument>, WithLogger {
  constructor(
    public readonly id: string,
    protected readonly directory: string,
    protected readonly nameCodec: FilesystemNameCodec,
    public readonly logger: Logger,
  ) {
  }

  public buildEmptyReadableDocument(document: DocumentLike): FilesystemDocument {
    return new FilesystemDocument(document.id, this.directory, this.nameFromId(document.id), this.logger);
  }

  public async getDocuments(): Promise<FilesystemDocument[]> {
    return this.getDocumentsWithBuilder(false, (id, name, fullPath) => new FilesystemDocument(id, fullPath, name, this.logger));
  }

  protected async getDocumentsWithBuilder<D>(
    createDirectory: boolean,
    builder: (id: string, name: string, path: string) => D,
  ): Promise<D[]> {
    return new Promise((resolve) => {
      fs.readdir(this.directory, {encoding: 'utf8'}, (err, fileNames) => {
        if (err != null && err.code === 'ENOENT' && createDirectory) {
          fs.mkdirSync(this.directory);
          resolve([]);
        } else {
          Fail.when(err, 'getDocuments', this, () => `Could not readdir "${this.directory}"`);
          const documents = fileNames.map((name) => builder(this.idFromName(name), name, path.join(this.directory, name)));
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
    nameCodec: FilesystemNameCodec,
    logger: Logger,
  ) {
    super(id, directory, nameCodec, logger);
  }

  public buildEmptyWritableDocument(document: DocumentLike): WritableFilesystemDocument {
    return new WritableFilesystemDocument(document.id, this.directory, this.nameFromId(document.id), this.logger);
  }

  public async getDocuments(): Promise<WritableFilesystemDocument[]> {
    return this.getDocumentsWithBuilder(true, (id, name, fullPath) => new WritableFilesystemDocument(id, fullPath, name, this.logger));
  }
}
