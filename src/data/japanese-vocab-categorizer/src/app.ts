import { getCategories } from './categories';
import { vocabulary } from './data/vocabulary';
import { categorizeVocabulary } from './utils/categorize';
import { VocabularyEntry } from './types';

const main = () => {
  const categories = getCategories();
  const categorizedVocabulary = categorizeVocabulary(vocabulary);

  console.log('Vocabulary Categories:', categories);
  console.log('Categorized Vocabulary:', categorizedVocabulary);
};

main();