import { NextResponse } from "next/server";
import { getPushConfigStatus, sendPushToUsers } from "@/lib/push";
import { LegacyUserId } from "@/lib/users";

export const runtime = "nodejs";

function isLegacyUserId(value: unknown): value is LegacyUserId {
  return value === "knut" || value === "ingrid";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const userId = body?.userId;
  const configStatus = getPushConfigStatus();

  if (!isLegacyUserId(userId)) {
    return NextResponse.json(
      { ok: false, message: "Ugyldig bruker." },
      { status: 400 }
    );
  }

  if (!configStatus.hasPublicKey || !configStatus.hasPrivateKey) {
    return NextResponse.json(
      { ok: false, message: "Mangler VAPID-konfigurasjon." },
      { status: 500 }
    );
  }

  const result = await sendPushToUsers({
    body: "Dette er et testvarsel fra Project Legacy.",
    tag: "project-legacy-test",
    title: "Varsler fungerer",
    url: "/settings",
    userIds: [userId],
  });

  return NextResponse.json({
    ok: true,
    sent: result.sent,
  });
}
