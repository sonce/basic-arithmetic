import { GoogleGenAI, Type } from "@google/genai";
import { MathProblem, Operation, StoryData } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
你是一位擅长寓教于乐的小学数学老师。你的目标是为小朋友编写非常简短、可爱且生动的数学故事题。
使用简单的语言，包含可爱的动物、水果或玩具。
内容必须充满童趣，鼓励性强。
使用中文。
`;

export const generateMathStory = async (problem: MathProblem): Promise<StoryData> => {
  const opSymbol = problem.operation === Operation.ADD ? '+' : '-';
  
  // Explicit instruction for chronological order to match animation
  const sequenceInstruction = problem.operation === Operation.ADD
    ? `必须按时间顺序描述：第一句讲先有 ${problem.num1} 个什么。第二句讲后来又来了(或增加了) ${problem.num2} 个。`
    : `必须按时间顺序描述：第一句讲先有 ${problem.num1} 个什么。第二句讲后来走了(或少了) ${problem.num2} 个。`;

  const prompt = `
    请根据这个数学算式生成一个适合6岁小朋友的简短故事题：
    ${problem.num1} ${opSymbol} ${problem.num2} = ?

    ${sequenceInstruction}

    故事应该非常简短（建议两句话），不要直接说出答案。
    主要包含三个部分：
    1. 故事描述（情境）。
    2. 关键物品的Emoji图标（比如🍎, 🐱, 🚗，只需一个代表性图标）。
    3. 最后的提问。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storyText: {
              type: Type.STRING,
              description: "The chronological story text.",
            },
            emoji: {
              type: Type.STRING,
              description: "A single representative emoji.",
            },
            questionText: {
              type: Type.STRING,
              description: "The question asking for the answer.",
            },
          },
          required: ["storyText", "emoji", "questionText"],
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("Empty response from Gemini");
    }
    return JSON.parse(jsonText) as StoryData;
  } catch (error) {
    console.error("Gemini generation failed", error);
    // Fallback local story if API fails
    return {
      storyText: `草地上原来有 ${problem.num1} 个伙伴，后来${problem.operation === Operation.ADD ? '又来了' : '离开了'} ${problem.num2} 个。`,
      emoji: "😺",
      questionText: "现在一共有多少呢？"
    };
  }
};