import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_COMMENT_LENGTH = 1000;

type TopupLeadPayload = {
  uid?: string;
  telegram?: string;
  packageId?: string;
  packageName?: string;
  amountRub?: number;
  paymentMethod?: string;
  comment?: string;
  leadId?: string;
};

async function forwardJson(endpoint: string, payload: unknown) {
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function POST(request: Request) {
  const topupWebhookUrl = process.env.N8N_TOPUP_WEBHOOK_URL;

  if (!topupWebhookUrl) {
    return NextResponse.json({ error: "Top-up webhook is not configured." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as TopupLeadPayload | null;
  const telegram = body?.telegram?.trim();
  const packageId = body?.packageId?.trim();

  if (!telegram || !packageId) {
    return NextResponse.json({ error: "Telegram and packageId are required." }, { status: 400 });
  }

  const payload = {
    ...body,
    uid: body?.uid || "guest",
    telegram,
    packageId,
    comment: body?.comment?.slice(0, MAX_COMMENT_LENGTH) ?? "",
    source: "portal",
    receivedAt: new Date().toISOString()
  };

  const topupResponse = await forwardJson(topupWebhookUrl, payload);

  if (!topupResponse.ok) {
    return NextResponse.json({ error: "Top-up webhook rejected the request." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
