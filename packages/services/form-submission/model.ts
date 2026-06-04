import { z } from "zod";

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

export type SubmitPublicFormInputType = z.infer<typeof submitPublicFormInput>;
