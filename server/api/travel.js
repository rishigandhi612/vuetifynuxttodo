import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyB9xCBtNI_OF9Y9pp51oTpeAIvibZkVmA0";
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event); // Get todos from the request
    if (!body || !body.todos) throw new Error("No todos provided");

    const todos = body.todos;

    const prompt = `Analyze this list of todos: ${JSON.stringify(todos)}. 
      Sort them where status is false and provide a suggested order to complete them.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction:
        "You're a todo sorter. You analyze pending todos and suggest the best order to complete them.",
      generationConfig,
    });

    const res = await model.generateContent(prompt);
    return res.response?.text();
  } catch (error) {
    return { error: error.message || "Failed to process todos" };
  }
});
