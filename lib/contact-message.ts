import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase().max(200),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
});

export type ContactMessage = Pick<
  z.infer<typeof contactSchema>,
  "name" | "email" | "message"
>;

// Persist before notifying. A mail outage must not discard a received message
// or prompt the visitor to submit the same message again.
export async function receiveContactMessage(
  message: ContactMessage,
  save: (message: ContactMessage) => Promise<void>,
  notify: (message: ContactMessage) => Promise<unknown>,
) {
  await save(message);
  try {
    await notify(message);
    return { emailSent: true };
  } catch {
    return { emailSent: false };
  }
}
