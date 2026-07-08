import { NextResponse } from "next/server";
import { sendPushToUsers } from "@/lib/push";
import { LegacyUserId } from "@/lib/users";

export const runtime = "nodejs";

function isLegacyUserId(value: unknown): value is LegacyUserId {
  return value === "knut" || value === "ingrid";
}

function readUserIds(value: unknown): LegacyUserId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isLegacyUserId);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const userIds = readUserIds(body?.userIds);
  const title = String(body?.title ?? "").trim();
  const notificationBody = String(body?.body ?? "").trim();
  const url = String(body?.url ?? "/");
  const tag = String(body?.tag ?? "project-legacy");

  if (userIds.length === 0 || !title || !notificationBody) {
    return NextResponse.json(
      { ok: false, message: "Mangler varseldata." },
      { status: 400 }
    );
  }

  const result = await sendPushToUsers({
    body: notificationBody,
    tag,
    title,
    url,
    userIds,
  });

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    skipped: result.skipped,
  });
}
