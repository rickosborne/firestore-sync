import * as fs from "fs";
import * as path from "path";
import {Logger, WithLogger} from "../base/Logger";
import {ReadableStore} from "../base/ReadableStore";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {Fail} from "../impl/Fail";
import {FilesystemCollection} from "./FilesystemCollection";
import {FilesystemDocument} from "./FilesystemDocument";
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class FilesystemReader implements ReadableStore<FilesystemCollection, FilesystemDocument>, WithLogger {
  private readonly directory: string;
  public readonly logger: Logger;
  private readonly nameCodec: FilesystemNameCodec;

  constructor(
    config: FirestoreSyncProfileOperationAdapter,
  ) {
    this.directory = config.profile.directory;
    this.logger = config.logger;
    this.nameCodec = config.profile.nameCodec;
  }

  public async getCollections(): Promise<FilesystemCollection[]> {
    return new Promise((resolve) => {
      fs.stat(this.directory, (statErr, stats) => {
        Fail.when(statErr, 'eachCollection', this, () => `Could not stat "${this.directory}"`);
        Fail.unless(stats.isDirectory(), 'eachCollection', this, () => `Not a directory: "${this.directory}"`);
        fs.readdir(this.directory, {withFileTypes: true}, (readErr, files) => {
          Fail.when(readErr, 'eachCollection', this, () => `Could not readdir "${this.directory}"`);
          const collections = files
            .filter((file) => file.isDirectory())
            .map((dir) => new FilesystemCollection(
              this.nameCodec.decode(dir.name),
              path.join(this.directory, dir.name),
              this.nameCodec,
              this.logger,
            ));
          resolve(collections);
        });
      });
    });
  }
}
