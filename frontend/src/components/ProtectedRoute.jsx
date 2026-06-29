// src/components/ProtectedRoute.jsx — Route guards for auth and admin roles
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Shows a spinner while session is being restored */
function AuthLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-primary)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Restoring session…</p>
      </div>
    </div>
  );
}

/** Requires any authenticated user */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

/** Requires admin role — regular users get redirected to dashboard */
export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
