export enum Difficulty {
  EASY = 'EASY',     // Sums/Diffs within 10
  MEDIUM = 'MEDIUM', // Sums/Diffs within 20
  HARD = 'HARD'      // Sums/Diffs within 100
}

export enum GameMode {
  PRACTICE = 'PRACTICE', // Standard flashcards
  STORY = 'STORY'        // AI Generated stories
}

export enum Operation {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT'
}

export interface MathProblem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  id: string;
}

export interface StoryData {
  storyText: string;
  emoji: string;
  questionText: string;
}
