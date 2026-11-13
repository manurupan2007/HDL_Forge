import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL is not set — auth and progress sync will fail until it is configured.",
  );
}

export const db = drizzle(
  neon(connectionString ?? "postgres://placeholder:placeholder@localhost/placeholder"),
  { schema },
);
