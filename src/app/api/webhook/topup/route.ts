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
  screenshotUrl?: string;
  screenshotPublicId?: string;
  screenshotName?: string;
  leadId?: string;
  managerUid?: string;
  threadId?: string;
  status?: string;
  source?: string;
};

async function forwardJson(endpoint: string, payload: unknown) {
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function POST(request: Request) {
  const topupWebhookUrl = process.env.TOPUP_WEBHOOK_URL;

  const body = (await request.json().catch(() => null)) as TopupLeadPayload | null;
  const telegram = body?.telegram?.trim();
  const packageId = body?.packageId?.trim();

  if (!telegram || !packageId) {
    return NextResponse.json({ error: "Telegram and packageId are required." }, { status: 400 });
  }

  const packageName = body?.packageName?.trim() || packageId;
  const paymentMethod = body?.paymentMethod?.trim() || "manager";
  const amountRub = Number(body?.amountRub ?? 0);
  const leadId = body?.leadId?.trim() || `lead_${Date.now()}`;

  const payload = {
    ...body,
    uid: body?.uid || "guest",
    leadId,
    telegram,
    packageId,
    packageName,
    amountRub: Number.isFinite(amountRub) ? amountRub : 0,
    paymentMethod,
    comment: body?.comment?.slice(0, MAX_COMMENT_LENGTH) ?? "",
    screenshotUrl: body?.screenshotUrl?.trim() || "",
    screenshotPublicId: body?.screenshotPublicId?.trim() || "",
    screenshotName: body?.screenshotName?.trim() || "",
    status: body?.status || "new",
    source: body?.source || "portal",
    receivedAt: new Date().toISOString()
  };

  if (!topupWebhookUrl) {
    return NextResponse.json({ ok: true, forwarded: false });
  }

  const topupResponse = await forwardJson(topupWebhookUrl, payload);

  if (!topupResponse.ok) {
    return NextResponse.json({ error: "Top-up webhook rejected the request." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
