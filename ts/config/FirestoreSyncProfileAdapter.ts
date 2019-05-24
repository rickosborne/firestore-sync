import {ProvidedDefaultAdapter} from "../base/ProvidedDefaultAdapter";
import {
  DEFAULT_PROFILE,
  FirestoreSyncOrder,
  FirestoreSyncProfile,
  FirestoreSyncProfileOperation,
} from "./FirestoreSyncConfig";

export class FirestoreSyncProfileAdapter extends ProvidedDefaultAdapter<FirestoreSyncProfile> implements FirestoreSyncProfile {
  public get collectionReferencePrefix(): string {
    return this.get('collectionReferencePrefix');
  }

  public get directory(): string {
    return this.get('directory');
  }

  public get documentReferencePrefix(): string {
    return this.get('documentReferencePrefix');
  }

  public get geopointPrefix(): string {
    return this.get('geopointPrefix');
  }

  public get log(): string {
    return this.get('log');
  }

  public get pull(): FirestoreSyncProfileOperation {
    return this.get('pull');
  }

  public get push(): FirestoreSyncProfileOperation {
    return this.get('push');
  }

  public get sync(): FirestoreSyncOrder {
    return this.get('sync');
  }

  public get timestampPrefix(): string {
    return this.get('timestampPrefix');
  }

  constructor(
    public readonly defaultProfile: FirestoreSyncProfile = DEFAULT_PROFILE,
    public readonly providedProfile?: FirestoreSyncProfile,
  ) {
    super(defaultProfile, providedProfile);
  }
}
