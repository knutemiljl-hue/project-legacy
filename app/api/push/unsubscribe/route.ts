import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const endpoint = String(body?.endpoint ?? "");

  if (!endpoint) {
    return NextResponse.json(
      { ok: false, message: "Mangler endpoint." },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("legacy_push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    console.error("Kunne ikke slette push-abonnement:", error);
    return NextResponse.json(
      { ok: false, message: "Kunne ikke slette push-abonnement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
