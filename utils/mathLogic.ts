import { Difficulty, MathProblem, Operation } from "../types";

export const generateProblem = (difficulty: Difficulty): MathProblem => {
  const operation = Math.random() > 0.5 ? Operation.ADD : Operation.SUBTRACT;
  let num1, num2, answer;

  switch (difficulty) {
    case Difficulty.EASY: // Result within 10
      if (operation === Operation.ADD) {
        answer = Math.floor(Math.random() * 10) + 1; // 1 to 10
        num1 = Math.floor(Math.random() * (answer + 1)); // 0 to answer
        num2 = answer - num1;
      } else {
        num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
        num2 = Math.floor(Math.random() * (num1 + 1)); // 0 to num1
        answer = num1 - num2;
      }
      break;

    case Difficulty.MEDIUM: // Result within 20
      if (operation === Operation.ADD) {
        answer = Math.floor(Math.random() * 11) + 10; // 10 to 20 (focus on teens)
        num1 = Math.floor(Math.random() * (answer + 1));
        num2 = answer - num1;
      } else {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * (num1 + 1));
        answer = num1 - num2;
      }
      break;

    case Difficulty.HARD: // Result within 100
      if (operation === Operation.ADD) {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
      }
      break;
      
    default: // Fallback Easy
      num1 = 1; num2 = 1; answer = 2;
  }

  return {
    num1,
    num2,
    operation,
    answer,
    id: Math.random().toString(36).substr(2, 9)
  };
};
