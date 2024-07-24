export const parseCssUnits = (size: string): [value: number, units: string] => {
  const reg = new RegExp('(\\d+\\s?)(\\w+)');
  const parts = reg.exec(size);

  if (parts === null) {
    throw new Error(`size wrong`);
  }

  const value = +parts[1];
  const units = parts[2];
  return [value, units];
};

export function splitArray<T>(array: T[], count: number): [T[], T[]] {
  // Use `slice` to get the first `count` elements and the rest of the array
  const firstPart = array.slice(0, count);
  const restPart = array.slice(count);

  return [firstPart, restPart];
}
