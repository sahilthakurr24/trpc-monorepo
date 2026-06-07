import { z } from "zod";

const envSchema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: z.string().describe("Google OAuth client id"),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().describe("Google OAuth client secret"),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().describe("Google OAuth redirect uri"),
  JWT_SECRET: z.string().describe("Secret key for jwt token"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
