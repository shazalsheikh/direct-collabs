#!/usr/bin/env bash
# One command to set up Supabase for DirectCollabs.   Run:  npm run setup:supabase
#
# What it does, in order:
#   1. logs you in to Supabase (a browser window opens, you click Allow)
#   2. links this folder to your project
#   3. creates the tables, the private storage buckets and the access rules
#   4. deploys the receipt function and sets its secrets (Anthropic and Resend keys are optional)
#   5. uploads the paid PDFs to the private downloads bucket
#   6. writes .env.netlify (every variable Netlify needs) and updates .env.local
#
# Your keys stay in .env.supabase and .env.netlify on this computer. Both are git-ignored.
# Safe to run again. DRY_RUN=1 prints what it would do and touches nothing online.
set -euo pipefail
cd "$(dirname "$0")/.."

SB_VERSION="3.0.0"
ENV_FILE=".env.supabase"
OUT_DIR="${OUT_DIR:-.}"
DRY_RUN="${DRY_RUN:-0}"

sb() {
  if [ "$DRY_RUN" = "1" ]; then echo "  [dry run] supabase $*"; else npx --yes "supabase@$SB_VERSION" "$@"; fi
}

if [ ! -f "$ENV_FILE" ]; then
  cp scripts/env.supabase.example "$ENV_FILE"
  echo "I created $ENV_FILE for you."
  echo "Open it, fill in the values, save, then run this command again."
  exit 1
fi

# Load KEY=VALUE lines safely (no shell execution), quotes allowed.
eval "$(python3 - "$ENV_FILE" <<'PY'
import sys, shlex
for line in open(sys.argv[1]):
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
        v = v[1:-1]
    print(f"export {k.strip()}={shlex.quote(v)}")
PY
)"

missing=0
for v in SUPABASE_PROJECT_REF SUPABASE_DB_PASSWORD SITE_URL WHATSAPP_NUMBER; do
  if [ -z "${!v:-}" ]; then echo "Missing in $ENV_FILE: $v"; missing=1; fi
done
[ "$missing" = "1" ] && { echo "Fill those in and run again."; exit 1; }
if ! [[ "$SUPABASE_PROJECT_REF" =~ ^[a-z]{20}$ ]]; then
  echo "SUPABASE_PROJECT_REF should be exactly 20 lowercase letters (Project Settings > General > Reference ID)."; exit 1
fi
if ! [[ "$WHATSAPP_NUMBER" =~ ^[0-9]{10,15}$ ]]; then
  echo "WHATSAPP_NUMBER must be digits only with country code, like 923001234567."; exit 1
fi
SITE_URL="${SITE_URL%/}"

# Lean mode: no Anthropic or Resend key is fine. Orders then wait in Needs review and you tap
# "Mark as paid" in /admin. Add the keys to .env.supabase later and run this again to turn them on.
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then echo "Lean mode: no ANTHROPIC_API_KEY, so every receipt goes to Needs review for you to approve by hand."; fi
if [ -z "${RESEND_API_KEY:-}" ]; then echo "Lean mode: no RESEND_API_KEY, so no access emails. Send links from /admin on WhatsApp."; fi

# A random shared secret between the website and the function.
if [ -z "${VERIFY_FUNCTION_SECRET:-}" ]; then
  VERIFY_FUNCTION_SECRET="$(openssl rand -hex 24)"
  python3 - "$ENV_FILE" "$VERIFY_FUNCTION_SECRET" <<'PY'
import sys, re
p, val = sys.argv[1], sys.argv[2]
s = open(p).read()
s = re.sub(r"^VERIFY_FUNCTION_SECRET=.*$", f"VERIFY_FUNCTION_SECRET={val}", s, flags=re.M)
open(p, "w").write(s)
PY
  echo "Created a random VERIFY_FUNCTION_SECRET and saved it in $ENV_FILE."
fi

echo; echo "Step 1 of 6: log in to Supabase"
if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "  using SUPABASE_ACCESS_TOKEN from your environment"
elif [ "$DRY_RUN" != "1" ] && npx --yes "supabase@$SB_VERSION" projects list >/dev/null 2>&1; then
  echo "  already logged in, skipping"
else
  sb login
fi

echo; echo "Step 2 of 6: link this folder to your project"
sb link --project-ref "$SUPABASE_PROJECT_REF"

echo; echo "Step 3 of 6: create the tables, buckets and access rules"
sb db push --remote -p "$SUPABASE_DB_PASSWORD" --yes

echo; echo "Step 4 of 6: deploy the receipt checker and set its secrets"
sb functions deploy verify-receipt --no-verify-jwt --use-api --yes
SECRETS_TMP="$(mktemp)"
trap 'rm -f "$SECRETS_TMP"' EXIT
python3 - "$SECRETS_TMP" <<'PY'
import os, sys
names = ["ANTHROPIC_API_KEY", "RESEND_API_KEY", "RESEND_FROM", "VERIFY_FUNCTION_SECRET", "SITE_URL", "PIXEL_ID", "META_CAPI_TOKEN", "WHATSAPP_NUMBER"]
with open(sys.argv[1], "w") as f:
    for n in names:
        v = os.environ.get(n, "")
        if v:
            f.write(n + '="' + v.replace("\\", "\\\\").replace('"', '\\"') + '"\n')
PY
if [ "$DRY_RUN" = "1" ]; then echo "  secrets that would be set:"; sed -E 's/=.*/=***/' "$SECRETS_TMP" | sed 's/^/    /'; fi
sb secrets set --env-file "$SECRETS_TMP" --yes

echo; echo "Step 5 of 6: read your project keys"
SERVICE_KEY=""
if [ "$DRY_RUN" = "1" ]; then
  SERVICE_KEY="dry-run-service-key"
else
  KEYS_JSON="$(npx --yes "supabase@$SB_VERSION" projects api-keys --reveal --output json 2>/dev/null || true)"
  SERVICE_KEY="$(KEYS_JSON="$KEYS_JSON" python3 -c '
import json, os
try:
    data = json.loads(os.environ.get("KEYS_JSON", ""))
except Exception:
    raise SystemExit
items = data if isinstance(data, list) else data.get("keys", data.get("data", []))
for it in items:
    if not isinstance(it, dict):
        continue
    label = " ".join(str(it.get(k, "")) for k in ("name", "id", "type")).lower()
    if "service" in label or "secret" in label:
        for v in it.values():
            if isinstance(v, str) and (v.startswith("sb_secret_") or v.startswith("eyJ")):
                print(v)
                raise SystemExit
')"
  if [ -z "$SERVICE_KEY" ]; then
    echo "  I could not read the service key automatically."
    echo "  Supabase dashboard > Project Settings > API keys > copy the secret / service_role key."
    read -r -s -p "  Paste it here (it stays hidden): " SERVICE_KEY; echo
  fi
fi
[ -z "$SERVICE_KEY" ] && { echo "No service key, stopping."; exit 1; }
SUPABASE_URL="https://$SUPABASE_PROJECT_REF.supabase.co"
# Keep the admin password from the last run, so re-running never changes it. New one only the first time.
ADMIN_PASSWORD="$(grep -s '^ADMIN_PASSWORD=' "$OUT_DIR/.env.netlify" | head -1 | cut -d= -f2- | tr -d '"')"
[ -z "$ADMIN_PASSWORD" ] && ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)"

echo; echo "Step 6 of 6: write your env files and upload the PDFs"
SUPABASE_URL="$SUPABASE_URL" SERVICE_KEY="$SERVICE_KEY" ADMIN_PASSWORD="$ADMIN_PASSWORD" OUT_DIR="$OUT_DIR" python3 - <<'PY'
import os, re

def upsert(path, values):
    s = open(path).read() if os.path.exists(path) else ""
    for k, v in values.items():
        line = f"{k}={v}"
        if re.search(rf"^{re.escape(k)}=", s, flags=re.M):
            s = re.sub(rf"^{re.escape(k)}=.*$", lambda m: line, s, flags=re.M)
        else:
            s += ("" if s.endswith("\n") or not s else "\n") + line + "\n"
    open(path, "w").write(s)

e = os.environ
out = e["OUT_DIR"]
os.makedirs(out, exist_ok=True)

# Local development and the PDF upload script read .env.local
upsert(os.path.join(out, ".env.local"), {
    "SUPABASE_URL": e["SUPABASE_URL"],
    "SUPABASE_SERVICE_KEY": e["SERVICE_KEY"],
    "VERIFY_FUNCTION_SECRET": e["VERIFY_FUNCTION_SECRET"],
    "NEXT_PUBLIC_SITE_URL": e["SITE_URL"],
    "NEXT_PUBLIC_WHATSAPP_NUMBER": e["WHATSAPP_NUMBER"],
})

# Everything Netlify needs, ready to import. Empty values are left out.
netlify = {
    "NODE_VERSION": "22",
    "ADMIN_PASSWORD": e["ADMIN_PASSWORD"],
    "SUPABASE_URL": e["SUPABASE_URL"],
    "SUPABASE_SERVICE_KEY": e["SERVICE_KEY"],
    "VERIFY_FUNCTION_SECRET": e["VERIFY_FUNCTION_SECRET"],
    "NEXT_PUBLIC_SITE_URL": e["SITE_URL"],
    "NEXT_PUBLIC_WHATSAPP_NUMBER": e["WHATSAPP_NUMBER"],
    "RESEND_API_KEY": e.get("RESEND_API_KEY", ""),
    "RESEND_FROM": e.get("RESEND_FROM", ""),
    "COURSE_VIDEO_URL": e.get("COURSE_VIDEO_URL", ""),
    "COURSE_INVITE_URL": e.get("COURSE_INVITE_URL", ""),
    "NEXT_PUBLIC_PIXEL_ID": e.get("PIXEL_ID", ""),
    "META_CAPI_TOKEN": e.get("META_CAPI_TOKEN", ""),
    "NEXT_PUBLIC_PAY_IN_2": "false",
}
with open(os.path.join(out, ".env.netlify"), "w") as f:
    for k, v in netlify.items():
        if v != "":
            f.write(f'{k}="{v}"\n' if (" " in v or "<" in v) else f"{k}={v}\n")
PY

if ls content/downloads/*.pdf >/dev/null 2>&1; then
  if [ "$DRY_RUN" = "1" ]; then echo "  [dry run] npm run upload:downloads"; else npm run upload:downloads; fi
else
  echo "  No PDFs found. Run: npm run build:downloads   then   npm run upload:downloads"
fi

echo
echo "Done. What is next:"
echo "  1. Netlify: run  npm run setup:netlify  (or in the website: Site configuration > Environment variables >"
echo "     Add a variable > Import from a .env file, choose $OUT_DIR/.env.netlify)."
echo "     Then Deploys > Trigger deploy > Clear cache and deploy site."
echo "  2. Your admin password for /admin is inside .env.netlify (ADMIN_PASSWORD) and stays the same on re-runs."
echo "  3. Do a Rs 100 test purchase before any ads. Set the Pro price to 100 in lib/offer.config.ts first and put it back after."
