import { z } from "zod";

export const logoutOutput = z.object({
  success: z.boolean().describe("Whether the logout operation completed"),
});

export type LogoutOutput = z.infer<typeof logoutOutput>;
