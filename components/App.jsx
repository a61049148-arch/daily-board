"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { makeDb, makeSample, makeCalendar, makePush } from "@/lib/adapters";
import { startBoard } from "@/lib/board";
import { SHELL } from "@/components/shell";

const SHELL_WITH_SIGNOUT = SHELL.replace(
  '<div class="side-foot" id="sidefoot"></div>',
  '<div class="side-foot" id="sidefoot"></div><button class="signout" id="signout" type="button">Sign out</button>'
);

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession((prev) => (prev && s && prev.user.id === s.user.id ? prev : s || null)));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return <Login />;
  return <Board userId={session.user.id} />;
}

function Board({ userId }) {
  const ref = useRef(null);
  useEffect(() => {
    const sb = supabase();
    startBoard({ db: makeDb(sb, userId), sample: makeSample(sb), calendar: makeCalendar(sb), push: makePush(sb) });
    const btn = document.getElementById("signout");
    if (btn) btn.onclick = async () => { await sb.auth.signOut(); location.reload(); };
  }, [userId]);
  return <div ref={ref} style={{ height: "100%" }} dangerouslySetInnerHTML={{ __html: SHELL_WITH_SIGNOUT }} />;
}

function Login() {
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const sb = supabase();
    const res = mode === "in"
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (res.error) { setMsg(res.error.message); return; }
    if (mode === "up" && !res.data.session) setMsg("Account created. Confirm your email (or turn off email confirmation in Supabase), then sign in.");
  }

  return (
    <div className="auth">
      <form onSubmit={submit}>
        <div className="brand"><span className="logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span><b>Daily Board</b></div>
        <h1>{mode === "in" ? "Sign in" : "Create your account"}</h1>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div className="err" role="alert">{msg}</div>
        <button className="btn" type="submit" disabled={busy}>{busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}</button>
        <button type="button" className="switch" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>
          {mode === "in" ? "First time here? Create your account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
