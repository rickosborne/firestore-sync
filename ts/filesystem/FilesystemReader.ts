import * as fs from "fs";
import * as path from "path";
import {CollectionLike} from "../base/CollectionLike";
import {DocumentLike} from "../base/DocumentLike";
import {ComponentLogger, ripCord, RipCord} from "../base/Logger";
import {ReadableStore} from "../base/ReadableStore";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {FilesystemCollection} from "./FilesystemCollection";
import {FilesystemDocument} from "./FilesystemDocument";
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class FilesystemReader implements ReadableStore<FilesystemCollection, FilesystemDocument> {
  private readonly directory: string;
  private readonly logger: ComponentLogger;
  private readonly nameCodec: FilesystemNameCodec;
  private readonly ripCord: RipCord;

  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    this.directory = config.profile.directory;
    this.logger = config.logger.bind(this, this.constructor.name);
    this.ripCord = ripCord(this.logger);
    this.nameCodec = config.profile.nameCodec;
  }

  public withCollection(readCollection: CollectionLike<any>, block: (writeCollection: FilesystemCollection) => void): void {
    throw new Error('Not implemented: FilesystemClient#withCollection');
  }

  public withCollections(block: (readCollections: FilesystemCollection[]) => void): void {
    fs.stat(this.directory, (statErr, stats) => {
      this.ripCord(statErr, 'eachCollection', () => `Could not stat "${this.directory}"`);
      this.ripCord(!stats.isDirectory(), 'eachCollection', () => `Not a directory: "${this.directory}"`);
      fs.readdir(this.directory, {withFileTypes: true}, (readErr, files) => {
        this.ripCord(readErr, 'eachCollection', () => `Could not readdir "${this.directory}"`);
        const collections = files
          .filter((file) => file.isDirectory())
          .map((dir) => new FilesystemCollection(
            this.nameCodec.decode(dir.name),
            path.join(this.directory, dir.name),
            this.nameCodec,
          ));
        block(collections);
      });
    });
  }

  public withDocument(collection: CollectionLike<any>, documentId: string, block: (document: FilesystemDocument) => void): void {
    throw new Error('Not implemented: FilesystemClient#withDocument');
  }
}
