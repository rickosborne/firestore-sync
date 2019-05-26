export function notImplemented(self: any, methodName: string): any {
  throw new Error(`Not implemented: ${typeof self === 'string' ? self : self.constructor.name}#${methodName}`);
}
