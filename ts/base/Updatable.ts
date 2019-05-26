export interface Updatable<T> {
  updateFrom(item: T): Promise<void>;
}
