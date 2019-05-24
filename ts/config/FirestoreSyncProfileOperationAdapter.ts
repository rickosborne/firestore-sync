import {Logger} from "../base/Logger";
import {ProvidedDefaultAdapter} from "../base/ProvidedDefaultAdapter";
import {FirestoreOnTypeMismatch, FirestoreSyncProfileOperation} from "./FirestoreSyncConfig";
import {FirestoreSyncProfileAdapter} from "./FirestoreSyncProfileAdapter";

export class FirestoreSyncProfileOperationAdapter extends ProvidedDefaultAdapter<FirestoreSyncProfileOperation>
  implements FirestoreSyncProfileOperation {
  public readonly createCollections: boolean;
  public readonly createDocuments: boolean;
  public readonly createValues: boolean;
  public readonly deleteCollections: boolean;
  public readonly deleteDocuments: boolean;
  public readonly deleteValues: boolean;
  public readonly logCreates: boolean;
  public readonly logDeletes: boolean;
  public readonly logger: Logger;
  public readonly logUpdates: boolean;
  public readonly onTypeMismatch: FirestoreOnTypeMismatch;
  public readonly updateCollections: boolean;
  public readonly updateDocuments: boolean;
  public readonly updateValues: boolean;

  constructor(
    public readonly profile: FirestoreSyncProfileAdapter,
    defaultOperation: FirestoreSyncProfileOperation,
    providedOperation: FirestoreSyncProfileOperation,
  ) {
    super(defaultOperation, providedOperation);
    this.createCollections = this.get('createCollections');
    this.createDocuments = this.get('createDocuments');
    this.createValues = this.get('createValues');
    this.deleteCollections = this.get('deleteCollections');
    this.deleteDocuments = this.get('deleteDocuments');
    this.deleteValues = this.get('deleteValues');
    this.logCreates = this.get('logCreates');
    this.logDeletes = this.get('logDeletes');
    this.logUpdates = this.get('logUpdates');
    this.onTypeMismatch = this.get('onTypeMismatch');
    this.updateCollections = this.get('updateCollections');
    this.updateDocuments = this.get('updateDocuments');
    this.updateValues = this.get('updateValues');
    this.logger = profile.logger;
  }
}
