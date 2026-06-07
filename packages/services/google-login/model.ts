import z from "zod";

export const findUserByEmailInput = z.object({
  email: z.email().describe("Email of the user"),
});

export type FindUserByEmailTypeInput = z.infer<typeof findUserByEmailInput>;

export const createGoogleUserInput = z.object({
  email: z.email().describe("Email returned by Google"),
  name: z.string().trim().min(1).describe("Display name returned by Google"),
  picture: z.url().optional().nullable().describe("Profile image returned by Google"),
});

export type CreateGoogleUserInput = z.infer<typeof createGoogleUserInput>;

export const generateGoogleUserTokenPayload = z.object({
  id: z.string().describe("Uuid of the user"),
});

export type GenerateGoogleUserTokenPayload = z.infer<typeof generateGoogleUserTokenPayload>;
