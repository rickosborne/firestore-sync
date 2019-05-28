import {WithLogger} from "../base/Logger";

export type PromiseReject = (reason?: any) => void;
export type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;

export class FailContext {
  constructor(
    public readonly action: string,
    public readonly withLogger: WithLogger,
    public readonly reject?: PromiseReject,
  ) {
  }

  public err(err: NodeJS.ErrnoException | null, messageBuilder: (err: NodeJS.ErrnoException) => string): this {
    if (err != null && this.reject != null) {
      this.reject(err);
    }
    Fail.when(err, this.action, this.withLogger, messageBuilder);
    return this;
  }

  public orResolve<T>(value: T, resolve: (value?: T | PromiseLike<T>) => void): void {
    resolve(value);
  }

  public toCallbackHandler<T>(resolve?: PromiseResolve<T>): (err: NodeJS.ErrnoException | null, value?: T) => T | undefined {
    return (err, result) => {
      if (err != null) {
        if (this.reject != null) {
          this.reject(err);
          return result;
        } else {
          throw err;
        }
      }
      if (resolve != null) {
        resolve(result);
      }
      return result;
    };
  }
}

// tslint:disable-next-line
export class Fail {
  public static catchAndReturn<T>(value: T, action: string, withLogger: WithLogger): (reason: any) => T {
    return (reason) => {
      const message = this.stringFromReason(reason);
      withLogger.logger(withLogger.constructor.name, action, message);
      return value;
    };
  }

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

  public static stringFromError(error: Error): string {
    return `${error.name} ${error.message}\n${error.stack}`;
  }

  public static stringFromReason(reason: any): string {
    if (reason == null) {
      return '<null>';
    } else if (reason instanceof Error) {
      return this.stringFromError(reason);
    } else if (typeof reason === 'string') {
      return reason;
    } else if (typeof reason.message === 'string') {
      return reason.message;
    }
    return JSON.stringify(reason);
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

  public static withContext(action: string, withLogger: WithLogger, reject?: PromiseReject): FailContext {
    return new FailContext(action, withLogger, reject);
  }
}
