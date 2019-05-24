import {Logger} from "../base/Logger";
import {ProvidedDefaultAdapter} from "../base/ProvidedDefaultAdapter";
import {FilesystemNameCodec} from "../filesystem/FilesystemNameCodec";
import {PunycodeCodec} from "../filesystem/PunycodeCodec";
import {SnakeCodec} from "../filesystem/SnakeCodec";
import {ConsoleLogger} from "../impl/ConsoleLogger";
import {FileLogger} from "../impl/FileLogger";
import {
  DEFAULT_PROFILE,
  FileNameCodec,
  FirestoreSyncOrder,
  FirestoreSyncProfile,
  FirestoreSyncProfileOperation,
} from "./FirestoreSyncConfig";

export class FirestoreSyncProfileAdapter extends ProvidedDefaultAdapter<FirestoreSyncProfile> implements FirestoreSyncProfile {
  public readonly collectionReferencePrefix: string;
  public readonly directory: string;
  public readonly documentReferencePrefix: string;
  public readonly fileNameCodec: FileNameCodec;
  public readonly geopointPrefix: string;
  public readonly log: string;
  public readonly logger: Logger;
  public readonly nameCodec: FilesystemNameCodec;
  public readonly pull: FirestoreSyncProfileOperation;
  public readonly push: FirestoreSyncProfileOperation;
  public readonly sync: FirestoreSyncOrder;
  public readonly timestampPrefix: string;

  constructor(
    public readonly defaultProfile: FirestoreSyncProfile = DEFAULT_PROFILE,
    public readonly providedProfile?: FirestoreSyncProfile,
  ) {
    super(defaultProfile, providedProfile);
    this.collectionReferencePrefix = this.get('collectionReferencePrefix');
    this.directory = this.get('directory');
    this.documentReferencePrefix = this.get('documentReferencePrefix');
    this.fileNameCodec = this.get('fileNameCodec');
    this.geopointPrefix = this.get('geopointPrefix');
    this.log = this.get('log');
    this.pull = this.get('pull');
    this.push = this.get('push');
    this.sync = this.get('sync');
    this.timestampPrefix = this.get('timestampPrefix');
    const maybeOutputStream = ConsoleLogger.toOutputStream(this.log);
    if (maybeOutputStream == null) {
      this.logger = FileLogger.appendTo(this.log);
    } else {
      this.logger = ConsoleLogger.forStream(maybeOutputStream);
    }
    if (this.fileNameCodec === FileNameCodec.PUNYCODE) {
      this.nameCodec = new PunycodeCodec();
    } else if (this.fileNameCodec === FileNameCodec.SNAKE) {
      this.nameCodec = new SnakeCodec();
    } else {
      throw new Error(`Unknown file name codec: ${this.fileNameCodec}`);
    }
  }
}
