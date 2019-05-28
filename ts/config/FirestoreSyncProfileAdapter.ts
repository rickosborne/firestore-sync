import {Logger} from "../base/Logger";
import {FilesystemNameCodec} from "../filesystem/FilesystemNameCodec";
import {PunycodeCodec} from "../filesystem/PunycodeCodec";
import {SnakeCodec} from "../filesystem/SnakeCodec";
import {ConsoleLogger} from "../impl/ConsoleLogger";
import {FileLogger} from "../impl/FileLogger";
import {ProvidedDefaultAdapter} from "../impl/ProvidedDefaultAdapter";
import {
  FileNameCodec,
  FirestoreSyncOrder,
  FirestoreSyncProfile,
  FirestoreSyncProfileOperation,
} from "./FirestoreSyncConfig";
import {FirestoreSyncProfileOperationAdapter} from "./FirestoreSyncProfileOperationAdapter";

export class FirestoreSyncProfileAdapter extends ProvidedDefaultAdapter<FirestoreSyncProfile> implements FirestoreSyncProfile {
  public readonly collectionReferencePrefix: string;
  public readonly databaseURL: string;
  public readonly directory: string;
  public readonly documentReferencePrefix: string;
  public readonly fileNameCodec: FileNameCodec;
  public readonly geopointPrefix: string;
  public readonly indent: string | number;
  public readonly log: string;
  public readonly logger: Logger;
  public readonly nameCodec: FilesystemNameCodec;
  public readonly pull: FirestoreSyncProfileOperation | undefined;
  public readonly push: FirestoreSyncProfileOperation | undefined;
  public readonly serviceAccountKeyPath: string;
  public readonly sync: FirestoreSyncOrder;
  public readonly timestampPrefix: string;

  public get indentForStringify(): string | number | undefined {
    return this.indent === '' || this.indent == null ? undefined : this.indent;
  }

  constructor(
    public readonly providedProfile: FirestoreSyncProfile | undefined,
    public readonly defaultProfile: FirestoreSyncProfile | undefined,
    public readonly defaults: FirestoreSyncProfile,
    public readonly dryRun: boolean = false,
  ) {
    super(providedProfile, defaultProfile, defaults);
    this.collectionReferencePrefix = this.get('collectionReferencePrefix');
    this.databaseURL = this.get('databaseURL');
    this.directory = this.get('directory');
    this.documentReferencePrefix = this.get('documentReferencePrefix');
    this.fileNameCodec = this.get('fileNameCodec');
    this.geopointPrefix = this.get('geopointPrefix');
    this.indent = this.get('indent');
    this.log = this.get('log');
    this.pull = new FirestoreSyncProfileOperationAdapter(
      this,
      providedProfile != null ? providedProfile.pull : undefined,
      defaultProfile != null ? defaultProfile.pull : undefined,
      defaults.pull,
    );
    this.push = new FirestoreSyncProfileOperationAdapter(
      this,
      providedProfile != null ? providedProfile.push : undefined,
      defaultProfile != null ? defaultProfile.push : undefined,
      defaults.push,
    );
    this.serviceAccountKeyPath = this.get('serviceAccountKeyPath');
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
