import { vercel } from "@t3-oss/env-core/presets-zod";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [vercel()],
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    // Deepgram
    DEEPGRAM_API_KEY: z.string().min(1),
    // CORS
    CORS_ORIGIN: z.preprocess((val) => {
      if (typeof val === "string") {
        const s = val.trim();
        if (s === "") return undefined;
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // ignore JSON parse errors
        }
        return s
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
      return val;
    }, z.array(z.url()).optional()),
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