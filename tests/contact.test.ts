import test from "node:test";
import assert from "node:assert/strict";
import {
  contactSchema,
  receiveContactMessage,
} from "../lib/contact-message.ts";
import {
  contactRecipient,
  getContactEmailConfig,
  sendContactEmail,
} from "../lib/contact-email.ts";

const message = {
  name: "Contacto de prueba",
  email: "sender@example.test",
  message: "Quisiera conversar sobre un proyecto.",
};
const config = {
  apiKey: "test-only-key",
  from: "Portfolio <contact@example.test>",
  to: contactRecipient,
};

test("contact mail needs server credentials and a valid sender; recipient defaults to Matias", () => {
  assert.equal(getContactEmailConfig({}), null);
  assert.equal(getContactEmailConfig({ RESEND_API_KEY: "key" }), null);
  assert.equal(
    getContactEmailConfig({
      RESEND_API_KEY: "key",
      CONTACT_EMAIL_FROM: "invalid",
    }),
    null,
  );
  assert.equal(
    getContactEmailConfig({
      RESEND_API_KEY: "key",
      CONTACT_EMAIL_FROM: "A\nB <contact@example.test>",
    }),
    null,
  );
  assert.equal(
    getContactEmailConfig({
      RESEND_API_KEY: "key",
      CONTACT_EMAIL_FROM: config.from,
      CONTACT_EMAIL_TO: "invalid",
    }),
    null,
  );
  assert.equal(
    getContactEmailConfig({
      RESEND_API_KEY: "key",
      CONTACT_EMAIL_FROM: config.from,
    })?.to,
    "matimeneclier@gmail.com",
  );
});

test("visitor cannot choose a recipient or sender; email uses plain text and Reply-To", async () => {
  const input = contactSchema.parse({
    ...message,
    email: "SENDER@example.test",
    message: "<script>alert('x')</script> Mensaje de prueba",
    to: "other@example.test",
    from: "spoof@example.test",
  });
  assert.equal(input.email, "sender@example.test");
  assert.equal("to" in input, false);
  assert.equal("from" in input, false);
  let calls = 0;
  const id = await sendContactEmail(input, config, {
    fetcher: async (url, init) => {
      calls++;
      assert.equal(url, "https://api.resend.com/emails");
      const payload = JSON.parse(String(init?.body));
      assert.deepEqual(payload.to, ["matimeneclier@gmail.com"]);
      assert.equal(payload.from, config.from);
      assert.equal(payload.reply_to, message.email);
      assert.equal("html" in payload, false);
      assert.ok(payload.text.includes(input.message));
      assert.ok(init?.signal);
      return Response.json({ id: "accepted-email" });
    },
  });
  assert.equal(id, "accepted-email");
  assert.equal(calls, 1);
});

test("transient mail failure retries with the same payload and idempotency key", async () => {
  const keys: string[] = [],
    bodies: string[] = [],
    delays: number[] = [];
  await sendContactEmail(message, config, {
    submissionId: "one-submission",
    pause: async (ms) => {
      delays.push(ms);
    },
    fetcher: async (_url, init) => {
      keys.push(new Headers(init?.headers).get("Idempotency-Key")!);
      bodies.push(String(init?.body));
      return keys.length === 1
        ? new Response(null, { status: 429, headers: { "retry-after": "1" } })
        : Response.json({ id: "accepted-email" });
    },
  });
  assert.deepEqual(keys, [
    "portfolio-contact/one-submission",
    "portfolio-contact/one-submission",
  ]);
  assert.equal(bodies[0], bodies[1]);
  assert.deepEqual(delays, [1000]);
});

test("permanent mail rejection is not retried or exposed with provider details", async () => {
  let calls = 0;
  await assert.rejects(
    sendContactEmail(message, config, {
      fetcher: async () => {
        calls++;
        return Response.json(
          { message: "Private provider diagnostic" },
          { status: 403 },
        );
      },
    }),
    /^Error: Contact email rejected \(403\)$/,
  );
  assert.equal(calls, 1);
});

test("mail transport retries once and then stops", async () => {
  let calls = 0;
  await assert.rejects(
    sendContactEmail(message, config, {
      pause: async () => {},
      fetcher: async () => {
        calls++;
        throw new Error("network down");
      },
    }),
    /transport unavailable/,
  );
  assert.equal(calls, 2);
});

test("only accepted inbox messages trigger mail; notification failure keeps the saved message", async () => {
  const events: string[] = [];
  const received = await receiveContactMessage(
    message,
    async () => {
      events.push("saved");
    },
    async () => {
      events.push("mail");
      throw new Error("mail unavailable");
    },
  );
  assert.deepEqual(events, ["saved", "mail"]);
  assert.equal(received.emailSent, false);
  events.length = 0;
  await assert.rejects(
    receiveContactMessage(
      message,
      async () => {
        throw new Error("rate limited");
      },
      async () => {
        events.push("mail");
      },
    ),
    /rate limited/,
  );
  assert.deepEqual(events, []);
  assert.equal(
    (
      await receiveContactMessage(
        message,
        async () => {},
        async () => {},
      )
    ).emailSent,
    true,
  );
});
