import { vercel } from "@t3-oss/env-core/presets-zod";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const environment =
  process.env.NODE_ENV === "production" ? "production" : "development";

const normaliseStringArray = (input: unknown[]): string[] =>
  input
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);

const parseStringList = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return normaliseStringArray(value);
  }

  if (typeof value !== "string") {
    return;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return normaliseStringArray(parsed);
    }
  } catch {
    // ignore JSON parse errors
  }

  return normaliseStringArray(trimmed.split(","));
};

export const env = createEnv({
  extends: [vercel()],
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    // Deepgram
    DEEPGRAM_API_KEY: z.string().min(1),
    DEEPGRAM_ENV: z.enum(["development", "production"]).default(environment),
    // CORS
    CORS_ORIGIN: z.preprocess(parseStringList, z.array(z.url()).optional()),
    ALLOWED_METHODS: z.preprocess(
      parseStringList,
      z.array(z.string()).optional()
    ),
    ALLOWED_ORIGIN: z.preprocess(
      parseStringList,
      z.array(z.string()).optional()
    ),
    ALLOWED_HEADERS: z.preprocess(
      parseStringList,
      z.array(z.string()).optional()
    ),
    EXPOSED_HEADERS: z.preprocess(
      parseStringList,
      z.array(z.string()).optional()
    ),
    PREFLIGHT_MAX_AGE: z.string().optional(),
    CREDENTIALS: z.enum(["true", "false"]).optional(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined),
  },
});
