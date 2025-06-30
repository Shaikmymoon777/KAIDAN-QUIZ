import { VocabularyEntry } from '../types';

export function categorizeVocabulary(vocabulary: VocabularyEntry[]) {
  const categorized: { [key: string]: VocabularyEntry[] } = {};

  vocabulary.forEach(entry => {
    const { category } = entry;
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(entry);
  });

  return categorized;
}