import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

config({ path: path.resolve(__dirname, "../../../.env"), quiet: true });

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "prod"]).default("development"),
  BASE_URL: z.string().default("http://localhost:8000"),
  OPENAI_API_KEY: z.string().describe("api keys for the model"),
  GOOGLE_OAUTH_CLIENT_ID: z.string().describe("google oauth client id"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
