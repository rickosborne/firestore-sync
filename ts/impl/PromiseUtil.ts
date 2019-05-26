export function firstToResolveLike<T>(
  promises: Array<Promise<T>>,
  predicate: (resolved: T) => boolean,
): Promise<T | undefined> {
  if (promises.length === 0) {
    return Promise.resolve(undefined);
  }
  return promises.reduceRight((prev, curr) => {
    return curr.then((cv) => {
      if (predicate(cv)) {
        return cv;
      }
      return prev;
    });
  }, Promise.resolve(undefined) as Promise<T | undefined>);
}
