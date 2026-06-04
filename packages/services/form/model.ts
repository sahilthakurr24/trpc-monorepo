import z from "zod";

export const createFormInput = z.object({
  title: z.string().describe("title of the form"),
  description: z.string().describe("description of the form"),
  createdBy: z.string().describe("form created by"),
});

export type createFormInputType = z.infer<typeof createFormInput>;

export const listFormByUserId = z.object({
  id: z.string().describe("ID of the user"),
});

export type ListFormByUserIdType = z.infer<typeof listFormByUserId>;

export const getPublicFormByIdInput = z.object({
  formId: z.uuid().describe("ID of the form"),
});

export type GetPublicFormByIdInputType = z.infer<typeof getPublicFormByIdInput>;
