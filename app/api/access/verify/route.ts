import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const accessCode = process.env.LEGACY_ACCESS_CODE;

  if (!accessCode) {
    return NextResponse.json(
      {
        ok: false,
        message: "Mangler LEGACY_ACCESS_CODE på serveren.",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const submittedCode = String(body?.code ?? "").trim();

  if (!submittedCode) {
    return NextResponse.json(
      {
        ok: false,
        message: "Skriv inn kode.",
      },
      { status: 400 }
    );
  }

  if (submittedCode !== accessCode) {
    return NextResponse.json(
      {
        ok: false,
        message: "Feil kode.",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
  });
}