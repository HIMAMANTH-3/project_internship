// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAnalytics } from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(10px)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
            {p.value} {p.name === 'count' ? 'generations' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Generations', value: data?.totalGenerations ?? 0, icon: '✨', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Average Quality Rating', value: data?.avgRating > 0 ? `${data.avgRating} ★` : 'N/A', icon: '⭐', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Target Markets Used', value: data?.topMarkets?.length ?? 0, icon: '🌍', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Product Categories', value: data?.topCategories?.length ?? 0, icon: '🪑', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-badge">📊 Command Center</div>
        <h1 className="page-title">Export Advisor Dashboard</h1>
        <p className="page-subtitle">Real-time overview of AI-powered export market recommendations for Sri Venkata Sai Furniture Works</p>
      </div>

      {/* Quick Action */}
      <div style={{ marginBottom: 28 }}>
        <Link to="/generate" className="btn btn-primary btn-lg glow-pulse">
          ✨ Generate New Report
        </Link>
        <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          AI-powered market positioning in seconds
        </span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        {/* Daily Trend */}
        <div className="chart-card">
          <div className="chart-title">Daily Generation Trend</div>
          <div className="chart-subtitle">Number of AI reports generated per day</div>
          {!loading && data?.dailyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">📈</div>
              <div className="empty-title">No data yet</div>
              <div className="empty-body">Generate your first report to see trends appear here.</div>
            </div>
          )}
        </div>

        {/* Top Markets Pie */}
        <div className="chart-card">
          <div className="chart-title">Top Target Markets</div>
          <div className="chart-subtitle">Distribution of export market targets</div>
          {!loading && data?.topMarkets?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.topMarkets} dataKey="count" nameKey="market" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {data.topMarkets.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: 8, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 8 }}>
                {data.topMarkets.slice(0, 5).map((m, i) => (
                  <span key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                    {m.market}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-icon">🌍</div>
              <div className="empty-body">Market data will appear after generating reports.</div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        {/* Category Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">Reports by Product Category</div>
          <div className="chart-subtitle">Breakdown of generation requests by furniture category</div>
          {!loading && data?.topCategories?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">🪑</div>
              <div className="empty-body">Category data will appear after generating reports.</div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="chart-card">
          <div className="chart-title">Recent Activity</div>
          <div className="chart-subtitle">Latest AI-generated reports</div>
          {!loading && data?.recentActivity?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {data.recentActivity.map((item, i) => (
                <Link to={`/history/${item.id}`} key={item.id} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 10, border: '1px solid var(--border-subtle)', transition: 'var(--transition)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-brand)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.product_category}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>→ {item.target_market}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {item.rating && <div style={{ fontSize: 12, color: 'var(--brand-gold)' }}>{'★'.repeat(item.rating)}</div>}
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-icon">📋</div>
              <div className="empty-body">Recent activity will appear here once you start generating reports.</div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px 20px', color: '#ef4444', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
