import * as fs from "fs";
import * as osPath from "path";
import {COLLECTION_ROOT_PATH, CollectionLike} from "../base/CollectionLike";
import {Logger, WithLogger} from "../base/Logger";
import {ReadableStore} from "../base/ReadableStore";
import {WritableStore} from "../base/WritableStore";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {Fail} from "../impl/Fail";
import {notImplemented} from "../impl/NotImplemented";
import {FilesystemCollection, WritableFilesystemCollection} from "./FilesystemCollection";
import {FilesystemDocument, WritableFilesystemDocument} from "./FilesystemDocument";
import {FilesystemNameCodec} from "./FilesystemNameCodec";

export class FilesystemStore implements ReadableStore<FilesystemCollection, FilesystemDocument>, WithLogger {
  public get directory(): string {
    return this.config.profile.directory;
  }

  public get dryRun(): boolean {
    return this.config.dryRun;
  }

  public get exists(): Promise<boolean> {
    return new Promise((resolve) => {
      fs.stat(this.directory, (err, stats) => resolve(err ? false : stats.isDirectory()));
    });
  }

  public get logger(): Logger {
    return this.config.logger;
  }

  public get nameCodec(): FilesystemNameCodec {
    return this.config.profile.nameCodec;
  }

  constructor(
    public readonly id: string,
    protected readonly config: FirestoreSyncProfileOperationAdapter,
  ) {
  }

  public buildEmptyReadableCollection(writableCollection: CollectionLike<any>): FilesystemCollection {
    return new FilesystemCollection(writableCollection.id, this.directory, COLLECTION_ROOT_PATH, this.config);
  }

  protected async getCollectionsWithBuilder<C extends FilesystemCollection>(
    createDataDirectory: boolean,
    builder: (id: string, directory: string, path: string) => C,
  ): Promise<C[]> {
    return new Promise((resolve) => {
      fs.stat(this.directory, (statErr, stats) => {
        if (statErr != null && statErr.code === 'ENOENT' && createDataDirectory) {
          fs.mkdirSync(this.directory);
        } else {
          Fail.when(statErr, 'eachCollection', this, () => `Could not stat "${this.directory}"`);
          Fail.unless(stats.isDirectory(), 'eachCollection', this, () => `Not a directory: "${this.directory}"`);
        }
        fs.readdir(this.directory, {withFileTypes: true}, (readErr, files) => {
          Fail.when(readErr, 'eachCollection', this, () => `Could not readdir "${this.directory}"`);
          const collections = files
            .filter((file) => file.isDirectory())
            .map((dir) => {
              const docId = this.nameCodec.decode(dir.name);
              return builder(
                docId,
                osPath.join(this.directory, dir.name),
                COLLECTION_ROOT_PATH + docId,
              );
            });
          resolve(collections);
        });
      });
    });
  }

  public async getReadableCollections(): Promise<FilesystemCollection[]> {
    return this.getCollectionsWithBuilder(false, (id, directory, path) => {
      return new FilesystemCollection(id, directory, path, this.config);
    });
  }

  protected idFromName(name: string): string {
    return this.nameCodec.decode(name);
  }

  protected nameFromId(id: string): string {
    return this.nameCodec.encode(id);
  }
}

// tslint:disable-next-line
export class WritableFilesystemStore extends FilesystemStore
  implements WritableStore<FilesystemCollection, WritableFilesystemCollection, FilesystemDocument, WritableFilesystemDocument> {

  public buildEmptyWritableCollection(collection: CollectionLike<any>): WritableFilesystemCollection {
    const subdirectory = osPath.join(this.directory, this.nameFromId(collection.id));
    return new WritableFilesystemCollection(collection.id, subdirectory, collection.path, this.config);
  }

  public createCollection(collection: CollectionLike<any>): void {
    notImplemented(this, 'createCollection');
  }

  public getWritableCollections(): Promise<WritableFilesystemCollection[]> {
    return this.getCollectionsWithBuilder(
      true,
      (id, directory, path) => new WritableFilesystemCollection(id, directory, path, this.config),
    );
  }

  public async updateFrom(item: ReadableStore<FilesystemCollection, FilesystemDocument>): Promise<void> {
    notImplemented(this, 'updateFrom');
  }
}
