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
