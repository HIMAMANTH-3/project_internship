// src/App.jsx — Main app routing with authentication and role-based access
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Output from './pages/Output';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import Analytics from './pages/Analytics';
import Templates from './pages/Templates';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return null;
}

/** Layout wrapper — only shown when logged in */
function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-layout">
      {/* Mobile hamburger button */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ScrollToTop />
        <Routes>
          {/* ── Public route ────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── Protected routes (any authenticated user) ── */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/generate" element={
            <ProtectedRoute>
              <AppLayout><Generate /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/output" element={
            <ProtectedRoute>
              <AppLayout><Output /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <AppLayout><History /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/history/:id" element={
            <ProtectedRoute>
              <AppLayout><HistoryDetail /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute>
              <AppLayout><Templates /></AppLayout>
            </ProtectedRoute>
          } />

          {/* ── Admin-only routes ────────────────────── */}
          <Route path="/analytics" element={
            <AdminRoute>
              <AppLayout><Analytics /></AppLayout>
            </AdminRoute>
          } />

          {/* ── 404 ─────────────────────────────────── */}
          <Route path="*" element={
            <ProtectedRoute>
              <AppLayout>
                <div className="page-wrapper fade-in" style={{ textAlign: 'center', paddingTop: 80 }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🪑</div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>404 — Page Not Found</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This page doesn't exist.</p>
                  <a href="/" className="btn btn-primary">← Go to Dashboard</a>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
