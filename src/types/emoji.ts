export interface EmojiData {
  emoji: string;
  users: number[];
}

export interface EmojiTableData {
  records: EmojiData[];
}

export interface AddEmojiData {
  userId: number;
  emoji: string;
}

export interface RemoveEmojiData {
  userId: number;
  emoji: string;
}
