import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import { env } from "./env";
import { generateFormWithAi, inngest, serve } from "@repo/inngest";

import { serverRouter, createContext } from "@repo/trpc/server";
import { googleOAuth2Client } from "@repo/services/clients/google-oauth";
import { googleLoginService } from "@repo/trpc/server/services";
import {
  clearCookiedFactory,
  createCookieFactory,
  getCookieFactory,
  setAuthenticationCookie,
} from "@repo/trpc/server/utils/cookie";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Streamyst OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(cookieParser());

if (env.NODE_ENV !== "prod") {
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
      ],
      credentials: true,
    }),
  );
}

app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions: [generateFormWithAi] }));

app.get("/", (req, res) => {
  return res.json({ message: "Streamyst is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Streamyst server is healthy", healthy: true });
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code as string | undefined;

    if (!code) {
      return res.status(400).json({ error: "Google authorization code is missing" });
    }

    const { tokens } = await googleOAuth2Client.getToken(code);
    if (!tokens.id_token) {
      return res.status(401).json({ error: "Google id token is missing" });
    }

    const ticket = await googleOAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(500).json({ error: "Invalid token" });
    }
    const { email, name, picture } = payload;
    if (!email || !name) {
      return res.status(401).json({ error: "Something is missing in field" });
    }

    const user = await googleLoginService.findUserByEmail({ email });
    const authResult =
      user.length > 0
        ? {
            id: user[0]!.id,
            ...(await googleLoginService.createTokenForUser({ id: user[0]!.id })),
          }
        : await googleLoginService.createUser({ email, name, picture });

    const ctx = {
      createCookie: createCookieFactory(res),
      getCookie: getCookieFactory(req),
      clearCookie: clearCookiedFactory(res),
      user: undefined,
    };
    setAuthenticationCookie(ctx, authResult.token);

    const finalizeUrl = new URL("http://localhost:3000/api/auth/google/finalize");
    finalizeUrl.searchParams.set("token", authResult.token);

    return res.redirect(finalizeUrl.toString());
  } catch (error) {
    logger.error("Google OAuth callback failed", { error });
    return res.redirect("http://localhost:3000/signin?error=google_oauth_failed");
  }
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
