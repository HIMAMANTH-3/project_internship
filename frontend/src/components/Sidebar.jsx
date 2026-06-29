// src/components/Sidebar.jsx — Navigation sidebar with role-based items + logout
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', section: 'main', adminOnly: false },
  { path: '/generate', label: 'Generate Report', icon: '✨', section: 'main', adminOnly: false },
  { path: '/history', label: 'History', icon: '📋', section: 'main', adminOnly: false },
  { path: '/templates', label: 'Presets & Templates', icon: '🎯', section: 'main', adminOnly: false },
  { path: '/analytics', label: 'Analytics', icon: '📈', section: 'insights', adminOnly: true },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  // Filter nav items by role
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);
  const mainItems = visibleItems.filter(n => n.section === 'main');
  const insightItems = visibleItems.filter(n => n.section === 'insights');

  return (
    <>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">🪑</div>
          <div className="logo-title">AI Export Advisor</div>
          <div className="logo-subtitle">Sri Venkata Sai Furniture Works</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {mainItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {insightItems.length > 0 && (
            <>
              <div className="nav-section-label" style={{ marginTop: '8px' }}>Insights</div>
              {insightItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer — user info + logout */}
        <div className="sidebar-footer">
          {/* AI Engine badge */}
          <div className="sidebar-badge" style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '2px' }}>🤖 AI Engine Ready</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>Gemini 1.5 Flash / GPT-4o</div>
          </div>

          {/* User info */}
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {isAdmin ? '👑' : '👤'}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.username}</div>
                <div className="sidebar-user-role">
                  <span className={`sidebar-role-chip ${user.role}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
