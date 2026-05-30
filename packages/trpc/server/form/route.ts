import { formService } from "../services";
import { authenticationProcedure, router } from "../trpc";
import { generatePath } from "../utils/path-generator";
import { createFormInput, createFormOutput, listFormByUserIdOutput } from "./model";

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
});
