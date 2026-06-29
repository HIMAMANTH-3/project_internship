// src/pages/Output.jsx — AI Output display page
import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { submitFeedback } from '../api/client';
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

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          className={`star-btn ${i <= (hover || value) ? 'active' : ''}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          title={`${i} star${i > 1 ? 's' : ''}`}
        >
          {i <= (hover || value) ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

export default function Output() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const data = location.state;

  const [thumbs, setThumbs] = useState(null);
  const [starRating, setStarRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  if (!data || !data.aiResponse) {
    return (
      <div className="page-wrapper fade-in">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No Report Found</div>
          <div className="empty-body">Please generate a new report from the Generate page.</div>
          <Link to="/generate" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
            ✨ Generate Report
          </Link>
        </div>
      </div>
    );
  }

  const { aiResponse, inputs, id, responseTime, promptVersion, createdAt } = data;

  const buildFullText = () => {
    let text = `AI EXPORT MARKET POSITIONING REPORT\n`;
    text += `Sri Venkata Sai Furniture Works\n`;
    text += `${'='.repeat(60)}\n\n`;
    text += `Generated: ${new Date(createdAt).toLocaleString()}\n`;
    text += `Admin: ${inputs?.adminName}\n`;
    text += `Product Category: ${inputs?.productCategory}\n`;
    text += `Target Market: ${inputs?.targetMarket}\n`;
    text += `Response Time: ${responseTime}ms | Prompt Version: ${promptVersion}\n\n`;
    text += `${'='.repeat(60)}\n\n`;
    SECTIONS.forEach(s => {
      text += `${s.icon} ${s.title.toUpperCase()}\n`;
      text += `${'-'.repeat(40)}\n`;
      text += `${aiResponse[s.key] || 'N/A'}\n\n`;
    });
    text += `✅ EXPORT READINESS CHECKLIST\n`;
    text += `${'-'.repeat(40)}\n`;
    if (Array.isArray(aiResponse.exportReadinessChecklist)) {
      aiResponse.exportReadinessChecklist.forEach((item, i) => {
        text += `${i + 1}. ☐ ${item}\n`;
      });
    }
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildFullText())
      .then(() => toast('Report copied to clipboard!', 'success'))
      .catch(() => toast('Copy failed — please select and copy manually.', 'error'));
  };

  const handleDownloadTXT = () => {
    const blob = new Blob([buildFullText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-report-${inputs?.targetMarket}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('TXT file downloaded!', 'success');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    const addText = (text, size = 10, bold = false, color = [15, 23, 42]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidth);
      if (y + lines.length * (size * 0.5) > 275) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.52) + 2;
    };

    const addSection = (title, content, icon) => {
      y += 4;
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(margin - 2, y - 5, maxWidth + 4, 10, 2, 2, 'F');
      addText(`${icon} ${title}`, 12, true, [79, 70, 229]);
      y += 2;
      addText(typeof content === 'string' ? content : content.join('\n'), 9.5, false, [71, 85, 105]);
      y += 3;
    };

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('AI Export Market Positioning Report', margin, 13);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Sri Venkata Sai Furniture Works', margin, 21);

    y = 36;
    addText(`Generated: ${new Date(createdAt).toLocaleString()}`, 9, false, [100, 116, 139]);
    addText(`Admin: ${inputs?.adminName}  |  Category: ${inputs?.productCategory}  |  Market: ${inputs?.targetMarket}`, 9, false, [100, 116, 139]);
    y += 6;

    SECTIONS.forEach(s => {
      const content = aiResponse[s.key];
      if (content) addSection(s.title, content, s.icon);
    });

    y += 4;
    addSection('Export Readiness Checklist', '✅ EXPORT READINESS CHECKLIST', '✅');
    if (Array.isArray(aiResponse.exportReadinessChecklist)) {
      aiResponse.exportReadinessChecklist.forEach((item, i) => {
        addText(`${i + 1}. ☐ ${item}`, 9.5);
      });
    }

    doc.save(`export-report-${inputs?.targetMarket}-${Date.now()}.pdf`);
    toast('PDF downloaded!', 'success');
  };

  const handleFeedbackSubmit = async () => {
    if (!starRating && thumbs === null && !comment.trim()) {
      toast('Please provide at least a rating or a comment.', 'warning');
      return;
    }
    setFeedbackLoading(true);
    try {
      await submitFeedback({
        generationId: id,
        rating: starRating || undefined,
        comment: comment.trim() || undefined,
        isThumbsUp: thumbs,
      });
      setFeedbackSent(true);
      toast('Thank you for your feedback!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to submit feedback.', 'error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-badge">📄 AI Report</div>
        <div className="page-header-top">
          <h1 className="page-title">Export Positioning Report</h1>
          <span className="badge badge-emerald">✓ Generated</span>
        </div>
        <p className="page-subtitle">
          <strong style={{ color: 'var(--text-primary)' }}>{inputs?.productCategory}</strong> → {' '}
          <strong style={{ color: 'var(--brand-accent)' }}>{inputs?.targetMarket}</strong> &nbsp;|&nbsp;
          Admin: {inputs?.adminName} &nbsp;|&nbsp;
          Response: {responseTime}ms
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="action-toolbar">
        <button className="btn btn-primary" onClick={handleDownloadPDF}>📥 Download PDF</button>
        <button className="btn btn-secondary" onClick={handleDownloadTXT}>📄 Download TXT</button>
        <button className="btn btn-ghost" onClick={handleCopy}>📋 Copy to Clipboard</button>
        <Link to="/generate" className="btn btn-ghost">✨ Generate Another</Link>
      </div>

      {/* Output Sections */}
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

      {/* Export Readiness Checklist */}
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

      {/* Feedback Section */}
      <div className="feedback-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>💬 Rate This Report</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Your feedback helps us improve AI quality scores.</p>

        {feedbackSent ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--success)', fontSize: 15, fontWeight: 600 }}>
            ✅ Thank you! Your feedback has been recorded.
          </div>
        ) : (
          <>
            {/* Thumbs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
              <button
                className={`thumb-btn ${thumbs === true ? 'active-up' : ''}`}
                onClick={() => setThumbs(thumbs === true ? null : true)}
              >👍</button>
              <button
                className={`thumb-btn ${thumbs === false ? 'active-down' : ''}`}
                onClick={() => setThumbs(thumbs === false ? null : false)}
              >👎</button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Was this report useful?</span>
            </div>

            {/* Stars */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Quality Rating</div>
              <StarRating value={starRating} onChange={setStarRating} />
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 14 }}>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Any comments about the quality, relevance, or actionability of this report..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={1000}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleFeedbackSubmit}
              disabled={feedbackLoading}
            >
              {feedbackLoading ? '⏳ Submitting...' : '📤 Submit Feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
