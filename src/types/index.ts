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

export interface CropTransform {
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

export interface StoredAvatarPreview {
  dataUrl: string;
  originalRawUrl?: string;
  updatedAt: number;
  enabled: boolean;
  userHandle?: string;
  userAvatarSignature?: string;
  originalAvatarUrl?: string;
  transform?: CropTransform;
}
