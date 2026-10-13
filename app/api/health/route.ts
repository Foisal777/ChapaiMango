import { NextResponse } from "next/server";

/**
 * Lightweight health check endpoint used by Railway (and any other
 * platform's healthchecks). Always returns 200 OK with a small JSON body.
 *
 * Do NOT add database calls here — Railway pings this every few seconds
 * during boot and during runtime; it should stay cheap and never fail
 * because of a downstream service.
 */
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "chapai-mango",
    time: new Date().toISOString()
  });
}
