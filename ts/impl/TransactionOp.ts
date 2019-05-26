export enum OpAction {
  NOOP = 'noop',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum OpLevel {
  COLLECTION = 'collection',
  DOCUMENT = 'document',
  VALUE = 'value',
}

export enum OpStatus {
  NOOP = 'noop',
  SUCCESS = 'success',
  SKIPPED = 'skipped',
  FAILED = 'failed',
}

export type OpApply = () => Promise<OpStatus>;

export interface TransactionOp {
  readonly action: OpAction;
  apply: OpApply;
  readonly level: OpLevel;
  readonly path: string;
}
