import arg = require('arg');
import * as fs from 'fs';
import {
  CONFIG_NAME_DEFAULT,
  DEFAULT_CONFIG,
  DEFAULT_PROFILE,
  FirestoreSyncConfig,
  FirestoreSyncOperation,
  PROFILE_NAME_DEFAULT,
  SYNC_OPERATIONS,
} from "../config/FirestoreSyncConfig";
import {FirestoreSyncClient} from "./FirestoreSyncClient";

const HELP_TEXT = `
Usage: firebase-sync [operation] [options]

Operations:

  pull    Copy Firestore ==> local filesystem
  push    Copy local filesystem ==> Firestore
  sync    Copy in each direction
            Default: ${DEFAULT_PROFILE.sync}

  In each direction, config flags control the copy/merge/delete strategy.
  You can define profiles with flags commensurate to the level of
  paranoia or indifference for the operation.  For example, you might
  have a "dev" profile that blindly overwrites anything in Firestore,
  and a "prod" profile that overwrites anything local.

Options:

  -c, --config path     Path to config JSON file
                          Default: ${CONFIG_NAME_DEFAULT}
  -p, --profile name    Profile name within the config
                          Default: ${PROFILE_NAME_DEFAULT}
      --defaults        Show a default configuration and exit
`;

export class FirestoreSyncCommandLine {
  public readonly configFileName: string;
  public readonly operation: FirestoreSyncOperation;
  public readonly profileName: string;
  public readonly showDefaults: boolean;
  public readonly showHelp: boolean;

  constructor(
    argv: string[],
    private readonly logger: (message: string, ...args: any[]) => void,
  ) {
    const args = arg({
      '--config': String,
      '--defaults': Boolean,
      '--help': Boolean,
      '--profile': String,
      // aliases
      '-?': '--help',
      '-c': '--config',
      '-h': '--help',
      '-p': '--profile',
    }, {
      argv,
    });

    const {
      '_': standalone = [],
      '--config': configFileName = CONFIG_NAME_DEFAULT,
      '--defaults': showDefaults = false,
      '--help': showHelp = false,
      '--profile': profileName = PROFILE_NAME_DEFAULT,
    } = args;

    const maybeOperationName: string | undefined = standalone.pop();
    const validOperation = SYNC_OPERATIONS.includes(maybeOperationName || '');
    this.operation = validOperation ? maybeOperationName as FirestoreSyncOperation : FirestoreSyncOperation.SYNC;
    this.configFileName = configFileName;
    this.showHelp = showHelp || !validOperation;
    this.showDefaults = showDefaults;
    this.profileName = profileName;
  }

  public run() {
    if (this.showDefaults) {
      this.logger(JSON.stringify(DEFAULT_CONFIG, null, 2));
      return;
    }
    if (this.showHelp) {
      this.logger(HELP_TEXT);
      return;
    }
    fs.readFile(this.configFileName, {encoding: 'utf8'}, (err, configJSON) => {
      if (err) {
        this.logger(`Error trying to read ${this.configFileName}:\n${err.message}`);
        throw new Error(err.message);
      }
      const config: FirestoreSyncConfig = JSON.parse(configJSON);
      const client = new FirestoreSyncClient(config);
      client.perform(this.operation, this.profileName);
    });
  }
}
