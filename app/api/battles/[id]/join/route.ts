import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Zaloguj się, aby dołączyć do bitwy." }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("join_battle_atomic", {
    p_user_id: user.id,
    p_battle_id: id,
  });
  if (error) {
    const message = error.message ?? "";
    if (message.includes("INSUFFICIENT_CREDITS")) {
      return NextResponse.json({ error: "Za mało wirtualnych punktów." }, { status: 400 });
    }
    if (message.includes("BATTLE_FULL")) {
      return NextResponse.json({ error: "Brak wolnych miejsc." }, { status: 409 });
    }
    if (message.includes("ALREADY_JOINED")) {
      return NextResponse.json({ error: "Jesteś już uczestnikiem tej bitwy." }, { status: 409 });
    }
    if (message.includes("BATTLE_UNAVAILABLE")) {
      return NextResponse.json({ error: "Bitwa nie jest już dostępna." }, { status: 404 });
    }
    console.error("join_battle_atomic failed", { code: error.code, message: error.message });
    return NextResponse.json({ error: "Nie udało się dołączyć do bitwy." }, { status: 500 });
  }
  return NextResponse.json(data);
}
