import {
  DEFAULT_CONFIG,
  DEFAULT_PROFILE_PULL,
  FirestoreSyncConfig,
  FirestoreSyncOperation,
  FirestoreSyncOrder,
} from "../config/FirestoreSyncConfig";
import {FirestoreSyncConfigAdapter} from "../config/FirestoreSyncConfigAdapter";
import {FirestoreSyncProfileAdapter} from "../config/FirestoreSyncProfileAdapter";
import {FirestoreSyncProfileOperationAdapter} from "../config/FirestoreSyncProfileOperationAdapter";
import {FilesystemReader} from "../filesystem/FilesystemReader";
import {FilesystemWriter} from "../filesystem/FilesystemWriter";
import {FirestoreReader} from "../firestore/FirestoreReader";
import {FirestoreWriter} from "../firestore/FirestoreWriter";
import {StoreVisitor} from "./StoreVisitor";
import {SyncWalker} from "./SyncWalker";

export class FirestoreSyncClient {
  private readonly config: FirestoreSyncConfigAdapter;

  constructor(
    readonly providedConfig: FirestoreSyncConfig,
    readonly defaultConfig: FirestoreSyncConfig = DEFAULT_CONFIG,
  ) {
    this.config = new FirestoreSyncConfigAdapter(providedConfig, defaultConfig);
  }

  public async perform(operation: FirestoreSyncOperation, profileName: string): Promise<void> {
    if (!this.config.hasProfile(profileName)) {
      throw new Error(`Profile not found: ${profileName}`);
    }
    console.error(`TODO: operation=${operation} profile=${profileName} config=${JSON.stringify(this.config, null, 2)}`);
    const profile = this.config.getProfile(profileName);
    if (operation === FirestoreSyncOperation.PULL) {
      await this.pull(profile);
    } else if (operation === FirestoreSyncOperation.PUSH) {
      await this.push(profile);
    } else if (operation === FirestoreSyncOperation.SYNC) {
      await this.sync(profile);
    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }
  }

  // noinspection JSMethodCanBeStatic
  public async pull(profile: FirestoreSyncProfileAdapter): Promise<void> {
    const operation = new FirestoreSyncProfileOperationAdapter(profile, DEFAULT_PROFILE_PULL, profile.pull);
    const storeVisitor = new StoreVisitor(new FirestoreReader(operation), new FilesystemWriter(operation), operation);
    await new SyncWalker().walkCollections(storeVisitor);
  }

  // noinspection JSMethodCanBeStatic
  private async push(profile: FirestoreSyncProfileAdapter): Promise<void> {
    const operation = new FirestoreSyncProfileOperationAdapter(profile, DEFAULT_PROFILE_PULL, profile.push);
    const storeVisitor = new StoreVisitor(new FilesystemReader(operation), new FirestoreWriter(operation), operation);
    await new SyncWalker().walkCollections(storeVisitor);
  }

  private async sync(profile: FirestoreSyncProfileAdapter): Promise<void> {
    const order = profile.sync;
    if (order === FirestoreSyncOrder.PULL_THEN_PUSH) {
      await this.pull(profile);
      await this.push(profile);
    } else if (order === FirestoreSyncOrder.PUSH_THEN_PULL) {
      await this.push(profile);
      await this.pull(profile);
    } else {
      throw new Error(`Unknown sync order: ${order}`);
    }
  }
}
