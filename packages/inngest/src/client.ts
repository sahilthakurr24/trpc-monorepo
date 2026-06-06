import { openaiResponses, Inngest } from "inngest";

function getOpenAiApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to use AI Inngest functions");
  }
  return apiKey;
}

export const inngest = new Inngest({
  id: "inngest-ai",
});

export const gpt4omini = openaiResponses({
  model: "gpt-4o-mini",
  apiKey: getOpenAiApiKey(),
});
