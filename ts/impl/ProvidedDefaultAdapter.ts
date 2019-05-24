export abstract class ProvidedDefaultAdapter<T> {
  protected constructor(
    protected readonly defaultValues: T,
    protected readonly providedValues?: T,
  ) {
  }

  protected get<K extends keyof T>(key: K): NonNullable<T[K]> {
    if (this.providedValues != null) {
      const value = this.providedValues[key];
      if (value != null) {
        return value as NonNullable<T[K]>;
      }
    }
    const defaultValue = this.defaultValues[key];
    if (defaultValue == null) {
      throw new Error('Expected a default');
    }
    return defaultValue as NonNullable<T[K]>;
  }
}
