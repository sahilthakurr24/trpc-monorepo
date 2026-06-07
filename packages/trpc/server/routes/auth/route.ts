import { z, zodUndefinedModel } from "../../schema";
import { TRPCError } from "@trpc/server";
import { logoutService, userService } from "../../services";
import { authenticationProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { url } from "@repo/services/clients/google-oauth";
import {
  createUserWithEmailAndPasswordInput,
  createUserWithEmailAndPasswordOutput,
  signinUserWithEmailAndPasswordOutput,
  signinUserWithEmailAndPasswordInput,
  getLoggedInUserInfoInput,
  getLoggedInUserInfoOutput,
  logoutInput,
  logoutOutput,
} from "./model";
import {
  clearAuthenticationCookie,
  getAuthenticationCookie,
  setAuthenticationCookie,
} from "../../utils/cookie";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");
const SIGNIN_FAILURE_MESSAGES = new Set(["Invalid email or password", "Invalid login method"]);

export const authRouter = router({
  googleLogin: publicProcedure.query(() => {
    return {
      url,
    };
  }),
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInput)
    .output(createUserWithEmailAndPasswordOutput)
    .mutation(async ({ input, ctx }) => {
      const { full_name, email, password } = input;
      try {
        const { id, token } = await userService.createUserWithEmailAndPassword({
          full_name,
          email,
          password,
        });
        setAuthenticationCookie(ctx, token);

        return { id };
      } catch (error) {
        if (error instanceof Error && error.message === "User with email already exists") {
          throw new TRPCError({
            code: "CONFLICT",
            message: error.message,
          });
        }

        throw error;
      }
    }),
  signinUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signinUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(signinUserWithEmailAndPasswordInput)
    .output(signinUserWithEmailAndPasswordOutput)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      try {
        const { id, token } = await userService.signinUserWithEmailAndPassword({ email, password });
        setAuthenticationCookie(ctx, token);

        return {
          id,
          token,
        };
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.startsWith("User with email ") ||
            SIGNIN_FAILURE_MESSAGES.has(error.message))
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        throw error;
      }
    }),
  getLoggedInUserInfo: authenticationProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/getLoggedInUserInfo"),
        tags: TAGS,
      },
    })
    .input(getLoggedInUserInfoInput)
    .output(getLoggedInUserInfoOutput)
    .query(async ({ ctx }) => {
      const token = getAuthenticationCookie(ctx);
      if (!token) throw new Error("User is not logged in");

      const { id, email, fullName, profileImageUrl } = await userService.getUserInfoById(
        ctx.user.id,
      );
      return {
        id,
        email,
        fullName,
        profileImageUrl,
      };
    }),
  logout: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/logout"),
        tags: TAGS,
      },
    })
    .input(logoutInput)
    .output(logoutOutput)
    .mutation(async ({ ctx }) => {
      const result = await logoutService.logout();
      clearAuthenticationCookie(ctx);
      return result;
    }),
});
