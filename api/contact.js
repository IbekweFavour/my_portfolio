export const runtime = 'edge';

const DEFAULT_TO = 'ibekwefavour11@gmail.com';

const ALLOWED_ORIGINS = new Set([
  'https://ibekwefavour.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

function corsHeaders(origin) {
  const headers = new Headers();
  if (isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  headers.set('Vary', 'Origin');
  return headers;
}

function textResponse(body, status, origin) {
  const headers = corsHeaders(origin);
  headers.set('Content-Type', 'text/plain; charset=utf-8');
  return new Response(body, { status, headers });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmail({ name, email, subject, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Email service is not configured.');
  }

  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.CONTACT_FROM_NAME || 'FavyDScientist Portfolio';
  const from = `${fromName} <${fromEmail}>`;

  const html = `
    <p><strong>From:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <hr />
    <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `[Portfolio] ${subject}`,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Failed to send email.');
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request) {
  const origin = request.headers.get('Origin') || '';

  if (!isAllowedOrigin(origin)) {
    return textResponse('Origin not allowed.', 403, origin);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return textResponse('Invalid form data.', 400, origin);
  }

  if (formData.get('_gotcha')) {
    return textResponse('OK', 200, origin);
  }

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !subject || !message) {
    return textResponse('Please fill in all required fields.', 400, origin);
  }

  if (!isValidEmail(email)) {
    return textResponse('Please enter a valid email address.', 400, origin);
  }

  if (name.length > 200 || email.length > 320 || subject.length > 300 || message.length > 10000) {
    return textResponse('One or more fields are too long.', 400, origin);
  }

  try {
    await sendEmail({ name, email, subject, message });
    return textResponse('OK', 200, origin);
  } catch (error) {
    console.error(error);
    return textResponse('Unable to send your message. Please try again later.', 500, origin);
  }
}
