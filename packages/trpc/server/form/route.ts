import { formService, formFieldService } from "../services";
import { authenticationProcedure, router } from "../trpc";
import { generatePath } from "../utils/path-generator";
import {
  createFormFieldInput,
  createFormFieldOutput,
  createFormInput,
  createFormOutput,
  deleteFormFieldInput,
  deleteFormFieldOutput,
  formFieldOutput,
  getFormFieldInput,
  listFormFieldsByFormIdInput,
  listFormFieldsByFormIdOutput,
  listFormByUserIdOutput,
  updateFormFieldInput,
  updateFormFieldOutput,
} from "./model";

import z from "zod";
const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
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
