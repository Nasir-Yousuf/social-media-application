import { UserSummary } from './User';
import { CodeBlock } from './Post';

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  _id: string;
  conversation: string;
  sender: UserSummary | string;
  recipient: UserSummary | string;
  text: string;
  codeSnippet?: CodeBlock;
  replyTo?: string | Message;
  reactions?: MessageReaction[];
  read: boolean;
  readAt?: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Conversation {
  _id: string;
  participants: Array<UserSummary | string>;
  lastMessage?: Message;
  unreadCounts?: Record<string, number>;
  otherUser?: UserSummary;
  createdAt: string | Date;
  updatedAt: string | Date;
}
