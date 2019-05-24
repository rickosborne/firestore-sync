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
import {FilesystemCollectionVisitor} from "../filesystem/FilesystemCollectionVisitor";
import {FilesystemDocumentVisitor} from "../filesystem/FilesystemDocumentVisitor";
import {FilesystemReader} from "../filesystem/FilesystemReader";
import {FilesystemWriter} from "../filesystem/FilesystemWriter";
import {FirestoreCollectionVisitor} from "../firestore/FirestoreCollectionVisitor";
import {FirestoreDocumentVisitor} from "../firestore/FirestoreDocumentVisitor";
import {FirestoreReader} from "../firestore/FirestoreReader";
import {FirestoreWriter} from "../firestore/FirestoreWriter";
import {SyncWalker} from "./SyncWalker";

export class FirestoreSyncClient {
  private readonly config: FirestoreSyncConfigAdapter;

  constructor(
    readonly providedConfig: FirestoreSyncConfig,
    readonly defaultConfig: FirestoreSyncConfig = DEFAULT_CONFIG,
  ) {
    this.config = new FirestoreSyncConfigAdapter(providedConfig, defaultConfig);
  }

  public perform(operation: FirestoreSyncOperation, profileName: string): void {
    if (!this.config.hasProfile(profileName)) {
      throw new Error(`Profile not found: ${profileName}`);
    }
    console.error(`TODO: operation=${operation} profile=${profileName} config=${JSON.stringify(this.config, null, 2)}`);
    const profile = this.config.getProfile(profileName);
    if (operation === FirestoreSyncOperation.PULL) {
      this.pull(profile);
    } else if (operation === FirestoreSyncOperation.PUSH) {
      this.push(profile);
    } else if (operation === FirestoreSyncOperation.SYNC) {
      this.sync(profile);
    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }
  }

  // noinspection JSMethodCanBeStatic
  public pull(profile: FirestoreSyncProfileAdapter): void {
    const operation = new FirestoreSyncProfileOperationAdapter(profile, DEFAULT_PROFILE_PULL, profile.pull);
    SyncWalker.walk(
      new FirestoreReader(operation),
      new FilesystemWriter(operation),
      new FirestoreCollectionVisitor(operation),
      new FirestoreDocumentVisitor(operation),
    );
  }

  // noinspection JSMethodCanBeStatic
  private push(profile: FirestoreSyncProfileAdapter): void {
    const operation = new FirestoreSyncProfileOperationAdapter(profile, DEFAULT_PROFILE_PULL, profile.push);
    SyncWalker.walk(
      new FilesystemReader(operation),
      new FirestoreWriter(operation),
      new FilesystemCollectionVisitor(operation),
      new FilesystemDocumentVisitor(operation),
    );
  }

  private sync(profile: FirestoreSyncProfileAdapter): void {
    const order = profile.sync;
    if (order === FirestoreSyncOrder.PULL_THEN_PUSH) {
      this.pull(profile);
      this.push(profile);
    } else if (order === FirestoreSyncOrder.PUSH_THEN_PULL) {
      this.push(profile);
      this.pull(profile);
    } else {
      throw new Error(`Unknown sync order: ${order}`);
    }
  }
}
