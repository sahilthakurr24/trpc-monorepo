import { inngest } from "@repo/inngest";
import { formFieldService, formService, formSubmissionService, userService } from "../services";
import { authenticationProcedure, publicProcedure, router } from "../trpc";
import { generatePath } from "../utils/path-generator";
import {
  createFormFieldInput,
  createFormFieldOutput,
  createFormInput,
  createFormOutput,
  deleteFormFieldInput,
  deleteFormFieldOutput,
  formFieldOutput,
  generateFormWithAiInput,
  generateFormWithAiOutput,
  getFormFieldInput,
  getFormSubmissionsByFormIdInput,
  getFormSubmissionsByFormIdOutput,
  getPublicFormByIdInput,
  getPublicFormByIdOutput,
  listFormFieldsByFormIdInput,
  listFormFieldsByFormIdOutput,
  listFormByUserIdOutput,
  submitPublicFormInput,
  submitPublicFormOutput,
  updateFormFieldInput,
  updateFormFieldOutput,
} from "./model";
import z from "zod";
const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  generateFormWithAi: authenticationProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/generateFormWithAi"),
        tags: TAGS,
      },
    })
    .input(generateFormWithAiInput)
    .output(generateFormWithAiOutput)
    .mutation(async ({ input, ctx }) => {
      const user = await userService.getUserInfoById(ctx.user.id);

      const result = await inngest.send({
        name: "form/generate.requested",
        data: {
          prompt: input.prompt,
          userName: user.fullName,
          createdBy: ctx.user.id,
        },
      });

      return { ids: result.ids };
    }),

  getPublicFormById: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getPublicFormById"),
        tags: TAGS,
      },
    })
    .input(getPublicFormByIdInput)
    .output(getPublicFormByIdOutput)
    .query(async ({ input }) => {
      const form = await formService.getPublicFormById(input);
      return form;
    }),

  submitPublicForm: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submitPublicForm"),
        tags: TAGS,
      },
    })
    .input(submitPublicFormInput)
    .output(submitPublicFormOutput)
    .mutation(async ({ input }) => {
      const { id } = await formSubmissionService.submitPublicForm(input);
      return { id };
    }),

  createForm: authenticationProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
      },
    })
    .input(createFormInput)
    .output(createFormOutput)
    .mutation(async ({ input, ctx }) => {
      const { title, description } = input;
      const { id } = await formService.createForm({ title, description, createdBy: ctx.user.id });
      return {
        id,
      };
    }),

  listFormByUserId: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listFormByUserId"),
        tags: TAGS,
      },
    })
    .input(z.undefined())
    .output(listFormByUserIdOutput)
    .query(async ({ ctx }) => {
      const { forms } = await formService.listFormByUserId({ id: ctx.user.id });
      return forms;
    }),

  getFormSubmissionsByFormId: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormSubmissionsByFormId"),
        tags: TAGS,
      },
    })
    .input(getFormSubmissionsByFormIdInput)
    .output(getFormSubmissionsByFormIdOutput)
    .query(async ({ input }) => {
      const { submissions } = await formSubmissionService.getFormSubmissionsByFormId(input);
      return submissions;
    }),

  createField: authenticationProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createField"),
        tags: TAGS,
      },
    })
    .input(createFormFieldInput)
    .output(createFormFieldOutput)
    .mutation(async ({ input }) => {
      const { label, labelKey, description, placeholder, isRequired, type, formId } = input;
      const { id } = await formFieldService.createField({
        label,
        labelKey,
        description,
        placeholder,
        isRequired,
        type,
        formId,
      });

      return { id };
    }),

  getField: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getField"),
        tags: TAGS,
      },
    })
    .input(getFormFieldInput)
    .output(formFieldOutput)
    .query(async ({ input }) => {
      return formFieldService.getField(input);
    }),

  listFieldsByFormId: authenticationProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listFieldsByFormId"),
        tags: TAGS,
      },
    })
    .input(listFormFieldsByFormIdInput)
    .output(listFormFieldsByFormIdOutput)
    .query(async ({ input }) => {
      const { fields } = await formFieldService.listFieldsByFormId(input);
      return fields;
    }),

  updateField: authenticationProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateField"),
        tags: TAGS,
      },
    })
    .input(updateFormFieldInput)
    .output(updateFormFieldOutput)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.updateField(input);
      return { id };
    }),

  deleteField: authenticationProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteField"),
        tags: TAGS,
      },
    })
    .input(deleteFormFieldInput)
    .output(deleteFormFieldOutput)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.deleteField(input);
      return { id };
    }),
});
