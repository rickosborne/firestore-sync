import {ProvidedDefaultAdapter} from "../base/ProvidedDefaultAdapter";
import {FirestoreOnTypeMismatch, FirestoreSyncProfileOperation} from "./FirestoreSyncConfig";

export class FirestoreSyncProfileOperationAdapter extends ProvidedDefaultAdapter<FirestoreSyncProfileOperation>
  implements FirestoreSyncProfileOperation {
  public get createCollections(): boolean {
    return this.get('createCollections');
  }

  public get createDocuments(): boolean {
    return this.get('createDocuments');
  }

  public get createValues(): boolean {
    return this.get('createValues');
  }

  public get deleteCollections(): boolean {
    return this.get('deleteCollections');
  }

  public get deleteDocuments(): boolean {
    return this.get('deleteDocuments');
  }

  public get deleteValues(): boolean {
    return this.get('deleteValues');
  }

  public get logCreates(): boolean {
    return this.get('logCreates');
  }

  public get logDeletes(): boolean {
    return this.get('logDeletes');
  }

  public get logUpdates(): boolean {
    return this.get('logUpdates');
  }

  public get onTypeMismatch(): FirestoreOnTypeMismatch {
    return this.get('onTypeMismatch');
  }

  public get updateCollections(): boolean {
    return this.get('updateCollections');
  }

  public get updateDocuments(): boolean {
    return this.get('updateDocuments');
  }

  public get updateValues(): boolean {
    return this.get('updateValues');
  }

  constructor(
    defaultOperation: FirestoreSyncProfileOperation,
    providedOperation: FirestoreSyncProfileOperation,
  ) {
    super(defaultOperation, providedOperation);
  }
}
