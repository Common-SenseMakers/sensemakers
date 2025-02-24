export function chunkNumber(total: number, chunkSize: number): number[] {
  const chunks: number[] = [];
  while (total > chunkSize) {
    chunks.push(chunkSize);
    total -= chunkSize;
  }
  if (total > 0) {
    chunks.push(total);
  }
  return chunks;
}

export const splitIntoBatches = <T>(array: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};
