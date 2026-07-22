import { API_BASE_URL } from "./config";

// Mirrors the backend PublicFormTypeEnum (RDPERP.Common.Enums). Sent to the API as
// a NUMBER: the backend's request-side JSON options have no string-enum converter,
// so a name string ("ContactUs") 400s with "could not be converted".
export const PublicFormType = {
  ContactUs: 1,
  MakePartner: 2,
  Careers: 3,
} as const;
export type PublicFormType = (typeof PublicFormType)[keyof typeof PublicFormType];

// What a public form supplies. name / email / message are REQUIRED by the backend
// DTO (ContactUsDto) — a form without a message field must synthesise one.
export interface ContactUsInput {
  name: string;
  email: string;
  message: string;
  requereFrom: PublicFormType;
  phoneNumber?: string | null;
  company?: string | null;
  companySize?: string | null;
  subject?: string | null;
  subjectType?: string | null;
  category?: string | null;
  industry?: string | null;
  country?: string | null;
  messageType?: string | null;
}

export interface ContactUsResult {
  ok: boolean;
  message: string;
}

// The exact wire shape ContactUsController.SaveAsync binds. Field names + casing
// must match the C# DTO VERBATIM — the backend serialises with OriginalNamingPolicy
// (names are NOT camel-cased). Note the intentional oddities carried over from the
// backend: `RequereFrom` (PascalCase + numeric), `compnay_size`, `cetegory`.
function toPayload(input: ContactUsInput) {
  const trimmed = (v?: string | null) => {
    const t = v?.trim();
    return t ? t : null;
  };
  return {
    contact_us_id: 0,
    name: input.name.trim(),
    email: input.email.trim(),
    phone_number: trimmed(input.phoneNumber),
    RequereFrom: input.requereFrom,
    company: trimmed(input.company),
    compnay_size: trimmed(input.companySize),
    subject: trimmed(input.subject),
    subject_type: trimmed(input.subjectType),
    cetegory: trimmed(input.category),
    industry: trimmed(input.industry),
    country: trimmed(input.country),
    message_type: trimmed(input.messageType),
    message: input.message.trim(),
    is_seen: false,
    is_replied: false,
    is_send: false,
  };
}

const GENERIC_ERROR = "We couldn't send your message. Please try again.";

// POSTs a public form submission to the anonymous contact-us endpoint. Never throws;
// returns { ok, message } so the caller can drive its own UI.
export async function submitContactUs(input: ContactUsInput): Promise<ContactUsResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/contact-us/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(toPayload(input)),
    });
  } catch {
    // fetch rejects on a network failure or a CORS block (see config.ts).
    return { ok: false, message: "We couldn't reach the server. Please try again shortly." };
  }

  // Model-validation failures come back as an [ApiController] 400 with a ProblemDetails
  // body — NOT the { succeeded } envelope — so check the HTTP status first.
  if (!res.ok) {
    return { ok: false, message: await readError(res) };
  }

  const body = await res.json().catch(() => null);
  if (body && body.succeeded === false) {
    return { ok: false, message: body.responseMessages || GENERIC_ERROR };
  }
  return { ok: true, message: (body && body.responseMessages) || "Message sent." };
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.responseMessages) return body.responseMessages;
    if (body?.title) return body.title; // ProblemDetails
    const errors = body?.errors as Record<string, string[]> | undefined;
    if (errors) {
      const first = Object.values(errors).flat()[0];
      if (first) return first;
    }
  } catch {
    /* non-JSON body */
  }
  return GENERIC_ERROR;
}
