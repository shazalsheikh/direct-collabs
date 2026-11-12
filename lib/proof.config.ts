/**
 * Proof numbers shown on the landing page. Every figure here was given by the owner.
 * verified: false renders "about" in front of the number. Flip it only once you hold the
 * creator's payment screenshots. Creators stay anonymous: no names on the page.
 */
export type Result = {
  id: string;
  followers: string;
  /** What the creator put in, PKR. */
  putIn: number;
  /** Brand deals closed, PKR. */
  deals: number;
  verified: boolean;
};

export const RESULTS: Result[] = [
  { id: "creator-1", followers: "45k", putIn: 10000, deals: 70000, verified: false },
  { id: "creator-2", followers: "78k", putIn: 80000, deals: 700000, verified: false },
];
