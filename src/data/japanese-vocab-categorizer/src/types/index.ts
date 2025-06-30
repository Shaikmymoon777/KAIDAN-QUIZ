export interface VocabularyEntry {
  word: string;
  meaning: string;
  category: string;
}

export interface Category {
  name: string;
  description?: string;
}

export type VocabularyData = VocabularyEntry[];