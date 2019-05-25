export interface Identified {
  id: string;
}

export function sortById(a: Identified, b: Identified): number {
  return a.id.localeCompare(b.id);
}

export function identify(...items: Array<Identified | undefined>): string {
  for (const item of items) {
    if (item != null) {
      return item.id;
    }
  }
  throw new Error('Expected at least one defined item');
}
