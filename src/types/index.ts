export type PreviewTab = 'profile' | 'post' | 'reply' | 'search' | 'notification';

export type ThemeMode = 'dark' | 'dim' | 'light';

export interface UserProfile {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  location: string;
  website: string;
  joinedDate: string;
  followingCount: string;
  followersCount: string;
  isVerified: boolean;
  bannerUrl: string | null;
}

export interface PreviewImageState {
  url: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}
