import { UserSummary } from './User';
import { CodeBlock } from './Post';

export interface CommentAuthor {
  _id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  isAi?: boolean;
}

export interface Comment {
  _id: string;
  post: string;
  author: CommentAuthor | UserSummary | string;
  content: string;
  codeSnippet?: CodeBlock;
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}
