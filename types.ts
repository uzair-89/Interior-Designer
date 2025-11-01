
export type Page = 'designer' | 'editor' | 'video' | 'chat';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}
