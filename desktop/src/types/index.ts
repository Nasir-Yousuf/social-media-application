export interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'student' | 'admin' | 'ai';
  status?: string;
  isAi?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  createdAt?: string;
}

export interface CustomAiSettings {
  customName?: string;
  relationship?: string;
  languagePref?: 'auto' | 'bangla' | 'english' | 'both';
}

export interface Conversation {
  _id: string;
  otherUser?: {
    _id: string;
    name: string;
    originalName?: string;
    username: string;
    avatarUrl?: string;
    role: string;
    status?: string;
    isAi?: boolean;
  };
  customAiSettings?: CustomAiSettings;
  lastMessage?: {
    text?: string;
    content?: string;
    hasCode?: boolean;
    sender?: {
      _id: string;
      name: string;
      username: string;
    } | string;
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
    isAi?: boolean;
    role?: string;
  };
  recipient?: string;
  text?: string;
  content?: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
  reactions?: Array<{
    _id?: string;
    user: string | any;
    emoji: string;
    username?: string;
    createdAt?: string;
  }>;
  replyTo?: {
    messageId?: string;
    text?: string;
    senderName?: string;
    hasCode?: boolean;
  };
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
