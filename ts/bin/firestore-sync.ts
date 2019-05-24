#!/usr/bin/env node

import * as console from 'console';
import * as process from 'process';
import {FirestoreSyncCommandLine} from "../impl/FirestoreSyncCommandLine";

new FirestoreSyncCommandLine(process.argv, console.log).run();
