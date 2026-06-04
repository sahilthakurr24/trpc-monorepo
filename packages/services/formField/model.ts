import { z } from "zod";

export const fieldTypeSchema = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFieldInput = z.object({
  label: z.string().min(1).max(100).describe("Label of the form field"),
  labelKey: z.string().min(1).max(100).describe("Unique label key of the form field"),
  description: z.string().optional().describe("Description of the form field"),
  placeholder: z.string().optional().describe("Placeholder of the form field"),
  isRequired: z.boolean().optional().describe("Whether the form field is required"),
  type: fieldTypeSchema.describe("Type of the form field"),
  formId: z.uuid().describe("ID of the form"),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const updateFieldInput = z.object({
  id: z.uuid().describe("ID of the form field"),
  label: z.string().min(1).max(100).optional().describe("Label of the form field"),
  labelKey: z.string().min(1).max(100).optional().describe("Unique label key of the form field"),
  description: z.string().nullable().optional().describe("Description of the form field"),
  placeholder: z.string().nullable().optional().describe("Placeholder of the form field"),
  isRequired: z.boolean().optional().describe("Whether the form field is required"),
  type: fieldTypeSchema.optional().describe("Type of the form field"),
  formId: z.uuid().optional().describe("ID of the form"),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
  id: z.uuid().describe("ID of the form field"),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const getFieldInput = z.object({
  id: z.uuid().describe("ID of the form field"),
});

export type GetFieldInputType = z.infer<typeof getFieldInput>;

export const listFieldsByFormIdInput = z.object({
  formId: z.uuid().describe("ID of the form"),
});

export type ListFieldsByFormIdInputType = z.infer<typeof listFieldsByFormIdInput>;
