export function formatList(platforms: string[]): string {
  const formattedList =
    platforms.length === 1
      ? platforms[0]
      : platforms.length === 2
        ? platforms.join(' and ')
        : `${platforms.slice(0, -1).join(', ')}, and ${platforms[platforms.length - 1]}`;

  return formattedList;
}
