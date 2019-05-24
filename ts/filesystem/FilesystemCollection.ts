import * as fs from 'fs';
import {CollectionLike} from "../base/CollectionLike";
import {Logger, WithLogger} from "../base/Logger";
import {Fail} from "../impl/Fail";
import {FilesystemDocument} from "./FilesystemDocument";
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class FilesystemCollection implements CollectionLike<FilesystemDocument>, WithLogger {
  constructor(
    public readonly id: string,
    private readonly directory: string,
    private readonly nameCodec: FilesystemNameCodec,
    public readonly logger: Logger,
  ) {
  }

  public withDocument(id: string, block: (document: FilesystemDocument) => void): void {
    const fileName = this.nameCodec.encode(id) + '.json';
    const document = new FilesystemDocument(id, this.directory, fileName, this.logger);
    document.load(block);
  }

  public withDocumentIds(block: (documentIds: string[]) => void): void {
    fs.readdir(this.directory, {encoding: 'utf8'}, (err, fileNames) => {
      Fail.when(err, 'withDocumentIds', this, () => `Could not readdir "${this.directory}"`);
      block(fileNames
        .map((name) => name.replace(/\.json$/, ''))
        .map((encoded) => this.nameCodec.decode(encoded)),
      );
    });
  }
}
