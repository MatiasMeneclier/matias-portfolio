import { sameOrigin } from "@/lib/request-origin";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { contactSchema, receiveContactMessage } from "@/lib/contact-message";
import { getContactEmailConfig, sendContactEmail } from "@/lib/contact-email";
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    return Response.json(
      { error: "El formulario estará disponible próximamente." },
      { status: 503 },
    );
  if (!sameOrigin(request))
    return Response.json({ error: "Origen no permitido" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 10000)
    return Response.json({ error: "Mensaje demasiado largo" }, { status: 413 });
  try {
    const input = contactSchema.parse(await request.json());
    if (input.website) return Response.json({ ok: true });
    const emailConfig = getContactEmailConfig();
    if (!emailConfig)
      return Response.json(
        { error: "El formulario estará disponible próximamente." },
        { status: 503 },
      );
    const client = createClient(url, key, { auth: { persistSession: false } });
    const result = await receiveContactMessage(
      input,
      async (message) => {
        const { error } = await client.rpc("submit_contact", {
          sender_name: message.name,
          sender_email: message.email,
          body: message.message,
        });
        if (error) throw new Error("Contact message rejected");
      },
      (message) => sendContactEmail(message, emailConfig),
    );
    if (!result.emailSent)
      console.error(
        "Contact email failed after retry; message retained in admin inbox.",
      );
    return Response.json({ ok: true });
  } catch (error) {
    if (!(error instanceof z.ZodError || error instanceof SyntaxError))
      return Response.json(
        {
          error:
            "No se pudo enviar. Esperá unos minutos o contactame por LinkedIn.",
        },
        { status: 429 },
      );
    return Response.json(
      { error: "Revisá los datos del formulario." },
      { status: 400 },
    );
  }
}
