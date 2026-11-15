import { UserSummary } from './User';

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  title?: string;
}

export interface PollOption {
  _id?: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  votedUserIds?: string[];
  userVotedIndex?: number;
  expiresAt?: string | Date;
}

export interface PostReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface Post {
  _id: string;
  author: UserSummary | string;
  content: string;
  codeSnippet?: CodeBlock;
  poll?: Poll;
  reactions?: PostReaction[];
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
  pinned?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}
