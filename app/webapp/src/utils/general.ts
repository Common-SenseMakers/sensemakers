export function toTimestamp(date: string): number {
  return Math.round(new Date(date).getTime() / 1000);
}

export function valueToString(number: number, decimals = 3) {
  return number.toPrecision(Math.floor(number).toString().length + decimals);
}

export const toBase64 = async (file: File): Promise<string | undefined> => {
  const result_base64 = await new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });
  return result_base64?.toString();
};

export const cap = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function arraysEqual<T = unknown>(
  a: T[],
  b: T[],
  compareFn?: (a: T, b: T) => number
): boolean {
  if (a.length !== b.length) return false;

  const sortedA = [...a].sort(compareFn);
  const sortedB = [...b].sort(compareFn);

  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) {
      return false;
    }
  }
  return true;
}
