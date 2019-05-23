#!/usr/bin/env node

import arg = require('arg');
import * as console from 'console';
import * as process from 'process';
import {CONFIG_NAME_DEFAULT, DEFAULT_CONFIG, PROFILE_NAME_DEFAULT} from "../FirestoreSyncConfig";

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
});

const {
  '_': operation = [],
  '--config': configFileName = CONFIG_NAME_DEFAULT,
  '--defaults': showDefaults = false,
  '--help': showHelp = false,
  '--profile': profileName = PROFILE_NAME_DEFAULT,
} = args;

if (showDefaults) {
  console.log(JSON.stringify(DEFAULT_CONFIG, null, 2));
  process.exit(0);
}

if (showHelp || operation.length === 0) {
  console.log(`
Usage: firebase-sync [operation] [options]

Operations:

  pull    Copy Firestore ==> local filesystem
  push    Copy local filesystem ==> Firestore
  sync    Copy in each direction
            Default: pull then push

Options:

  -c, --config path     Path to config JSON file
                          Default: .firebase-sync.json
  -p, --profile name    Profile name within the config
                          Default: default
      --defaults        Show a default configuration and exit
  `.replace(/^\s+|\s+$/g, '') + '\n');
  process.exit(0);
}

console.log('args: ' + JSON.stringify(args, null, 2));
console.log(JSON.stringify({
  configFileName,
  operation,
  profileName,
}, null, 2));
