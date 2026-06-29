// src/pages/Generate.jsx — Main report generation page
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRecommendation, getTemplates } from '../api/client';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['Home Furniture', 'Office Furniture', 'Custom Furniture', 'Export-Grade Furniture'];

const MARKETS = [
  'United States', 'United Kingdom', 'Germany', 'United Arab Emirates', 'Australia',
  'Canada', 'France', 'Japan', 'Singapore', 'Saudi Arabia', 'Netherlands', 'Italy',
  'Sweden', 'Norway', 'Denmark', 'South Korea', 'China', 'New Zealand', 'South Africa', 'Brazil'
];

const PRESET_EMOJIS = ['🍽️', '💺', '🛏️', '🎨', '👑'];

const FIELD_LIMITS = {
  adminName: 100,
  productCategory: 100,
  productDescription: 2000,
  targetMarket: 100,
  businessGoals: 1000,
  specialRequirements: 500,
  notes: 500,
};

const initialForm = {
  adminName: '', productCategory: '', productDescription: '',
  targetMarket: '', businessGoals: '', specialRequirements: '', notes: ''
};

export default function Generate() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Apply preset passed from Templates page via navigation state
  useEffect(() => {
    if (location.state?.preset) {
      const pd = location.state.preset;
      setForm({
        adminName: pd.adminName || '',
        productCategory: pd.productCategory || '',
        productDescription: pd.productDescription || '',
        targetMarket: pd.targetMarket || '',
        businessGoals: pd.businessGoals || '',
        specialRequirements: pd.specialRequirements || '',
        notes: pd.notes || '',
      });
      toast('Template loaded! Review and customize before generating.', 'success');
    }
  }, []);

  useEffect(() => {
    getTemplates().then(r => setTemplates(r.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const applyPreset = (template) => {
    const pd = template.preset_data || {};
    setForm({
      adminName: pd.adminName || '',
      productCategory: pd.productCategory || '',
      productDescription: pd.productDescription || '',
      targetMarket: pd.targetMarket || '',
      businessGoals: pd.businessGoals || '',
      specialRequirements: pd.specialRequirements || '',
      notes: pd.notes || '',
    });
    setSelectedPreset(template.id);
    setErrors({});
    toast('Preset applied! Review and customize if needed.', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    const e = {};
    if (!form.adminName?.trim() || form.adminName.trim().length < 2) e.adminName = 'Admin name must be at least 2 characters.';
    if (!form.productCategory?.trim()) e.productCategory = 'Please select a product category.';
    if (!form.productDescription?.trim() || form.productDescription.trim().length < 20) e.productDescription = 'Describe the product in at least 20 characters.';
    if (!form.targetMarket?.trim()) e.targetMarket = 'Please select or enter a target market.';
    if (!form.businessGoals?.trim() || form.businessGoals.trim().length < 10) e.businessGoals = 'Business goals must be at least 10 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast('Please fix the form errors before generating.', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await generateRecommendation(form);
      toast('Report generated successfully!', 'success');
      navigate('/output', { state: result.data });
    } catch (err) {
      toast(err.message || 'Generation failed. Please try again.', 'error');
      setErrors({ _general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSelectedPreset(null);
    toast('Form cleared.', 'info');
  };

  const charCount = (field) => form[field]?.length || 0;
  const limit = (field) => FIELD_LIMITS[field];

  const CharCounter = ({ field }) => {
    const count = charCount(field);
    const max = limit(field);
    const cls = count > max ? 'over' : count > max * 0.8 ? 'warning' : '';
    return <span className={`char-count ${cls}`}>{count}/{max}</span>;
  };

  return (
    <div className="page-wrapper fade-in">
      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <div className="loading-title">🤖 Generating Report...</div>
            <div className="loading-subtitle">
              Our AI consultant is analyzing your product and target market. This may take up to 30 seconds.
            </div>
            <div className="progress-dots">
              <div className="progress-dot" />
              <div className="progress-dot" />
              <div className="progress-dot" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-badge">✨ AI Engine</div>
        <h1 className="page-title">Generate Market Report</h1>
        <p className="page-subtitle">Fill in your product and market details to generate a comprehensive export positioning strategy</p>
      </div>

      {/* Template Presets */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          🎯 Quick Start Presets
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>Click to auto-fill the form</span>
        </h3>
        <div className="presets-grid">
          {templates.map((t, i) => (
            <button key={t.id} className={`preset-card ${selectedPreset === t.id ? 'selected' : ''}`} onClick={() => applyPreset(t)}>
              <div className="preset-emoji">{PRESET_EMOJIS[i % PRESET_EMOJIS.length]}</div>
              <div className="preset-name">{t.template_name}</div>
              <div className="preset-market">🌍 {t.market}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
            📝 Report Details
          </h3>

          {errors._general && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: 13, marginBottom: 20 }}>
              ❌ {errors._general}
            </div>
          )}

          <div className="form-grid-2">
            {/* Admin Name */}
            <div className="form-group">
              <div className="form-label">
                Admin Name <span>*</span>
                <CharCounter field="adminName" />
              </div>
              <input
                type="text" name="adminName" className={`form-input ${errors.adminName ? 'error' : ''}`}
                placeholder="Enter your full name"
                value={form.adminName} onChange={handleChange} maxLength={100}
              />
              {errors.adminName && <div className="form-error">⚠ {errors.adminName}</div>}
            </div>

            {/* Product Category */}
            <div className="form-group">
              <div className="form-label">
                Product Category <span>*</span>
              </div>
              <select name="productCategory" className={`form-select ${errors.productCategory ? 'error' : ''}`}
                value={form.productCategory} onChange={handleChange}>
                <option value="">— Select a category —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.productCategory && <div className="form-error">⚠ {errors.productCategory}</div>}
            </div>
          </div>

          {/* Product Description */}
          <div className="form-group">
            <div className="form-label">
              Product Description <span>*</span>
              <CharCounter field="productDescription" />
            </div>
            <textarea
              name="productDescription" rows={4}
              className={`form-textarea ${errors.productDescription ? 'error' : ''}`}
              placeholder="Describe your furniture product in detail: materials, dimensions, design style, craftsmanship, target audience, unique features..."
              value={form.productDescription} onChange={handleChange} maxLength={2000}
            />
            {errors.productDescription && <div className="form-error">⚠ {errors.productDescription}</div>}
          </div>

          <div className="form-grid-2">
            {/* Target Market */}
            <div className="form-group">
              <div className="form-label">
                Target Export Market <span>*</span>
              </div>
              <select name="targetMarket" className={`form-select ${errors.targetMarket ? 'error' : ''}`}
                value={form.targetMarket} onChange={handleChange}>
                <option value="">— Select target country —</option>
                {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.targetMarket && <div className="form-error">⚠ {errors.targetMarket}</div>}
            </div>

            {/* Business Goals */}
            <div className="form-group">
              <div className="form-label">
                Business Goals <span>*</span>
                <CharCounter field="businessGoals" />
              </div>
              <textarea
                name="businessGoals" rows={3}
                className={`form-textarea ${errors.businessGoals ? 'error' : ''}`}
                placeholder="What are your export targets? Revenue goals, market share, brand positioning..."
                value={form.businessGoals} onChange={handleChange} maxLength={1000}
              />
              {errors.businessGoals && <div className="form-error">⚠ {errors.businessGoals}</div>}
            </div>
          </div>

          <div className="form-grid-2">
            {/* Special Requirements */}
            <div className="form-group">
              <div className="form-label">
                Special Requirements
                <CharCounter field="specialRequirements" />
              </div>
              <textarea
                name="specialRequirements" rows={3}
                className="form-textarea"
                placeholder="Certifications needed, regulatory requirements, packaging constraints..."
                value={form.specialRequirements} onChange={handleChange} maxLength={500}
              />
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <div className="form-label">
                Additional Notes
                <CharCounter field="notes" />
              </div>
              <textarea
                name="notes" rows={3}
                className="form-textarea"
                placeholder="Any other context, competitor mentions, budget notes, timeline..."
                value={form.notes} onChange={handleChange} maxLength={500}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Generating...' : '✨ Generate Report'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>
              🔄 Reset Form
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
