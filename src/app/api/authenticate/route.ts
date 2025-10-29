import { createClient, DeepgramError } from "@deepgram/sdk";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  // exit early so we don't request 70000000 keys while in devmode
  // if (env.NODE_ENV === "development") {
  //   return NextResponse.json({
  //     access_token: env.DEEPGRAM_API_KEY
  //   });
  // }

  // gotta use the request object to invalidate the cache every request :vomit:
  const url = request.url;
  const deepgram = createClient(env.DEEPGRAM_API_KEY);

  const { result: tokenResult, error: tokenError } =
    await deepgram.auth.grantToken();

  if (tokenError) {
    return NextResponse.json(tokenError);
  }

  if (!tokenResult) {
    return NextResponse.json(
      new DeepgramError(
        "Failed to generate temporary token. Make sure your API key is of scope Member or higher."
      )
    );
  }

  const response = NextResponse.json({ ...tokenResult, url });
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set(
    "Cache-Control",
    "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Expires", "0");

  return response;
}
