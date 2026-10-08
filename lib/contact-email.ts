import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { ContactMessage } from "./contact-message.ts";

// Imported only by server code. Credentials are never part of public content.
export const contactRecipient = "matimeneclier@gmail.com";
export type ContactEmailConfig = { apiKey: string; from: string; to: string };

export function getContactEmailConfig(
  env: Record<string, string | undefined> = process.env,
): ContactEmailConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.CONTACT_EMAIL_FROM?.trim();
  const to = env.CONTACT_EMAIL_TO?.trim() || contactRecipient;
  const address = from?.match(/<([^<>]+)>$/)?.[1] || from;
  if (
    !apiKey ||
    !from ||
    /[\r\n]/.test(from) ||
    !z.email().safeParse(address).success ||
    !z.email().safeParse(to).success
  )
    return null;
  return { apiKey, from, to };
}

export async function sendContactEmail(
  message: ContactMessage,
  config: ContactEmailConfig,
  {
    fetcher = fetch,
    pause = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms)),
    submissionId = randomUUID(),
  }: {
    fetcher?: typeof fetch;
    pause?: (ms: number) => Promise<void>;
    submissionId?: string;
  } = {},
) {
  const body = JSON.stringify({
    from: config.from,
    to: [config.to],
    reply_to: message.email,
    subject: "Nuevo mensaje desde tu portfolio",
    // Plain text keeps visitor input out of HTML and email headers.
    text: `Nombre: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
  });
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
    "Idempotency-Key": `portfolio-contact/${submissionId}`,
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try {
      response = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(3500),
        cache: "no-store",
      });
    } catch {
      if (attempt === 0) {
        await pause(500);
        continue;
      }
      throw new Error("Contact email transport unavailable");
    }
    if (response.ok) {
      const result: unknown = await response.json();
      if (
        result &&
        typeof result === "object" &&
        "id" in result &&
        typeof result.id === "string" &&
        result.id
      )
        return result.id;
      throw new Error("Contact email response invalid");
    }
    if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await pause(Math.min(2000, Math.max(500, retryAfter * 1000 || 500)));
      continue;
    }
    // Do not log the provider's body: it may contain personal data or secrets.
    throw new Error(`Contact email rejected (${response.status})`);
  }
  throw new Error("Contact email unavailable");
}
