import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 * Returns null when env is missing so every caller degrades to "no data".
 */
let cached: SupabaseClient | null | undefined;

export function db(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    cached = null;
    return cached;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * Count of orders whose latest status is Approved, optionally per plan.
 * Reads the orders_current view (see supabase/migrations). null = unavailable.
 */
export async function countVerifiedSales(plan?: "basic" | "pro"): Promise<number | null> {
  const client = db();
  if (!client) return null;
  let q = client.from("orders_current").select("id", { count: "exact", head: true }).eq("status", "Approved");
  if (plan) q = q.eq("plan", plan);
  const { count, error } = await q;
  if (error) return null;
  return count ?? 0;
}
