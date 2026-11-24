"use client";

import { useState } from "react";

const input =
  "w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors";

export default function AuthBox({ onAuth, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal");
      setPassword("");
      onAuth(data.user);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const tab = (active) =>
    `flex-1 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
      active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="max-w-sm space-y-3">
      <div className="flex">
        <button type="button" className={tab(mode === "login")} onClick={() => { setMode("login"); setErr(""); }}>
          Masuk
        </button>
        <button type="button" className={tab(mode === "register")} onClick={() => { setMode("register"); setErr(""); }}>
          Daftar
        </button>
      </div>
      <form onSubmit={submit} className="space-y-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username (huruf kecil, angka, _)"
          autoComplete="username"
          autoCapitalize="none"
          maxLength={20}
          required
          className={input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "register" ? "Password (min. 8 karakter)" : "Password"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "register" ? 8 : undefined}
          maxLength={72}
          required
          className={input}
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-primary text-primary-foreground py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Buat Akun"}
        </button>
        {err && <p className="text-xs text-red-500">{err}</p>}
      </form>
    </div>
  );
}
