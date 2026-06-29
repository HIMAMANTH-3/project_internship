# 🪑 AI Export Market Product Positioning Advisor

> **Sri Venkata Sai Furniture Works** — AI-powered platform for international export market positioning

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)](.)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2F%20Express-green)](.)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2F%20Vite-blue)](.)
[![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash%20%7C%20GPT--4o-purple)](.)
[![DB](https://img.shields.io/badge/database-PostgreSQL%20%7C%20SQLite%20fallback-orange)](.)

---

## 📋 Overview

A production-ready full-stack web application that enables Sri Venkata Sai Furniture Works to:

- **Generate** AI-powered export market positioning reports in seconds
- **Manage** full history of all generated recommendations
- **Rate & Feedback** each report with stars, thumbs, and written comments
- **Analyze** usage trends, quality metrics, and market distributions
- **Save & Export** reports as PDF or TXT files
- **Use Presets** to auto-fill forms with common furniture export scenarios

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Vite • React Router • Recharts)   │
│           localhost:5173            │
└──────────────┬──────────────────────┘
               │ REST API calls
               ▼
┌─────────────────────────────────────┐
│         Node.js / Express           │
│     (Helmet • Rate Limiter)         │
│           localhost:5000            │
└──────┬───────────────────┬──────────┘
       │                   │
       ▼                   ▼
┌─────────────┐   ┌────────────────────┐
│ Gemini 1.5  │   │ PostgreSQL Database │
│  Flash API  │   │ (SQLite fallback)   │
│  (or GPT-4o)│   │                    │
└─────────────┘   └────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- A Gemini API key (free) from [Google AI Studio](https://aistudio.google.com/app/apikey) OR an OpenAI API key

### 1. Configure the Backend

```bash
cd backend
# Edit .env file with your API key
notepad .env
```

Set your API key in `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Start the Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Using SQLite database at .../data.db
🚀 AI Export Advisor API running on http://localhost:5000
🤖 AI Model: Gemini 1.5 Flash
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
AI Export Market Product Positioning Advisor/
├── backend/
│   ├── ai/
│   │   └── engine.js          # Gemini/OpenAI AI prompt engine
│   ├── db/
│   │   └── index.js           # DB abstraction (PG + SQLite fallback)
│   ├── routes/
│   │   ├── generate.js        # POST /api/generate
│   │   ├── history.js         # GET/DELETE /api/history
│   │   ├── feedback.js        # POST /api/feedback
│   │   ├── templates.js       # GET/POST /api/templates
│   │   └── analytics.js       # GET /api/admin/analytics & /api/analytics/quality
│   ├── server.js              # Express app entry point
│   ├── .env                   # ⚠️ Add your API key here
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js      # Axios API client
│   │   ├── components/
│   │   │   └── Sidebar.jsx    # Navigation sidebar
│   │   ├── context/
│   │   │   └── ToastContext.jsx # Global notifications
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Main dashboard with charts
│   │   │   ├── Generate.jsx   # Report generation form
│   │   │   ├── Output.jsx     # AI output display + PDF export
│   │   │   ├── History.jsx    # Generation history table
│   │   │   ├── HistoryDetail.jsx # Single report view
│   │   │   ├── Analytics.jsx  # Admin analytics dashboard
│   │   │   └── Templates.jsx  # Preset template manager
│   │   ├── App.jsx            # Root component with routing
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Full design system
│   └── vite.config.js         # Vite + proxy config
│
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/generate` | Generate AI report + save to DB |
| `GET` | `/api/history` | List all generations (with search/filter/pagination) |
| `GET` | `/api/history/:id` | Get single generation with feedback |
| `DELETE` | `/api/history/:id` | Delete a generation |
| `PATCH` | `/api/history/:id/rating` | Update star rating |
| `POST` | `/api/feedback` | Submit thumbs/stars/comment feedback |
| `GET` | `/api/templates` | Get all preset templates |
| `POST` | `/api/templates` | Create a new template |
| `GET` | `/api/admin/analytics` | Full analytics (trends, markets, categories) |
| `GET` | `/api/analytics/quality` | Quality metrics (ratings, response times) |

---

## 🤖 AI Prompt System

The AI engine (`backend/ai/engine.js`) sends a structured system prompt to Gemini/OpenAI requesting a JSON object with 7 defined sections:

1. `marketPositioning` — Detailed positioning strategy
2. `packagingAdaptations` — Market-specific packaging guidance  
3. `pricingConsiderations` — Pricing strategy with currency benchmarks
4. `marketEntryStrategy` — Entry channels and partner guidance
5. `competitiveAdvantages` — Unique selling propositions
6. `risks` — Regulatory, economic, and logistics risks
7. `exportReadinessChecklist` — Array of actionable pre-launch items

**Prompt version**: `1.0.0` — all generations are tagged with their prompt version for quality tracking.

---

## 🗄️ Database

The app supports **two database modes**:

| Mode | Trigger | Use case |
|------|---------|----------|
| **SQLite** (auto) | Default, no config needed | Local development, testing |
| **PostgreSQL** | Set `DATABASE_URL` in `.env` | Production deployment |

SQLite data is stored in `backend/data.db` and persists across restarts.

---

## 🛡️ Security Features

- **Helmet.js** — HTTP security headers
- **CORS** — Origin restriction in production
- **Rate limiting** — 10 AI generations/minute, 30 API requests/minute
- **Input sanitization** — Length limits and HTML-stripping on all inputs
- **Prompt injection prevention** — Structured JSON prompt with strict output format
- **Environment variables** — All secrets in `.env`, never in source

---

## 🎨 UI Features

- **Premium dark theme** with glassmorphism cards
- **Fully responsive** — works on desktop, tablet, and mobile
- **Recharts dashboards** — Line, Bar, and Pie charts
- **PDF export** — Via jsPDF, formatted with sections
- **TXT export** — Full report text download
- **Clipboard copy** — One-click copy
- **Toast notifications** — Non-intrusive feedback messages
- **Loading states** — Animated spinners and progress indicators
- **Error boundaries** — Graceful error handling

---

## 📦 Preset Templates (Pre-loaded)

| Template | Category | Market |
|----------|----------|--------|
| Wooden Dining Tables → USA | Home Furniture | United States |
| Office Chairs → Germany | Office Furniture | Germany |
| Bedroom Furniture → UAE | Home Furniture | UAE |
| Custom Furniture → Australia | Custom Furniture | Australia |
| Premium Furniture → UK | Export-Grade Furniture | United Kingdom |

---

## 🚢 Deployment

### Frontend → Vercel
1. Push `/frontend` to GitHub
2. Import into [Vercel](https://vercel.com)
3. Set `VITE_API_URL=https://your-backend.onrender.com`

### Backend → Render
1. Push `/backend` to GitHub
2. Create Web Service on [Render](https://render.com)
3. Set environment variables: `GEMINI_API_KEY`, `DATABASE_URL`, `NODE_ENV=production`

### Database → Supabase
1. Create project on [Supabase](https://supabase.com)
2. Copy PostgreSQL connection string to `DATABASE_URL`
3. The schema is auto-created on first backend start

---

## 🧪 Testing

```bash
# Test backend health
Invoke-RestMethod -Uri 'http://localhost:5000/api/health'

# Test templates are seeded
Invoke-RestMethod -Uri 'http://localhost:5000/api/templates'

# Test analytics
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/analytics'
```

---

## 📝 License

MIT — Sri Venkata Sai Furniture Works Internal Tool
