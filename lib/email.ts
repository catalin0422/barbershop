import { Resend } from "resend";

const FROM = "BarberShop <noreply@maisonbarber.ro>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  barberName: string;
  startTime: string; // ISO
  durationMinutes: number;
  price: number;
  appointmentId: string;
}

export async function sendBookingConfirmation(data: AppointmentEmailData) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your-resend-api-key") {
    console.warn("[email] RESEND_API_KEY not configured — skipping email");
    return;
  }

  const date = new Date(data.startTime);
  const dateStr = date.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await getResend().emails.send({
    from: FROM,
    to: data.clientEmail,
    subject: `Confirmare programare — ${data.serviceName} · ${dateStr}`,
    html: `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0e0d; color: #f5f0e8; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #2a2520; }
    .logo { font-size: 24px; font-weight: 700; color: #d4af37; }
    .card { background: #1a1714; border: 1px solid #2a2520; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2520; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #8a7a6a; }
    .value { font-weight: 600; }
    .price { font-size: 24px; color: #d4af37; font-weight: 700; }
    .btn { display: inline-block; background: linear-gradient(135deg, #e3cd5b, #d4af37); color: #1a1200; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
    .footer { text-align: center; font-size: 12px; color: #5a4a3a; padding-top: 24px; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">✂ BarberShop</div>
    <p style="color:#8a7a6a; margin-top:8px;">Programare confirmată</p>
  </div>

  <p>Bună, <strong>${data.clientName}</strong>!</p>
  <p>Programarea ta a fost înregistrată cu succes. Te așteptăm!</p>

  <div class="card">
    <div class="row"><span class="label">Serviciu</span><span class="value">${data.serviceName}</span></div>
    <div class="row"><span class="label">Frizer</span><span class="value">${data.barberName}</span></div>
    <div class="row"><span class="label">Data</span><span class="value">${dateStr}</span></div>
    <div class="row"><span class="label">Ora</span><span class="value">${timeStr}</span></div>
    <div class="row"><span class="label">Durată</span><span class="value">${data.durationMinutes} min</span></div>
    <div class="row"><span class="label">Total</span><span class="price">${data.price} RON</span></div>
  </div>

  <p style="font-size:13px; color:#8a7a6a;">Plata se face la salon. Dacă dorești să anulezi sau modifici, te rugăm să ne contactezi cu cel puțin 2 ore înainte.</p>

  <div style="text-align:center;">
    <a class="btn" href="${SITE}/book">Rezervă din nou</a>
  </div>

  <div class="footer">
    <p>Strada Mendeleev 7, București · +40 712 345 678</p>
    <p>© ${new Date().getFullYear()} BarberShop</p>
  </div>
</div>
</body>
</html>`,
  });
}

export async function sendBarberNotification(data: AppointmentEmailData & { barberEmail: string }) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your-resend-api-key") return;

  const date = new Date(data.startTime);
  const dateStr = date.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = date.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });

  await getResend().emails.send({
    from: FROM,
    to: data.barberEmail,
    subject: `Programare nouă — ${data.clientName} · ${timeStr}`,
    html: `
<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0f0e0d;color:#f5f0e8;">
  <h2 style="color:#d4af37;">✂ Programare nouă</h2>
  <p>Ai o programare nouă, <strong>${data.barberName}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;color:#8a7a6a;">Client</td><td style="padding:8px;font-weight:600;">${data.clientName}</td></tr>
    <tr><td style="padding:8px;color:#8a7a6a;">Serviciu</td><td style="padding:8px;font-weight:600;">${data.serviceName}</td></tr>
    <tr><td style="padding:8px;color:#8a7a6a;">Data</td><td style="padding:8px;font-weight:600;">${dateStr} · ${timeStr}</td></tr>
  </table>
  <a href="${SITE}/dashboard" style="display:inline-block;background:#d4af37;color:#1a1200;font-weight:700;padding:10px 24px;border-radius:8px;text-decoration:none;">Vezi în dashboard</a>
</div>`,
  });
}
