import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Zaloguj się, aby otwierać skrzynie." }, { status: 401 });

  const body = await request.json().catch(() => null) as { caseId?: unknown; quantity?: unknown } | null;
  if (typeof body?.caseId !== "string" || !body.caseId.trim() ||
      !Number.isInteger(body.quantity) || Number(body.quantity) < 1 || Number(body.quantity) > 5) {
    return NextResponse.json({ error: "Nieprawidłowa skrzynia lub liczba otwarć (1–5)." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("open_case_atomic", {
    p_user_id: user.id,
    p_case_id: body.caseId,
    p_quantity: Number(body.quantity),
  });

  if (error) {
    const message = error.message ?? "";
    if (message.includes("INSUFFICIENT_CREDITS")) {
      return NextResponse.json({ error: "Za mało wirtualnych punktów." }, { status: 400 });
    }
    if (message.includes("CASE_NOT_FOUND") || message.includes("NO_DROPS")) {
      return NextResponse.json({ error: "Nie znaleziono skrzyni lub nie ma ona dropów." }, { status: 404 });
    }
    if (message.includes("QUANTITY_INVALID")) {
      return NextResponse.json({ error: "Liczba otwarć musi wynosić od 1 do 5." }, { status: 400 });
    }
    console.error("open_case_atomic failed", { code: error.code, message: error.message });
    return NextResponse.json({ error: "Nie udało się bezpiecznie otworzyć skrzyni." }, { status: 500 });
  }

  return NextResponse.json(data);
}
