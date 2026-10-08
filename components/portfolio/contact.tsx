"use client";
import { useState } from "react";
import { useSite } from "./site-preferences";
import { ArrowUpRight, Check } from "lucide-react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
export default function ContactForm({ connected }: { connected: boolean }) {
  const { t } = useSite();
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false);
  return (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!connected) {
          setStatus(t("unconnected"));
          return;
        }
        setBusy(true);
        setStatus("");
        const form = e.currentTarget;
        try {
          const values = Object.fromEntries(new FormData(form));
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || t("sendError"));
          setSent(true);
          form.reset();
          setStatus(t("received"));
        } catch {
          setStatus(t("sendError"));
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        {t("name")}
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          placeholder={t("yourName")}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          name="email"
          required
          maxLength={200}
          autoComplete="email"
          placeholder="tu@email.com"
        />
      </label>
      <label>
        {t("message")}
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          placeholder={t("idea")}
        />
      </label>
      <div className="honeypot" aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <LiquidMetalButton type="submit" disabled={busy || sent || !connected}>
        {sent ? (
          <>
            <Check size={17} /> {t("sent")}
          </>
        ) : (
          <>
            {busy ? t("sending") : t("send")}
            <ArrowUpRight size={18} />
          </>
        )}
      </LiquidMetalButton>
      <p className="form-status" role="status">
        {status || (!connected ? t("unconnected") : "")}
      </p>
    </form>
  );
}
