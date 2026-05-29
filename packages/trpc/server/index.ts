import { publicProcedure, router } from "./trpc";
import { email, z } from "zod";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formRouter } from "./form/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  form: formRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
