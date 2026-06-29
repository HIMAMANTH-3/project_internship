// src/pages/HistoryDetail.jsx — Individual generation detail view
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHistoryItem } from '../api/client';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';

const SECTIONS = [
  { key: 'marketPositioning', title: 'Market Positioning', icon: '🎯', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { key: 'packagingAdaptations', title: 'Packaging Adaptations', icon: '📦', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { key: 'pricingConsiderations', title: 'Pricing Considerations', icon: '💰', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'marketEntryStrategy', title: 'Market Entry Strategy', icon: '🚀', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { key: 'competitiveAdvantages', title: 'Competitive Advantages', icon: '⚡', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'risks', title: 'Risk Factors & Mitigation', icon: '⚠️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
];

export default function HistoryDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    getHistoryItem(id)
      .then(r => setData(r.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper fade-in" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading report...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <div className="empty-title">Report Not Found</div>
          <div className="empty-body">{error || 'This report may have been deleted.'}</div>
          <Link to="/history" className="btn btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>← Back to History</Link>
        </div>
      </div>
    );
  }

  const aiResponse = typeof data.ai_response === 'string' ? JSON.parse(data.ai_response) : data.ai_response;

  const handleCopy = () => {
    let text = `Export Market Report — ${data.product_category} → ${data.target_market}\n\n`;
    SECTIONS.forEach(s => { text += `${s.title}\n${'-'.repeat(30)}\n${aiResponse[s.key] || ''}\n\n`; });
    navigator.clipboard.writeText(text)
      .then(() => toast('Copied to clipboard!', 'success'))
      .catch(() => toast('Copy failed.', 'error'));
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <Link to="/history" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12, textDecoration: 'none' }}>
          ← Back to History
        </Link>
        <div className="page-badge">📄 Report Detail</div>
        <div className="page-header-top">
          <h1 className="page-title">{data.product_category} → {data.target_market}</h1>
        </div>
        <p className="page-subtitle">
          Admin: <strong>{data.admin_name}</strong> · 
          {new Date(data.created_at).toLocaleString()} · 
          Response: {data.response_time_ms}ms
          {data.rating && ` · Rating: ${'★'.repeat(data.rating)}`}
        </p>
      </div>

      <div className="action-toolbar">
        <button className="btn btn-ghost btn-sm" onClick={handleCopy}>📋 Copy</button>
      </div>

      {/* Input Summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>📝 Input Parameters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {[
            ['Product Category', data.product_category],
            ['Target Market', data.target_market],
            ['Business Goals', data.business_goals],
            ['Special Requirements', data.special_requirements || 'None'],
            ['Additional Notes', data.notes || 'None'],
            ['Prompt Version', data.prompt_version],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
        {data.product_description && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Product Description</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.product_description}</div>
          </div>
        )}
      </div>

      {/* AI Sections */}
      <div className="output-grid">
        {SECTIONS.map(s => (
          <div key={s.key} className="output-section">
            <div className="output-section-header">
              <div className="output-section-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="output-section-title">{s.title}</div>
            </div>
            <div className="output-section-body">
              {aiResponse[s.key] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No data available.</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="output-section" style={{ marginBottom: 24 }}>
        <div className="output-section-header">
          <div className="output-section-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>✅</div>
          <div className="output-section-title">Export Readiness Checklist</div>
        </div>
        {Array.isArray(aiResponse.exportReadinessChecklist) ? (
          aiResponse.exportReadinessChecklist.map((item, i) => (
            <div key={i} className="checklist-item">
              <span className="check-icon">☐</span>
              <span>{item}</span>
            </div>
          ))
        ) : (
          <div className="output-section-body">{aiResponse.exportReadinessChecklist}</div>
        )}
      </div>

      {/* Feedback history */}
      {data.feedback && data.feedback.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>💬 Feedback ({data.feedback.length})</h3>
          {data.feedback.map(f => (
            <div key={f.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                {f.is_thumbs_up !== null && <span>{f.is_thumbs_up ? '👍' : '👎'}</span>}
                {f.rating && <span style={{ color: 'var(--brand-gold)' }}>{'★'.repeat(f.rating)}</span>}
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(f.created_at).toLocaleString()}</span>
              </div>
              {f.comment && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.comment}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
