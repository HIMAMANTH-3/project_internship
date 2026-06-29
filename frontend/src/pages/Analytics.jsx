// src/pages/Analytics.jsx — Admin analytics dashboard
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { getAnalytics, getQualityAnalytics } from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(10px)' }}>
        {label && <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [quality, setQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getQualityAnalytics()])
      .then(([a, q]) => { setAnalytics(a.data); setQuality(q.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Generations', value: analytics?.totalGenerations ?? 0, icon: '✨', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Average AI Rating', value: analytics?.avgRating > 0 ? `${analytics.avgRating}/5.0` : 'N/A', icon: '⭐', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Avg Response Time', value: quality?.responseTimeStats?.avg_ms ? `${(quality.responseTimeStats.avg_ms / 1000).toFixed(1)}s` : 'N/A', icon: '⚡', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Markets Targeted', value: analytics?.topMarkets?.length ?? 0, icon: '🌍', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  ];

  const thumbsUp = quality?.thumbsStats?.find(t => t.is_thumbs_up === 1 || t.is_thumbs_up === true)?.count || 0;
  const thumbsDown = quality?.thumbsStats?.find(t => t.is_thumbs_up === 0 || t.is_thumbs_up === false)?.count || 0;

  if (loading) {
    return (
      <div className="page-wrapper fade-in" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-badge">📈 Analytics</div>
        <h1 className="page-title">Admin Analytics Dashboard</h1>
        <p className="page-subtitle">Comprehensive insights into AI export advisor usage and quality metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Sentiment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>👍</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{thumbsUp}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Positive Feedback</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>👎</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--error)' }}>{thumbsDown}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Negative Feedback</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>📊</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-gold)' }}>
            {thumbsUp + thumbsDown > 0 ? `${Math.round(thumbsUp / (thumbsUp + thumbsDown) * 100)}%` : 'N/A'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Satisfaction Rate</div>
        </div>
      </div>

      {/* Row 1: Daily Trend + Rating Distribution */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-title">Daily Generation Trend</div>
          <div className="chart-subtitle">Reports generated per day (last 30 days)</div>
          {analytics?.dailyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={analytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Generations" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">📈</div>
              <div className="empty-body">No data yet. Generate reports to see trends.</div>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="chart-card">
          <div className="chart-title">Rating Distribution</div>
          <div className="chart-subtitle">Quality scores across all generated reports</div>
          {quality?.ratingDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={quality.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="rating" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${'★'.repeat(v)}`} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reports" radius={[4, 4, 0, 0]}>
                  {quality.ratingDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">⭐</div>
              <div className="empty-body">Rate reports to see quality distribution.</div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Category Bar + Market Pie + Monthly */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Category Bar */}
        <div className="chart-card">
          <div className="chart-title">Top Categories</div>
          <div className="chart-subtitle">Most-used product categories</div>
          {analytics?.topCategories?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reports" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">🪑</div>
              <div className="empty-body">No category data yet.</div>
            </div>
          )}
        </div>

        {/* Market Pie */}
        <div className="chart-card">
          <div className="chart-title">Market Distribution</div>
          <div className="chart-subtitle">Top target export markets</div>
          {analytics?.topMarkets?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={analytics.topMarkets.slice(0, 6)} dataKey="count" nameKey="market" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                    {analytics.topMarkets.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val + ' reports', name]} contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {analytics.topMarkets.slice(0, 4).map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{m.market}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{m.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">🌍</div>
              <div className="empty-body">No market data yet.</div>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="chart-card">
          <div className="chart-title">Monthly Volume</div>
          <div className="chart-subtitle">Reports generated per month</div>
          {analytics?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reports" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">📅</div>
              <div className="empty-body">No monthly data yet.</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Feedback */}
      {quality?.recentFeedback?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>💬 Recent Feedback</h3>
          {quality.recentFeedback.map((f, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < quality.recentFeedback.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                {f.is_thumbs_up !== null && <span>{f.is_thumbs_up ? '👍' : '👎'}</span>}
                {f.rating && <span style={{ color: 'var(--brand-gold)' }}>{'★'.repeat(f.rating)}</span>}
                <span className="badge badge-purple">{f.product_category}</span>
                <span className="badge badge-cyan">{f.target_market}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {new Date(f.created_at).toLocaleDateString()}
                </span>
              </div>
              {f.comment && <div style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 4 }}>"{f.comment}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
