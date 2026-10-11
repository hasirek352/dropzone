import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("battles")
    .select("id,status,max_players,entry_cost,case_ids,created_at,battle_participants(user_id,score)")
    .in("status", ["waiting", "active"])
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: "Nie udało się pobrać bitew." }, { status: 500 });
  return NextResponse.json({ battles: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Zaloguj się, aby utworzyć bitwę." }, { status: 401 });

  const body = await request.json().catch(() => null) as { caseIds?: unknown; maxPlayers?: unknown } | null;
  if (!Array.isArray(body?.caseIds) || body.caseIds.length < 1 || body.caseIds.length > 5 ||
      !body.caseIds.every((x): x is string => typeof x === "string" && x.trim().length > 0)) {
    return NextResponse.json({ error: "Wybierz od 1 do 5 skrzyń." }, { status: 400 });
  }
  const maxPlayers = body.maxPlayers === undefined ? 2 : body.maxPlayers;
  if (![2, 3, 4].includes(Number(maxPlayers))) {
    return NextResponse.json({ error: "Bitwa może mieć 2–4 graczy." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("create_battle_atomic", {
    p_user_id: user.id,
    p_case_ids: body.caseIds,
    p_max_players: Number(maxPlayers),
  });
  if (error) {
    const message = error.message ?? "";
    if (message.includes("INSUFFICIENT_CREDITS")) {
      return NextResponse.json({ error: "Za mało wirtualnych punktów." }, { status: 400 });
    }
    if (message.includes("CASE_NOT_FOUND") || message.includes("CASE_LIST_INVALID") ||
        message.includes("DUPLICATE_CASES") || message.includes("PLAYER_COUNT_INVALID")) {
      return NextResponse.json({ error: "Nieprawidłowe ustawienia bitwy." }, { status: 400 });
    }
    console.error("create_battle_atomic failed", { code: error.code, message: error.message });
    return NextResponse.json({ error: "Nie udało się utworzyć bitwy." }, { status: 500 });
  }
  return NextResponse.json({ battle: data }, { status: 201 });
}
