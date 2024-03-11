export interface PlatformService {
  fetch: () => Promise<string[]>;
}
