export type AIMessageRole = 'user' | 'model' | 'system';

export interface AIMessagePart {
  text: string;
}

export interface AIMessage {
  role: AIMessageRole;
  parts: AIMessagePart[] | string;
  timestamp?: string | Date;
}

export interface AIConversation {
  _id: string;
  userId: string;
  topic?: string;
  messages: AIMessage[];
  mentorPersona?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
