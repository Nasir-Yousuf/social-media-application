export interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'student' | 'admin';
  status?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  otherUser?: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role: string;
    status?: string;
  };
  lastMessage?: {
    content?: string;
    sender?: {
      _id: string;
      name: string;
      username: string;
    };
    createdAt?: string;
  };
  unreadCount?: number;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  recipient?: string;
  content: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
  reactions?: Array<{
    user: string;
    emoji: string;
    username?: string;
  }>;
  isRead?: boolean;
  createdAt: string;
  tempId?: string;
  status?: 'sending' | 'sent' | 'failed';
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  isAnnouncement?: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  codeSnippet?: {
    code: string;
    language: string;
  };
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  sender?: User;
  type: 'like' | 'comment' | 'follow' | 'announcement' | 'message';
  post?: string;
  comment?: string;
  conversation?: string;
  read: boolean;
  createdAt: string;
}

export interface DesktopInfo {
  appName: string;
  version: string;
  platform: string;
  arch: string;
  meshTransportStatus: string;
}
