import { formService } from "../services";
import { authenticationProcedure, publicProcedure, router } from "../trpc";
import { generatePath } from "../utils/path-generator";
import { createFormInput, createFormOutput } from "./model";

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
});
