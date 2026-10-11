"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthPanel() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(mode: "signin" | "signup") {
    setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setMessage(mode === "signup" ? "Konto utworzone. Sprawdź e-mail, jeśli wymagana jest weryfikacja." : "Zalogowano.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Nie udało się zalogować.");
    } finally { setBusy(false); }
  }

  return <div className="auth-wrap">
    <button className="btn btn-login" onClick={() => setOpen(v => !v)}>{open ? "Zamknij" : "Zaloguj się"}</button>
    {open && <div className="auth-popover">
      <strong>Witaj w DROPZONE</strong><p>Użyj e-maila, aby utworzyć konto lub się zalogować.</p>
      <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" /></label>
      <label>Hasło<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" minLength={8}/></label>
      <button className="btn btn-primary auth-submit" disabled={busy || !email || password.length < 8} onClick={()=>signIn("signin")}>{busy ? "Chwila…" : "Zaloguj się"}</button>
      <button className="auth-signup" disabled={busy || !email || password.length < 8} onClick={()=>signIn("signup")}>Nie masz konta? Zarejestruj się</button>
      {message && <small className="auth-message">{message}</small>}
    </div>}
  </div>;
}
