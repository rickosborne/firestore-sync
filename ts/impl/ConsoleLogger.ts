import {Logger} from "../base/Logger";
import {notImplemented} from "./NotImplemented";

export enum StandardOutputStream {
  STDOUT = 'STDOUT',
  STDERR = 'STDERR',
}

export class ConsoleLogger {
  public static forStream(stream: StandardOutputStream): Logger {
    switch (stream) {
      case StandardOutputStream.STDOUT:
        return console.log;
      case StandardOutputStream.STDERR:
        return console.error;
      default:
        return notImplemented('ConsoleLogger', `forStream(${stream})`);
    }
  }

  public static toOutputStream(name: string | null): StandardOutputStream | null {
    const normalized = (name || '').toUpperCase();
    if (normalized === '') {
      return StandardOutputStream.STDOUT;
    }
    switch (normalized) {
      case StandardOutputStream.STDOUT:
        return StandardOutputStream.STDOUT;
      case StandardOutputStream.STDERR:
        return StandardOutputStream.STDERR;
      default:
        return null;
    }
  }
}
