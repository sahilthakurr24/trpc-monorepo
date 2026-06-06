import { openaiResponses, Inngest } from "inngest";
import { env } from "../env";

export const inngest = new Inngest({
  id: "inngest-ai",
});

export const gpt4omini = openaiResponses({
  model: "gpt-4o-mini",
  apiKey: env.OPENAI_API_KEY,
});
