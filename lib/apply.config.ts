/**
 * The application form: every option the creator can pick, shared by the form, the API and /admin.
 * Edit labels here only. The API refuses any value that is not in these lists.
 */

export const FOLLOWER_RANGES = ["Under 10k", "10k to 30k", "30k to 50k", "50k to 100k", "100k to 500k", "500k or more"] as const;

export const RATE_RANGES = ["I do not charge yet", "Under Rs 10,000", "Rs 10,000 to 25,000", "Rs 25,000 to 50,000", "Rs 50,000 or more"] as const;

export const PAID_STATUS = ["Not yet", "Sometimes", "Regularly", "Only through an agency"] as const;

/** Follow-up pipeline shown in /admin. Must match the check constraint in 0003_applications.sql. */
export const APP_STATUSES = ["New", "Contacted", "Qualified", "Won", "Not a fit"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export const NOTE_MAX = 500;

export type ApplicationInput = {
  name: string;
  whatsapp: string;
  instagram: string;
  followers: string;
  rate: string;
  paid_status: string;
  note: string;
};

export type ApplyErrors = Partial<Record<keyof ApplicationInput, string>>;
