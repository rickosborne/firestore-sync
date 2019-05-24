import {ProvidedDefaultAdapter} from "../base/ProvidedDefaultAdapter";
import {
  DEFAULT_CONFIG,
  DEFAULT_PROFILE,
  FirestoreSyncConfig,
  FirestoreSyncProfile,
  PROFILE_NAME_DEFAULT,
} from "./FirestoreSyncConfig";
import {FirestoreSyncProfileAdapter} from "./FirestoreSyncProfileAdapter";

export class FirestoreSyncConfigAdapter extends ProvidedDefaultAdapter<FirestoreSyncConfig> implements FirestoreSyncConfig {
  public get defaultProfile(): FirestoreSyncProfileAdapter {
    return this.getProfile(PROFILE_NAME_DEFAULT);
  }

  public get profiles(): { [profileName: string]: FirestoreSyncProfile } {
    return this.get('profiles');
  }

  constructor(
    public readonly providedConfig: FirestoreSyncConfig,
    public readonly defaultConfig: FirestoreSyncConfig = DEFAULT_CONFIG,
  ) {
    super(providedConfig, defaultConfig);
  }

  public getProfile(profileName: string): FirestoreSyncProfileAdapter {
    return new FirestoreSyncProfileAdapter(
      DEFAULT_PROFILE,
      this.providedConfig.profiles != null ? this.providedConfig.profiles[profileName] : undefined,
    );
  }

  public hasProfile(profileName: string): boolean {
    return profileName === PROFILE_NAME_DEFAULT
      || (this.providedConfig.profiles != null && profileName in this.providedConfig.profiles)
      || (this.defaultConfig.profiles != null && profileName in this.defaultConfig.profiles)
      ;
  }
}
