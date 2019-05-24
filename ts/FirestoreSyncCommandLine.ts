import arg = require('arg');
import {CONFIG_NAME_DEFAULT, DEFAULT_CONFIG, PROFILE_NAME_DEFAULT, SYNC_OPERATIONS} from "./FirestoreSyncConfig";

const HELP_TEXT = `
Usage: firebase-sync [operation] [options]

Operations:

  pull    Copy Firestore ==> local filesystem
  push    Copy local filesystem ==> Firestore
  sync    Copy in each direction
            Default: ${DEFAULT_CONFIG.profiles![PROFILE_NAME_DEFAULT].sync}

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
  public readonly operation?: string;
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

    this.operation = standalone.pop();
    this.configFileName = configFileName;
    this.showHelp = showHelp || this.operation == null || !SYNC_OPERATIONS.includes(this.operation);
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
    this.logger(`TODO operation: ${this.operation}`);
  }
}
