import { UserSummary } from './User';

export interface CodeFile {
  name: string;
  language: string;
  content: string;
  path?: string;
  sizeBytes?: number;
}

export interface CodeHubPost {
  _id: string;
  title: string;
  description: string;
  author: UserSummary | string;
  files: CodeFile[];
  primaryLanguage: string;
  tags?: string[];
  starsCount?: number;
  forksCount?: number;
  isStarred?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}
