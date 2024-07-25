import { PLATFORM } from './shared/types/types.user';
export declare const RouteNames: {
    AppHome: string;
    Post: string;
    Profile: string;
    Settings: string;
    Posting: string;
    Test: string;
};
export declare const AbsoluteRoutes: {
    App: string;
    Post: (postId: string) => string;
    Profile: (platformId: PLATFORM, username: string) => string;
    Settings: string;
};
