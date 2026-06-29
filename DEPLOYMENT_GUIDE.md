# 🚀 AI Export Market Product Positioning Advisor - Deployment Guide

## Overview
Full-stack application for AI-powered furniture export market analysis. Built with React + Vite (frontend), Express.js (backend), and SQLite database.

**GitHub Repository**: https://github.com/HIMAMANTH-3/project_internship

---

## 📦 Project Structure

```
project/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── pages/           # Dashboard, Generate, Templates, Analytics, History
│   │   ├── components/      # ProtectedRoute, Sidebar
│   │   ├── context/         # Auth & Toast contexts
│   │   ├── api/             # API client
│   │   └── App.jsx          # Main app component
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Express.js API server
│   ├── routes/              # Auth, Generate, Feedback, History, Templates, Analytics
│   ├── db/                  # Database initialization & schema
│   ├── middleware/          # Auth middleware
│   ├── ai/                  # AI engine (Gemini/OpenAI)
│   ├── server.js            # Main server
│   └── package.json
├── api/                      # Vercel serverless function wrapper
├── vercel.json              # Vercel deployment config
├── .vercelignore            # Vercel ignore rules
└── .gitignore              # Git ignore rules
```

---

## 🔐 Authentication

**Demo Credentials** (auto-seeded):

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | `admin`  | `admin123` |
| User  | `user`   | `user123`  |

---

## 🌐 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup & Run

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Start backend (from backend/ directory)
npm start
# Backend runs on http://localhost:5000

# 4. Start frontend (from frontend/ directory, new terminal)
npm run dev
# Frontend runs on http://localhost:5174

# 5. Access the app
# Open http://localhost:5174/login
# Use credentials above to log in
```

---

## ⚙️ Configuration

### Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# AI Models (choose one or both)
# GEMINI_API_KEY=your_gemini_key_here
# OPENAI_API_KEY=your_openai_key_here

# Database (optional - defaults to SQLite)
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30

# Production
# FRONTEND_URL=https://your-app.vercel.app
```

### Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Vercel Deployment

### Step 1: Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `https://github.com/HIMAMANTH-3/project_internship`
4. Select project root (default)

### Step 2: Configure Environment
In Vercel Project Settings → Environment Variables, add:

```
NODE_ENV=production
DATABASE_URL=your_postgresql_url_if_using_db
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Step 3: Build Settings
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Framework**: `Vite`

### Step 4: Deploy
Click "Deploy" - Vercel will:
1. Build the React frontend
2. Deploy serverless backend at `/api`
3. Serve frontend with API routes rewrites

---

## 🎯 Features

### 🔐 Authentication
- JWT-based login/logout
- Role-based access (Admin/User)
- Secure token storage
- Auto-logout on token expiration

### 📊 Dashboard
- Key metrics overview
- Recent generations
- Quick navigation

### ✨ Generate Reports
- Multi-field form for product details
- Real-time character counters
- Template preset system
- AI-powered market positioning analysis
- PDF export capability

### 🎯 Templates
- Pre-configured market presets
- One-click auto-fill
- Custom template creation

### 📝 History
- View all previous generations
- Detailed reports
- Rating and feedback
- Export to PDF

### 📈 Analytics
- Generation statistics
- User engagement metrics
- Quality metrics dashboard
- Time-series analysis

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Generation
- `POST /api/generate` - Generate report
- `GET /api/history` - Get user history
- `GET /api/history/:id` - Get specific report
- `PATCH /api/history/:id/rating` - Rate report
- `DELETE /api/history/:id` - Delete report

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template

### Feedback
- `POST /api/feedback` - Submit feedback

### Analytics
- `GET /api/admin/analytics` - Get analytics (admin)
- `GET /api/analytics/quality` - Quality metrics

### Health
- `GET /api/health` - Health check

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure frontend URL is in backend `CORS whitelist` (server.js)
- Development: `http://localhost:5173`, `http://localhost:5174`
- Production: Update with actual Vercel domain

### Database Issues
- Clear local SQLite: Delete `backend/data.db`
- Users auto-seed on first run
- For production, use PostgreSQL (Supabase/Render)

### AI Generation Not Working
- Set `GEMINI_API_KEY` or `OPENAI_API_KEY` in `.env`
- App has built-in mock generator as fallback
- Check API key validity and quota

### Build Errors
- Clear `node_modules` and reinstall: `npm install`
- Check Node version: `node --version` (must be 18+)
- Clear cache: `npm cache clean --force`

---

## 📚 Tech Stack

**Frontend**
- React 19
- Vite 8
- React Router 7
- Axios
- Recharts
- html2canvas & jsPDF

**Backend**
- Express.js 4
- SQLite / PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- Helmet (security)
- CORS
- Rate Limiting

**AI**
- Google Gemini 1.5 Flash
- OpenAI GPT-4o

**Deployment**
- Vercel (frontend + serverless backend)
- GitHub Actions (CI/CD)

---

## 📋 Checklist Before Going Live

- [ ] Set all required environment variables
- [ ] Configure database (PostgreSQL recommended)
- [ ] Add AI API keys (Gemini or OpenAI)
- [ ] Update `FRONTEND_URL` in production `.env`
- [ ] Test all authentication flows
- [ ] Verify CORS settings
- [ ] Test report generation
- [ ] Check PDF export
- [ ] Review analytics dashboard
- [ ] Set up error monitoring (Sentry)
- [ ] Enable HTTPS (Vercel default)
- [ ] Configure custom domain

---

## 🤝 Contributing

1. Clone repository
2. Create feature branch: `git checkout -b feature/feature-name`
3. Make changes and test locally
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature/feature-name`
6. Create Pull Request

---

## 📞 Support

For issues or questions:
- Check GitHub Issues
- Review error logs in Vercel dashboard
- Check console logs (browser dev tools)

---

**Last Updated**: 2026-06-29  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
