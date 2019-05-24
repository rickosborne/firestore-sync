import * as fs from 'fs';
import {CollectionLike} from "../base/CollectionLike";
import {FilesystemDocument} from "./FilesystemDocument";
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class FilesystemCollection implements CollectionLike<FilesystemDocument> {
  constructor(
    public readonly id: string,
    private readonly directory: string,
    private readonly nameCodec: FilesystemNameCodec,
  ) {
  }

  public withDocument(id: string, block: (document: FilesystemDocument) => void): void {
    const fileName = this.nameCodec.encode(id) + '.json';
    const document = new FilesystemDocument(id, this.directory, fileName);
    document.load(block);
  }

  public withDocumentIds(block: (documentIds: string[]) => void): void {
    fs.readdir(this.directory, {encoding: 'utf8'}, (err, fileNames) => {
      if (err) {
        throw new Error(err.message);
      } else {
        block(fileNames
          .map((name) => name.replace(/\.json$/, ''))
          .map((encoded) => this.nameCodec.decode(encoded)),
        );
      }
    });
  }
}
