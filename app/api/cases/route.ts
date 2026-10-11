import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cases").select("id,name,description,price,emoji,accent,category").eq("active", true).order("price");
  if (error) return NextResponse.json({ error: "Could not load cases." }, { status: 500 });
  return NextResponse.json({ cases: data });
}
