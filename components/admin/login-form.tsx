"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/client";
export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter(),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setStatus("");
        const data = new FormData(e.currentTarget);
        try {
          const client = browserClient();
          const { data: result, error } = await client.auth.signInWithPassword({
            email: String(data.get("email")),
            password: String(data.get("password")),
          });
          if (error) throw new Error("Email o contraseña incorrectos.");
          if (result.user?.app_metadata?.role !== "admin") {
            await client.auth.signOut();
            throw new Error("Esta cuenta no tiene acceso de administrador.");
          }
          router.replace("/admin");
          router.refresh();
        } catch (error) {
          setStatus(
            error instanceof Error
              ? error.message
              : "No se pudo iniciar sesión.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={!configured}
        />
      </label>
      <label>
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          disabled={!configured}
        />
      </label>
      <button className="button" disabled={busy || !configured}>
        {busy ? "Ingresando…" : "Iniciar sesión →"}
      </button>
      <p role="status" className="form-status">
        {status}
      </p>
    </form>
  );
}
