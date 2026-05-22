import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createCookieFactory, getCookieFactory, clearCookiedFactory } from "./utils/cookie";

export interface TRPCCONTEXT {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof getCookieFactory>;
}
export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCCONTEXT> {
  const ctx: TRPCCONTEXT = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookiedFactory(res),
  };
  return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
