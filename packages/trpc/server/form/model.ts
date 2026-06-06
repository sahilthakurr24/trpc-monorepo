import z from "zod";

export const createFormInput = z.object({
  title: z.string().describe("Title of the form"),
  description: z.string().describe("Description of the form"),
});

export const createFormOutput = z.object({
  id: z.string().describe("id of the created form"),
});

export const listFormByUserIdOutput = z.array(
  z.object({
    id: z.string().describe("Id of the form"),
    title: z.string().describe("Title of the form"),
    description: z.string().describe("Description of the form").nullable().optional(),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().describe("Last updated timestamp"),
  }),
);

export const fieldTypeSchema = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFormFieldInput = z.object({
  label: z.string().min(1).max(100).describe("Label of the form field"),
  labelKey: z.string().min(1).max(100).describe("Unique label key of the form field"),
  description: z.string().optional().describe("Description of the form field"),
  placeholder: z.string().optional().describe("Placeholder of the form field"),
  isRequired: z.boolean().optional().describe("Whether the form field is required"),
  type: fieldTypeSchema.describe("Type of the form field"),
  formId: z.uuid().describe("ID of the form"),
});

export const createFormFieldOutput = z.object({
  id: z.string().describe("Id of the form field"),
});

export const getFormFieldInput = z.object({
  id: z.uuid().describe("ID of the form field"),
});

export const formFieldOutput = z.object({
  id: z.string().describe("Id of the form field"),
  label: z.string().describe("Label of the form field"),
  labelKey: z.string().describe("Unique label key of the form field"),
  description: z.string().nullable().describe("Description of the form field"),
  placeholder: z.string().nullable().describe("Placeholder of the form field"),
  isRequired: z.boolean().describe("Whether the form field is required"),
  index: z.string().describe("Order index of the form field"),
  type: fieldTypeSchema.describe("Type of the form field"),
  formId: z.string().nullable().describe("ID of the form"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
});

export const updateFormFieldInput = z.object({
  id: z.uuid().describe("ID of the form field"),
  label: z.string().min(1).max(100).optional().describe("Label of the form field"),
  labelKey: z.string().min(1).max(100).optional().describe("Unique label key of the form field"),
  description: z.string().nullable().optional().describe("Description of the form field"),
  placeholder: z.string().nullable().optional().describe("Placeholder of the form field"),
  isRequired: z.boolean().optional().describe("Whether the form field is required"),
  type: fieldTypeSchema.optional().describe("Type of the form field"),
  formId: z.uuid().optional().describe("ID of the form"),
});

export const updateFormFieldOutput = z.object({
  id: z.string().describe("Id of the updated form field"),
});

export const deleteFormFieldInput = z.object({
  id: z.uuid().describe("ID of the form field"),
});

export const deleteFormFieldOutput = z.object({
  id: z.string().describe("Id of the deleted form field"),
});

export const listFormFieldsByFormIdInput = z.object({
  formId: z.uuid().describe("ID of the form"),
});

export const listFormFieldsByFormIdOutput = z.array(formFieldOutput);

export const getPublicFormByIdInput = z.object({
  formId: z.uuid().describe("ID of the form"),
});

export const getPublicFormByIdOutput = z.object({
  id: z.string().describe("Id of the form"),
  title: z.string().describe("Title of the form"),
  description: z.string().nullable().describe("Description of the form"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
  fields: z.array(formFieldOutput).describe("Fields in display order"),
});

export const submitPublicFormInput = z.object({
  formId: z.uuid().describe("ID of the form"),
  values: z
    .array(
      z.object({
        formFieldId: z.uuid().describe("ID of the form field"),
        value: z.string().describe("Submitted value"),
      })
    )
    .describe("Submitted form values"),
});

export const submitPublicFormOutput = z.object({
  id: z.string().describe("Id of the form submission"),
});

export const getFormSubmissionsByFormIdInput = z.object({
  formId: z.uuid().describe("ID of the form"),
});

export const getFormSubmissionsByFormIdOutput = z.array(
  z.object({
    id: z.string().describe("Id of the form submission"),
    formId: z.string().nullable().describe("ID of the form"),
    values: z
      .array(
        z.object({
          formFieldId: z.string().describe("ID of the form field"),
          value: z.string().describe("Submitted value"),
        })
      )
      .nullable()
      .describe("Submitted form values"),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().describe("Last updated timestamp"),
  })
);

export const generateFormWithAiInput = z.object({
  prompt: z.string().trim().min(1).max(1000).describe("Natural language form request"),
});

export const generateFormWithAiOutput = z.object({
  ids: z.array(z.string()).describe("Inngest event IDs"),
});
