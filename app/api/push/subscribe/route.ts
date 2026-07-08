import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { LegacyUserId } from "@/lib/users";

export const runtime = "nodejs";

function isLegacyUserId(value: unknown): value is LegacyUserId {
  return value === "knut" || value === "ingrid";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const userId = body?.userId;
  const subscription = body?.subscription;
  const endpoint = String(subscription?.endpoint ?? "");
  const p256dh = String(subscription?.keys?.p256dh ?? "");
  const auth = String(subscription?.keys?.auth ?? "");
  const userAgent = String(body?.userAgent ?? "").slice(0, 500);

  if (!isLegacyUserId(userId)) {
    return NextResponse.json(
      { ok: false, message: "Ugyldig bruker." },
      { status: 400 }
    );
  }

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { ok: false, message: "Ugyldig push-abonnement." },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("legacy_push_subscriptions")
    .upsert(
      {
        auth,
        endpoint,
        p256dh,
        updated_at: new Date().toISOString(),
        user_agent: userAgent || null,
        user_id: userId,
      },
      { onConflict: "endpoint" }
    );

  if (error) {
    console.error("Kunne ikke lagre push-abonnement:", error);
    return NextResponse.json(
      { ok: false, message: "Kunne ikke lagre push-abonnement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
