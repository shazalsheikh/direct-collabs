import "server-only";
import { appendEvent, updateOrder, newAccessToken, applyLinkedApproval, type OrderCurrent } from "./orders";
import { sendAccessEmail } from "./email";
import { sendCapiEvent } from "./capi";
import { SITE } from "./site.config";

/**
 * Manual approval from /admin. Same side effects as the Edge Function's
 * auto-approve: token, Approved event, access email, Meta Purchase (never skipped).
 */
export async function approveManually(order: OrderCurrent, note = "Marked as paid by admin") {
  const token = order.access_token ?? newAccessToken();
  const patch: Record<string, unknown> = { access_token: token };
  if (order.pay_in_2?.enabled && !order.pay_in_2.first_paid) patch.pay_in_2 = { ...order.pay_in_2, first_paid: true };
  await updateOrder(order.ref, patch as Parameters<typeof updateOrder>[1]);
  await appendEvent(order.id, { status: "Approved", method: "manual", reason: note, receipt_path: order.receipt_path, receipt_hash: order.receipt_hash, txn_id: order.txn_id });
  await applyLinkedApproval(order);

  const accessUrl = `${SITE.url.replace(/\/$/, "")}/access/${token}`;
  const [email, capi] = await Promise.all([
    order.email && order.plan !== "coaching"
      ? sendAccessEmail({ apiKey: process.env.RESEND_API_KEY, from: process.env.RESEND_FROM, to: order.email, name: order.name ?? "", plan: order.plan === "pro" ? "course" : "Basic", ref: order.ref, accessUrl, whatsappUrl: SITE.whatsappNumber ? `https://wa.me/${SITE.whatsappNumber}` : undefined })
      : Promise.resolve({ sent: false, error: "no email" }),
    sendCapiEvent({
      pixelId: process.env.NEXT_PUBLIC_PIXEL_ID,
      token: process.env.META_CAPI_TOKEN,
      eventId: order.event_id ?? `purchase-${order.id}`,
      value: order.pay_in_2?.enabled && !order.pay_in_2.first_paid ? order.pay_in_2.first : order.amount,
      email: order.email,
      phone: order.whatsapp,
      fbp: order.fbp,
      fbc: order.fbc,
      sourceUrl: `${SITE.url}/checkout`,
    }),
  ]);
  return { token, accessUrl, email, capi };
}
