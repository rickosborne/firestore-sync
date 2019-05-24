import {WithLogger} from "../base/Logger";

export class Fail {
  public static if(
    condition: boolean,
    action: string,
    withLogger: WithLogger,
    messageBuilder: () => string,
  ): void {
    if (condition) {
      const message = messageBuilder();
      withLogger.logger(withLogger.constructor.name, action, message);
      throw new Error(message);
    }
  }

  public static unless(
    condition: boolean,
    action: string,
    withLogger: WithLogger,
    messageBuilder: () => string,
  ): void {
    this.if(!condition, action, withLogger, messageBuilder);
  }

  public static when(
    err: NodeJS.ErrnoException | null,
    action: string,
    withLogger: WithLogger,
    messageBuilder: (err: NodeJS.ErrnoException) => string,
  ): void {
    if (err != null) {
      const message = messageBuilder(err) + `: ${err.code} ${err.name} ${err.message}`;
      withLogger.logger(withLogger.constructor.name, action, message);
      throw new Error(message);
    }
  }
}
