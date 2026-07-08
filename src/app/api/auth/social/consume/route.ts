import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearResultCookie, consumeResultCookie } from "@/lib/auth/server-social-auth";

export async function GET(request: NextRequest) {
  const payload = consumeResultCookie(request);

  if (!payload) {
    return NextResponse.json({ error: "Social auth session expired." }, { status: 401 });
  }

  const response = NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store"
    }
  });

  clearResultCookie(response);

  return response;
}
