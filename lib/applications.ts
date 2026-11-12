import "server-only";
import { db } from "./db";
import { DbUnavailable } from "./orders";
import type { AppStatus } from "./apply.config";

export type Application = {
  id: string;
  name: string;
  whatsapp: string;
  instagram: string;
  followers: string;
  rate: string;
  paid_status: string;
  note: string | null;
  utm: Record<string, string>;
  status: AppStatus;
  created_at: string;
  updated_at: string;
};

type NewApplication = Pick<Application, "name" | "whatsapp" | "instagram" | "followers" | "rate" | "paid_status" | "note" | "utm"> & {
  fbp: string | null;
  fbc: string | null;
  fbclid: string | null;
};

const DAY_MS = 864e5;

/**
 * Save an application. If the same WhatsApp number applied in the last 24 hours and nobody has
 * touched it yet, that row is updated instead, so a double tap or a corrected resend does not
 * make two follow-ups.
 */
export async function saveApplication(a: NewApplication): Promise<{ id: string }> {
  const client = db();
  if (!client) throw new DbUnavailable();
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const { data: recent, error: rErr } = await client
    .from("applications")
    .select("id")
    .eq("whatsapp", a.whatsapp)
    .eq("status", "New")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1);
  if (rErr) throw new Error(rErr.message);
  if (recent?.[0]) {
    const { error } = await client
      .from("applications")
      .update({ name: a.name, instagram: a.instagram, followers: a.followers, rate: a.rate, paid_status: a.paid_status, note: a.note, updated_at: new Date().toISOString() })
      .eq("id", recent[0].id);
    if (error) throw new Error(error.message);
    return { id: recent[0].id as string };
  }
  const { data, error } = await client.from("applications").insert(a).select("id").single();
  if (error) throw new Error(error.message);
  return { id: data.id as string };
}

/** Newest first. null when the database is not configured or the table is missing. */
export async function listApplications(limit = 300): Promise<Application[] | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client.from("applications").select("id,name,whatsapp,instagram,followers,rate,paid_status,note,utm,status,created_at,updated_at").order("created_at", { ascending: false }).limit(limit);
  if (error) return null;
  return (data ?? []) as Application[];
}

export async function setApplicationStatus(id: string, status: AppStatus): Promise<boolean> {
  const client = db();
  if (!client) throw new DbUnavailable();
  const { data, error } = await client.from("applications").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
