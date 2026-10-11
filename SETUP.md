# FoodLens — Setup Guide

## What changed in this version
- Real backend product API (`backend/app/api/products.py`) that calls **Open Food Facts**
  for barcode lookup, search, and category browsing — no mock data.
- Scanner page: live camera barcode scanning (native browser BarcodeDetector) + manual entry.
- Search & Product pages: real loading/error states, real nutrition/ingredients/allergens.
- Auth (Login/Signup/OTP): wired to your existing FastAPI JWT + email-OTP endpoints.
- New green/white logo, rebranded blue → green across the UI.
- **Fixed the homepage flow**: signed-out visitors now see a single sign-in/create-account
  screen — no marketing sections, no nav links to Scan/Search/Restaurants/Saved. All of those
  routes are now guarded (`RequireAuth`) and redirect to `/login` if you're not signed in.
  Once you sign in or verify your OTP, you land on the real homepage (personalized greeting,
  quick actions, live product feed).

## 1. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate      macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: set a real DATABASE_URL (Postgres) and SMTP creds if you want OTP emails to
# actually send. Without SMTP creds, signup will still work but OTP emails won't be delivered —
# check server logs / the otp_challenges table for the code during local dev.

python create_db.py     # or: alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs to confirm it's running.

## 2. Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:5173. You'll land on the sign-in gate — create an account, verify the
OTP, and you'll be dropped onto the real homepage.

## 3. Try it for real
- After signing in: **Scan** → **Enter barcode** → try `3017620422003` (Nutella) or
  `5449000000996` (Coca-Cola).
- Or **Search** → type "yogurt" or pick a category — results are live from Open Food Facts.
- Camera scanning needs a Chromium browser (Chrome/Edge/Android) and HTTPS or localhost.

## Known gaps / honest notes
- **Restaurants** section still uses the original backend module and hasn't been touched.
- **Photo-based food recognition** was intentionally left out — Open Food Facts doesn't do
  image recognition. Faking it with placeholder output would reintroduce the fake data you
  asked me to remove. Real photo recognition would need a paid vision API wired into a new
  backend endpoint.
- `node_modules` is excluded from this zip — run `npm install` fresh.
- Python 3.14 currently breaks `pydantic-core`'s wheel build (PyO3 doesn't support it yet).
  Use Python 3.12 or 3.11 for the backend venv.
