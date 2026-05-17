import { publicProcedure, router } from "../../trpc";
import { z } from "zod";

export const chaicodeRouter = router({
  getMessage: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .output(
      z.object({
        message: z.string(),
      })
    )
    .query(async ({ input }) => {
      return {
        message: `Hello MR. ${input.email}`,
      };
    }),
});