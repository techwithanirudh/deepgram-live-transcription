import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

const corsOptions: {
  allowedMethods: string[];
  allowedOrigins: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge?: number;
  credentials: boolean;
} = {
  allowedMethods: env.ALLOWED_METHODS ?? [],
  allowedOrigins: env.ALLOWED_ORIGIN ?? [],
  allowedHeaders: env.ALLOWED_HEADERS ?? [],
  exposedHeaders: env.EXPOSED_HEADERS ?? [],
  maxAge: env.PREFLIGHT_MAX_AGE
    ? Number.parseInt(env.PREFLIGHT_MAX_AGE, 10)
    : undefined, // 60 * 60 * 24 * 30, // 30 days
  credentials: env.CREDENTIALS === "true",
};

/**
 * Middleware function that handles CORS configuration for API routes.
 *
 * This middleware function is responsible for setting the appropriate CORS headers
 * on the response, based on the configured CORS options. It checks the origin of
 * the request and sets the `Access-Control-Allow-Origin` header accordingly. It
 * also sets the other CORS-related headers, such as `Access-Control-Allow-Credentials`,
 * `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, and
 * `Access-Control-Expose-Headers`.
 *
 * The middleware function is configured to be applied to all API routes, as defined
 * by the `config` object at the end of the file.
 */
export function proxy(request: NextRequest) {
  // Response
  const response = NextResponse.next();

  // Allowed origins check
  const origin = request.headers.get("origin") ?? "";
  if (
    corsOptions.allowedOrigins.includes("*") ||
    corsOptions.allowedOrigins.includes(origin)
  ) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  // Set default CORS headers
  response.headers.set(
    "Access-Control-Allow-Credentials",
    corsOptions.credentials.toString()
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    corsOptions.allowedMethods.join(",")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    corsOptions.allowedHeaders.join(",")
  );
  response.headers.set(
    "Access-Control-Expose-Headers",
    corsOptions.exposedHeaders.join(",")
  );
  response.headers.set(
    "Access-Control-Max-Age",
    corsOptions.maxAge?.toString() ?? ""
  );

  // Return
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/authenticate",
};
