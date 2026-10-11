# 🥗 FoodLens

> Scan it. Understand it. Eat smarter.

FoodLens is a full-stack food-transparency web app. Scan a barcode or search for a product and instantly see its real nutrition facts, ingredients, allergens and a health score — powered by the [Open Food Facts](https://world.openfoodfacts.org/) database. You can also compare products, find healthier alternatives, save items, and browse restaurants.

## ✨ Features

- 🔐 **Authentication** — signup, login, email OTP verification, JWT access/refresh tokens
- 📷 **Barcode scanner** — live camera scanning (browser `BarcodeDetector`) or manual barcode entry
- 🔎 **Product search** — search and browse by category with live Open Food Facts data
- 📊 **Nutrition insights** — nutrition facts, ingredients, allergens, score ring and nutrient bars
- ⚖️ **Compare products** side by side
- 🌱 **Healthier alternatives** suggestions
- 💾 **Saved products & scan history**
- 🍽️ **Restaurants** — list and detail pages
- 🛡️ **Admin panel** with role-based access
- 📱 Responsive UI with mobile bottom navigation

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Axios, Lucide icons |
| Backend | FastAPI, SQLAlchemy 2, Alembic, Pydantic 2 |
| Database | PostgreSQL |
| Auth | PyJWT, passlib (bcrypt), email OTP |
| Data source | Open Food Facts API |

## 📁 Project Structure

```
foodlens-web/
├── src/                  # React frontend
│   ├── components/       # UI, food, navigation, auth components
│   ├── pages/            # Home, Scanner, Search, Product, Compare, ...
│   ├── services/         # API client (axios) + local storage helpers
│   ├── utils/            # Claim intelligence helpers
│   └── types/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── alembic/          # Migrations
│   └── requirements.txt
├── public/
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python **3.11 or 3.12** (Python 3.14 currently breaks `pydantic-core`)
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/foodlens-web.git
cd foodlens-web
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # then edit .env with your own values
python create_db.py         # creates the database
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend setup

Open a new terminal in the project root:

```bash
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173

## 🔑 Environment Variables

**Frontend** (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend base URL | `http://localhost:8000` |

**Backend** (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs — **use a long random value** |
| `OTP_SECRET` | Secret for OTP handling — **use a long random value** |
| `SMTP_HOST` / `SMTP_PORT` | SMTP server for sending OTP emails |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | SMTP credentials |
| `EMAIL_FROM` | Sender address |
| `FRONTEND_URL` | Frontend URL |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins |
| `ENVIRONMENT` | `development` or `production` |

> ⚠️ Never commit your real `.env` files. Only `.env.example` files belong in Git.

In `development` mode, OTP codes are printed in the backend console instead of being emailed.

## 🧪 Try It

After signing in, go to **Scan → Enter barcode** and try:

- `3017620422003` (Nutella)
- `5449000000996` (Coca-Cola)

Or use **Search** and type "yogurt".

> Camera scanning needs a Chromium-based browser (Chrome / Edge / Android) and HTTPS or `localhost`.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the production build |

## 🗺️ Roadmap

- [ ] Production email (SMTP) delivery for OTP
- [ ] Photo-based food recognition (needs a vision API)
- [ ] Automated tests
- [ ] Docker setup

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

Add a license of your choice (e.g. MIT) — see [choosealicense.com](https://choosealicense.com/).

## 🙏 Acknowledgements

- [Open Food Facts](https://world.openfoodfacts.org/) for the open food database
