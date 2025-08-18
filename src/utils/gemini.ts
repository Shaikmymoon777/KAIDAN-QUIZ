import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from Vite environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Please set it in your .env file as VITE_GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface GeminiQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  part: 'part1' | 'part2' | 'part3';
}

export interface GeminiSpeakingQuestion {
  id: string;
  sentence: string;
  explanation: string;
  part: 'part1' | 'part2' | 'part3' | 'part4';
}

export const generateVocabularyQuestions = async (count: number = 5, level: string = 'N5'): Promise<GeminiQuestion[]> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Generate ${count} Japanese vocabulary questions for JLPT ${level} level. 
    Each question should have:
    - A Japanese word or phrase in kanji/hiragana/katakana
    - 4 multiple choice options in English
    - The correct answer index (0-3)
    - A brief explanation in English
    - A part number (part1, part2, or part3)
    
    Format as a JSON array of objects with these fields:
    [{
      "id": "unique-id",
      "question": "Japanese word/phrase",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": 0,
      "explanation": "Explanation of the answer",
      "part": "part1"
    }]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating vocabulary questions:', error);
    throw error;
  }
};

export const generateSpeakingQuestions = async (count: number = 5, level: string = 'N5'): Promise<GeminiSpeakingQuestion[]> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Generate ${count} Japanese speaking practice sentences for JLPT ${level} level. 
    Each item should have:
    - A Japanese sentence in kanji with furigana (using [kanji|furigana] format)
    - A brief explanation in English about the sentence
    - A part number (part1, part2, part3, or part4)
    
    Format as a JSON array of objects with these fields:
    [{
      "id": "unique-id",
      "sentence": "Japanese sentence",
      "explanation": "Explanation of the sentence",
      "part": "part1"
    }]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating speaking questions:', error);
    throw error;
  }
};

export const evaluateSpokenResponse = async (question: string, userResponse: string): Promise<{
  score: number;
  feedback: string;
  correctAnswer?: string;
}> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Evaluate this Japanese speaking response. The question was: "${question}"
    Student's response: "${userResponse}"
    
    Provide a score from 0-100 based on:
    - Pronunciation (30%)
    - Grammar accuracy (30%)
    - Vocabulary usage (20%)
    - Natural flow (20%)
    
    Also provide specific feedback and, if applicable, the correct answer.
    
    Format your response as JSON:
    {
      "score": 85,
      "feedback": "Your pronunciation was good, but watch your particle usage...",
      "correctAnswer": "The most natural way to say this would be..."
    }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error evaluating spoken response:', error);
    throw error;
  }
};
