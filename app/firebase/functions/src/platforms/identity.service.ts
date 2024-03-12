export interface OAuthIdentityService {
  getAuthLink: () => Promise<string>;
  handleCode: (code: string) => Promise<string>;
}
