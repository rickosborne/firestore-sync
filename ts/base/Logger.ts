export type Logger = (component: string, action: string, message: string) => void;

export type ComponentLogger = (action: string, message: string) => void;

export type RipCord = (
  errOrCondition: NodeJS.ErrnoException | null | boolean,
  action: string,
  messageBuilder: (err: NodeJS.ErrnoException) => string,
) => void;

export function ripCord(logger: ComponentLogger): RipCord {
  return (errOrCondition: NodeJS.ErrnoException | null | boolean,
          action: string, messageBuilder: (err: NodeJS.ErrnoException) => string) => {
    const isBoolean = typeof errOrCondition === 'boolean';
    if ((isBoolean && errOrCondition) || errOrCondition == null) {
      return;
    }
    let message: string;
    if (isBoolean) {
      message = messageBuilder(undefined as any);
    } else {
      const err = errOrCondition as NodeJS.ErrnoException;
      message = messageBuilder(err) + `: ${err.code} ${err.name} ${err.message}`;
    }
    logger(action, message);
    throw new Error(message);
  };
}
