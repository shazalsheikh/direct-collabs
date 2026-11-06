/** Unit tests for the pure decision logic. Run: node --test scripts/decide.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { decide, type Ocr } from "../supabase/functions/_shared/decide.ts";

const base: Ocr = {
  amount: 7900, currency: "PKR", receiver_account: "PK00DUMM0000000000000000", receiver_name: "DirectCollabs Dummy",
  sender_name: "Ali", txn_id: "TX123", date: new Date(Date.now() - 2 * 36e5).toISOString(), status: "success", confidence: 0.95, notes: null,
};
const input = (ocr: Partial<Ocr>, extra: Partial<Parameters<typeof decide>[0]> = {}) => ({
  ocr: { ...base, ...ocr }, expectedAmounts: [7900], acceptedReceivers: ["PK00DUMM0000000000000000", "00000000000000", "03XXXXXXXXX"],
  txnSeen: false, hashSeenElsewhere: false, now: new Date(), maxAgeHours: 48, toleranceRs: 0, ...extra,
});

test("approves a clean receipt", () => assert.equal(decide(input({})).approve, true));
test("rejects amount mismatch", () => assert.match((decide(input({ amount: 7000 })) as { reason: string }).reason, /Amount mismatch/));
test("rejects wrong receiver", () => assert.match((decide(input({ receiver_account: "PK99OTHR1111111111111111" })) as { reason: string }).reason, /Receiver/));
test("rejects duplicate txn", () => assert.match((decide(input({}, { txnSeen: true })) as { reason: string }).reason, /Duplicate transaction/));
test("rejects duplicate hash", () => assert.match((decide(input({}, { hashSeenElsewhere: true })) as { reason: string }).reason, /Duplicate receipt/));
test("rejects old receipt", () => assert.match((decide(input({ date: new Date(Date.now() - 80 * 36e5).toISOString() })) as { reason: string }).reason, /older/));
test("rejects low confidence", () => assert.match((decide(input({ confidence: 0.3 })) as { reason: string }).reason, /Unreadable/));
test("rejects pending", () => assert.match((decide(input({ status: "pending" })) as { reason: string }).reason, /pending/));
test("accepts pay-in-2 partial", () => assert.equal(decide(input({ amount: 4000 }, { expectedAmounts: [4000] })).approve, true));
test("never approves without txn id", () => assert.equal(decide(input({ txn_id: null })).approve, false));
