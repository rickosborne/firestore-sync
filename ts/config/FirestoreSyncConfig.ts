export const PROFILE_NAME_DEFAULT = 'default';
export const CONFIG_NAME_DEFAULT = '.firestore-sync.json';

export interface FirestoreSyncConfig {
  dryRun?: boolean;
  readonly profiles?: {
    readonly [name: string]: FirestoreSyncProfile;
  };
}

export enum FirestoreSyncOperation {
  PULL = 'pull',
  PUSH = 'push',
  SYNC = 'sync',
}

export const SYNC_OPERATIONS: string[] = [
  FirestoreSyncOperation.PULL,
  FirestoreSyncOperation.PUSH,
  FirestoreSyncOperation.SYNC,
];

export enum FirestoreSyncOrder {
  /* useful for backups */
  PULL_THEN_PUSH = 'pull-then-push',
  /* useful for development/seeding */
  PUSH_THEN_PULL = 'push-then-pull',
}

export enum FileNameCodec {
  PUNYCODE = 'punycode',
  SNAKE = 'snake',
}

export interface FirestoreSyncProfile {
  readonly collectionReferencePrefix?: string;
  readonly databaseURL?: string;
  readonly directory?: string;
  readonly documentReferencePrefix?: string;
  readonly dryRun?: boolean;
  readonly fileNameCodec?: FileNameCodec;
  readonly geopointPrefix?: string;
  readonly log?: string;
  readonly pull?: FirestoreSyncProfileOperation;
  readonly push?: FirestoreSyncProfileOperation;
  readonly serviceAccountKeyPath?: string;
  readonly sync?: FirestoreSyncOrder;
  readonly timestampPrefix?: string;
}

export enum FirestoreOnTypeMismatch {
  LOG = 'log',
  FAIL = 'fail',
  SKIP_VALUE = 'skip-value',
  SKIP_DOCUMENT = 'skip-document',
}

export interface FirestoreSyncProfileOperation {
  readonly createCollections?: boolean;
  readonly createDocuments?: boolean;
  readonly createValues?: boolean;
  readonly deleteCollections?: boolean;
  readonly deleteDocuments?: boolean;
  readonly deleteValues?: boolean;
  readonly dryRun?: boolean;
  readonly logCreates?: boolean;
  readonly logDeletes?: boolean;
  readonly logSkips?: boolean;
  readonly logUpdates?: boolean;
  readonly onTypeMismatch?: FirestoreOnTypeMismatch;
  readonly updateCollections?: boolean;
  readonly updateDocuments?: boolean;
  readonly updateValues?: boolean;
}

export const DEFAULT_PROFILE_PULL: Required<FirestoreSyncProfileOperation> = {
  createCollections: true,
  createDocuments: true,
  createValues: true,
  deleteCollections: false,
  deleteDocuments: false,
  deleteValues: false,
  dryRun: false,
  logCreates: false,
  logDeletes: false,
  logSkips: true,
  logUpdates: false,
  onTypeMismatch: FirestoreOnTypeMismatch.LOG,
  updateCollections: true,
  updateDocuments: true,
  updateValues: true,
};

export const DEFAULT_PROFILE_PUSH: Required<FirestoreSyncProfileOperation> = {
  createCollections: true,
  createDocuments: true,
  createValues: true,
  deleteCollections: false,
  deleteDocuments: false,
  deleteValues: false,
  dryRun: false,
  logCreates: true,
  logDeletes: true,
  logSkips: true,
  logUpdates: true,
  onTypeMismatch: FirestoreOnTypeMismatch.FAIL,  // paranoia!
  updateCollections: true,
  updateDocuments: true,
  updateValues: false,  // paranoia!
};

export type RequiredExcept<REQ, OPT extends keyof REQ> = {
  [KEY in Exclude<keyof REQ, OPT>]: Exclude<REQ[KEY], undefined | null>;
} & {
  [KEY in OPT]: REQ[KEY];
};

export const DEFAULT_PROFILE: RequiredExcept<FirestoreSyncProfile, 'databaseURL' | 'serviceAccountKeyPath'> = {
  collectionReferencePrefix: "$firestore:collection$",
  directory: './data',
  documentReferencePrefix: "$firestore:document$",
  dryRun: false,
  fileNameCodec: FileNameCodec.SNAKE,
  geopointPrefix: "$firestore:geopoint$",
  log: '',
  pull: DEFAULT_PROFILE_PULL,
  push: DEFAULT_PROFILE_PUSH,
  sync: FirestoreSyncOrder.PULL_THEN_PUSH,
  timestampPrefix: "$firestore:timestamp$",
};

export const DEFAULT_CONFIG: Required<FirestoreSyncConfig> = {
  dryRun: false,
  profiles: {
    [PROFILE_NAME_DEFAULT]: DEFAULT_PROFILE,
  },
};
