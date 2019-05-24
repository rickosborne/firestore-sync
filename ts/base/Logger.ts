export type Logger = (component: string, action: string, message: string) => void;

export interface WithLogger {
  readonly logger: Logger;
}
