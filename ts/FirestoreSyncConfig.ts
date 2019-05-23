export interface FirestoreSyncConfig {
  readonly profiles?: {
    readonly [name: string]: FirestoreSyncProfile,
  };
}

export enum FirestoreSyncOrder {
  /* useful for backups */
  PULL_THEN_PUSH = 'pull-then-push',
  /* useful for development/seeding */
  PUSH_THEN_PULL = 'push-then-pull',
}

export interface FirestoreSyncProfile {
  readonly collectionReferencePrefix?: string;
  readonly directory?: string;
  readonly documentReferencePrefix?: string;
  readonly geopointPrefix?: string;
  readonly log?: string;
  readonly pull?: FirestoreSyncProfileOperation;
  readonly push?: FirestoreSyncProfileOperation;
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
  readonly logCreates?: boolean;
  readonly logDeletes?: boolean;
  readonly logUpdates?: boolean;
  readonly onTypeMismatch?: FirestoreOnTypeMismatch;
  readonly updateCollections?: boolean;
  readonly updateDocuments?: boolean;
  readonly updateValues?: boolean;
}

export const DEFAULT_PROFILE_PULL: FirestoreSyncProfileOperation = {
  createCollections: true,
  createDocuments: true,
  createValues: true,
  deleteCollections: false,
  deleteDocuments: false,
  deleteValues: false,
  logCreates: false,
  logDeletes: false,
  logUpdates: false,
  onTypeMismatch: FirestoreOnTypeMismatch.LOG,
  updateCollections: true,
  updateDocuments: true,
  updateValues: true,
};

export const DEFAULT_PROFILE_PUSH: FirestoreSyncProfileOperation = {
  createCollections: true,
  createDocuments: true,
  createValues: true,
  deleteCollections: false,
  deleteDocuments: false,
  deleteValues: false,
  logCreates: true,
  logDeletes: true,
  logUpdates: true,
  onTypeMismatch: FirestoreOnTypeMismatch.FAIL,  // paranoia!
  updateCollections: true,
  updateDocuments: true,
  updateValues: false,  // paranoia!
};

export const PROFILE_NAME_DEFAULT = 'default';

export const DEFAULT_PROFILE: FirestoreSyncProfile = {
  collectionReferencePrefix: "$firestore:collection$",
  directory: './data',
  documentReferencePrefix: "$firestore:document$",
  geopointPrefix: "$firestore:geopoint$",
  log: '',
  pull: DEFAULT_PROFILE_PULL,
  push: DEFAULT_PROFILE_PUSH,
  sync: FirestoreSyncOrder.PULL_THEN_PUSH,
  timestampPrefix: "$firestore:timestamp$",
};

export const DEFAULT_CONFIG: FirestoreSyncConfig = {
  profiles: {
    [PROFILE_NAME_DEFAULT]: DEFAULT_PROFILE,
  },
};
