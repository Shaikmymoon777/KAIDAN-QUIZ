export interface Category {
  name: string;
  description?: string;
}

export const getCategories = (): Category[] => {
  return [
    { name: 'Greetings', description: 'Common phrases used for greetings.' },
    { name: 'Numbers', description: 'Vocabulary related to numbers.' },
    { name: 'Colors', description: 'Words describing colors.' },
    { name: 'Food', description: 'Vocabulary related to food items.' },
    { name: 'Animals', description: 'Names of various animals.' },
    { name: 'Places', description: 'Vocabulary related to locations and places.' },
    { name: 'Verbs', description: 'Common verbs used in daily conversation.' },
    { name: 'Adjectives', description: 'Descriptive words to modify nouns.' },
    { name: 'Adverbs', description: 'Words that modify verbs, adjectives, or other adverbs.' },
    { name: 'Expressions', description: 'Common expressions and idioms.' },
  ];
};