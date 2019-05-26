export interface Pathed {
  readonly path: string;
}

export function pathify(...items: Array<Pathed | undefined>): string {
  for (const item of items) {
    if (item != null) {
      return item.path;
    }
  }
  throw new Error('Expected at least one defined Pathed');
}
