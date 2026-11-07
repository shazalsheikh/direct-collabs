import "server-only";
import { getOrderByToken, getOrderById, type OrderCurrent } from "./orders";
import { DOWNLOADS } from "./offer.config";

export type Access = {
  /** The order the link belongs to. */
  order: OrderCurrent;
  /** The order whose plan and add-ons count. Upgrades and second payments point at the original order. */
  content: OrderCurrent;
  isPro: boolean;
  hasBump: boolean;
};

/**
 * Turns an access token into what that buyer may open.
 * null when the token is malformed, unknown, or the order is not Approved.
 * Throws DbUnavailable when the database is not configured.
 */
export async function resolveAccess(token: string): Promise<Access | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const order = await getOrderByToken(token);
  if (!order || order.status !== "Approved") return null;
  let content = order;
  if (order.parent_order_id) {
    const parent = await getOrderById(order.parent_order_id);
    if (parent) content = parent;
  }
  return { order, content, isPro: content.plan === "pro", hasBump: content.bump };
}

export type Download = (typeof DOWNLOADS)[number];

/** Is this buyer allowed this file? Pro files need Pro. The bump file needs the bump. */
export function canDownload(d: Download, a: Pick<Access, "isPro" | "hasBump">): boolean {
  const isBump = "bump" in d && d.bump;
  if (d.pro && !a.isPro) return false;
  if (isBump && !a.hasBump) return false;
  return true;
}
