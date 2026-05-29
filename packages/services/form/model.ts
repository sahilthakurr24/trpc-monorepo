import z from "zod";

export const createFormInput = z.object({
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form"),
  createdBy: z.string().describe("form created by"),
});

export type createFormInputType = z.infer<typeof createFormInput>;
