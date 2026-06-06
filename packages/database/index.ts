import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";

export const db = drizzle(env.DATABASE_URL);
export { asc, desc, eq, sql } from "drizzle-orm";
export * from "drizzle-orm";
export default db;

