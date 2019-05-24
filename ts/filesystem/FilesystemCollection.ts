import * as fs from 'fs';
import * as path from 'path';
import * as punycode from 'punycode';
import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {FilesystemDocument} from "./FilesystemDocument";

export class FilesystemCollection implements CollectionLike {
  constructor(
    public readonly id: string,
    private readonly directory: string,
  ) {
  }

  public withDocument(id: string, block: (document: DocumentLike) => void): void {
    const document = new FilesystemDocument(this.directory, id);
    document.load(block);
  }

  public withDocumentIds(block: (documentIds: string[]) => void): void {
    fs.readdir(this.directory, {encoding: 'utf8'}, (err, fileNames) => {
      if (err) {
        throw new Error(err.message);
      } else {
        block(fileNames
          .map((name) => name.replace(/\.json$/, ''))
          .map((punycodeId) => punycode.decode(punycodeId)),
        );
      }
    });
  }
}
