// src/pages/Templates.jsx — Template preset manager
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, createTemplate } from '../api/client';
import { useToast } from '../context/ToastContext';

const PRESET_EMOJIS = ['🍽️', '💺', '🛏️', '🎨', '👑', '🪵', '🛋️', '🏠'];
const CATEGORIES = ['Home Furniture', 'Office Furniture', 'Custom Furniture', 'Export-Grade Furniture'];
const MARKETS = [
  'United States', 'United Kingdom', 'Germany', 'United Arab Emirates', 'Australia',
  'Canada', 'France', 'Japan', 'Singapore', 'Saudi Arabia', 'Netherlands', 'Italy'
];

const emptyTemplate = {
  templateName: '', category: '', market: '',
  presetData: {
    adminName: '', productCategory: '', productDescription: '',
    targetMarket: '', businessGoals: '', specialRequirements: '', notes: ''
  }
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyTemplate);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getTemplates()
      .then(r => setTemplates(r.data || []))
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUse = (template) => {
    navigate('/generate', { state: { preset: template.preset_data } });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.templateName || !form.category || !form.market) {
      toast('Template name, category, and market are required.', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      presetData: {
        ...form.presetData,
        productCategory: form.category,
        targetMarket: form.market,
      }
    };
    try {
      await createTemplate(payload);
      toast('Template created!', 'success');
      setShowCreate(false);
      setForm(emptyTemplate);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>🎯 Create New Template</h3>
            <form onSubmit={handleCreate}>
              <div className="form-grid-2">
                <div className="form-group">
                  <div className="form-label">Template Name <span style={{ color: 'var(--error)' }}>*</span></div>
                  <input type="text" className="form-input" placeholder="e.g. Teak Tables → Japan"
                    value={form.templateName}
                    onChange={e => setForm(f => ({ ...f, templateName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <div className="form-label">Category <span style={{ color: 'var(--error)' }}>*</span></div>
                  <select className="form-select" value={form.category}
                    onChange={e => setForm(f => ({
                      ...f, category: e.target.value,
                      presetData: { ...f.presetData, productCategory: e.target.value }
                    }))}>
                    <option value="">— Select —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Target Market <span style={{ color: 'var(--error)' }}>*</span></div>
                <select className="form-select" value={form.market}
                  onChange={e => setForm(f => ({
                    ...f, market: e.target.value,
                    presetData: { ...f.presetData, targetMarket: e.target.value }
                  }))}>
                  <option value="">— Select —</option>
                  {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <div className="form-label">Product Description</div>
                <textarea rows={3} className="form-textarea" placeholder="Describe the product for this preset..."
                  value={form.presetData.productDescription}
                  onChange={e => setForm(f => ({ ...f, presetData: { ...f.presetData, productDescription: e.target.value } }))} />
              </div>
              <div className="form-group">
                <div className="form-label">Business Goals</div>
                <textarea rows={2} className="form-textarea" placeholder="Default business goals for this template..."
                  value={form.presetData.businessGoals}
                  onChange={e => setForm(f => ({ ...f, presetData: { ...f.presetData, businessGoals: e.target.value } }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '✅ Create Template'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-badge">🎯 Presets</div>
        <div className="page-header-top">
          <h1 className="page-title">Presets & Templates</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Create Template</button>
        </div>
        <p className="page-subtitle">One-click auto-fill templates for common furniture export scenarios</p>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text-muted)' }}>Loading templates...</div>
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <div className="empty-title">No templates yet</div>
          <div className="empty-body">Create your first template to enable quick-start generation.</div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: 16 }}>+ Create Template</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {templates.map((t, i) => (
            <div key={t.id} className="card card-gradient" style={{ cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{PRESET_EMOJIS[i % PRESET_EMOJIS.length]}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{t.template_name}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-purple">{t.category}</span>
                <span className="badge badge-cyan">🌍 {t.market}</span>
              </div>
              {t.preset_data?.productDescription && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {t.preset_data.productDescription}
                </p>
              )}
              <button className="btn btn-primary btn-full btn-sm" onClick={() => navigate('/generate', { state: { preset: t.preset_data } })}>
                ✨ Use This Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
