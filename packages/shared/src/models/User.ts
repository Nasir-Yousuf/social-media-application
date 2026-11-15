export type UserRole = 'student' | 'mentor' | 'admin' | 'ai' | 'guest';

export interface UserBadge {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  awardedAt?: string | Date;
}

export interface UserSummary {
  _id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  isAi?: boolean;
}

export interface UserProfile extends UserSummary {
  email?: string;
  bio?: string;
  status?: string;
  studentId?: string;
  githubUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  badges?: string[];
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  createdAt: string | Date;
}

export interface User extends UserSummary {
  email: string;
  bio?: string;
  status?: string;
  studentId?: string;
  badges?: string[];
  isApproved?: boolean;
  hasCustomAvatar?: boolean;
  avatarMimeType?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
