import z, { ZodBase64 } from "zod";

export const createFormInput = z.object({
  title: z.string().describe("Title of the form"),
  description: z.string().describe("Description of the form"),
});

export const createFormOutput = z.object({
  id: z.string().describe("id of the created form"),
});

export const listFormByUserIdInput = z.object({
  id: z.string().describe("Id of the user"),
});
export const listFormByUserIdOutput = z.array(
  z.object({
    id: z.string().describe("Id of the form"),
    title: z.string().describe("Title of the form"),
    description: z.string().describe("Description of the form").nullable(),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().describe("Last updated timestamp"),
  }),
);
