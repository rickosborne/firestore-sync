export abstract class ProvidedDefaultAdapter<T> {
  private readonly itemValues: T[];

  protected constructor(...itemValues: Array<T | undefined>) {
    this.itemValues = itemValues.filter((iv) => iv != null) as T[];
  }

  protected get<K extends keyof T>(key: K): NonNullable<T[K]> {
    for (const itemValue of this.itemValues) {
      const value = itemValue[key];
      if (value != null) {
        return value as NonNullable<T[K]>;
      }
    }
    throw new Error(`Expected a default for ${key}`);
  }
}
