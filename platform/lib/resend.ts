import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendQuoteEmail({
  to,
  clientName,
  companyName,
  quoteNumber,
  total,
  approvalUrl,
  validUntil,
}: {
  to: string;
  clientName: string;
  companyName: string;
  quoteNumber: string;
  total: number;
  approvalUrl: string;
  validUntil?: string;
}) {
  return resend.emails.send({
    from: `${companyName} <quotes@${process.env.RESEND_FROM_DOMAIN}>`,
    to,
    subject: `Quote ${quoteNumber} from ${companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1D9E75;">Quote ${quoteNumber}</h2>
        <p>Hi ${clientName},</p>
        <p>${companyName} has sent you a quote for <strong>$${total.toFixed(2)}</strong>.</p>
        ${validUntil ? `<p>This quote is valid until ${validUntil}.</p>` : ""}
        <a href="${approvalUrl}"
           style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Review &amp; Approve Quote
        </a>
        <p style="color:#666;font-size:12px;">If you did not request this quote, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendInvoiceEmail({
  to,
  clientName,
  companyName,
  invoiceNumber,
  total,
  dueDate,
  payUrl,
}: {
  to: string;
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  total: number;
  dueDate?: string;
  payUrl: string;
}) {
  return resend.emails.send({
    from: `${companyName} <invoices@${process.env.RESEND_FROM_DOMAIN}>`,
    to,
    subject: `Invoice ${invoiceNumber} from ${companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1D9E75;">Invoice ${invoiceNumber}</h2>
        <p>Hi ${clientName},</p>
        <p>You have an invoice from ${companyName} for <strong>$${total.toFixed(2)}</strong>.</p>
        ${dueDate ? `<p>Payment is due by ${dueDate}.</p>` : ""}
        <a href="${payUrl}"
           style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Pay Now
        </a>
        <p style="color:#666;font-size:12px;">If you have questions, reply to this email.</p>
      </div>
    `,
  });
}

export async function sendTeamInviteEmail({
  to,
  inviterName,
  companyName,
  role,
  inviteUrl,
}: {
  to: string;
  inviterName: string;
  companyName: string;
  role: string;
  inviteUrl: string;
}) {
  return resend.emails.send({
    from: `${companyName} <team@${process.env.RESEND_FROM_DOMAIN}>`,
    to,
    subject: `You've been invited to join ${companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1D9E75;">Team Invitation</h2>
        <p>${inviterName} has invited you to join <strong>${companyName}</strong> as a ${role}.</p>
        <a href="${inviteUrl}"
           style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Accept Invitation
        </a>
        <p style="color:#666;font-size:12px;">This invitation expires in 7 days.</p>
      </div>
    `,
  });
}
