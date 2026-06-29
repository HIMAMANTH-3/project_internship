// src/pages/History.jsx — Generation history page
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHistory, deleteHistoryItem } from '../api/client';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['All', 'Home Furniture', 'Office Furniture', 'Custom Furniture', 'Export-Grade Furniture'];
const MARKETS = ['All', 'United States', 'United Kingdom', 'Germany', 'United Arab Emirates', 'Australia',
  'Canada', 'France', 'Japan', 'Singapore', 'Saudi Arabia'];

function StarDisplay({ rating }) {
  if (!rating) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Not rated</span>;
  return (
    <span style={{ color: 'var(--brand-gold)', fontSize: 13 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function History() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    getHistory({
      search: search || undefined,
      market: market && market !== 'All' ? market : undefined,
      category: category && category !== 'All' ? category : undefined,
      limit: LIMIT,
      offset: page * LIMIT,
    })
      .then(r => { setRecords(r.data || []); setTotal(r.total || 0); })
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [search, market, category, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(0); };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      toast('Record deleted.', 'success');
      setDeleteId(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Admin', 'Category', 'Market', 'Rating', 'Response Time (ms)', 'Created At'];
    const rows = records.map(r => [r.id, r.admin_name, r.product_category, r.target_market, r.rating || '', r.response_time_ms, r.created_at]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `export-history-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast('History exported as CSV!', 'success');
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page-wrapper fade-in">
      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>🗑️ Delete Record</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Are you sure you want to permanently delete this generation record? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-badge">📋 History</div>
        <div className="page-header-top">
          <h1 className="page-title">Generation History</h1>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>📥 Export CSV</button>
        </div>
        <p className="page-subtitle">Browse all AI-generated export positioning reports · {total} total records</p>
      </div>

      {/* Search & Filters */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search by admin, category, market..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <select className="form-select" style={{ width: 180 }} value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>
          {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
        </select>
        <select className="form-select" style={{ width: 200 }} value={market} onChange={e => { setMarket(e.target.value); setPage(0); }}>
          {MARKETS.map(m => <option key={m} value={m === 'All' ? '' : m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading records...</div>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No records found</div>
            <div className="empty-body">
              {search || market || category ? 'Try adjusting your search filters.' : 'Generate your first report to see history here.'}
            </div>
            <Link to="/generate" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              ✨ Generate Report
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin / Category</th>
                <th>Target Market</th>
                <th>Rating</th>
                <th>Response Time</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{r.admin_name}</div>
                    <span className="badge badge-purple" style={{ marginTop: 4 }}>{r.product_category}</span>
                  </td>
                  <td>
                    <span className="badge badge-cyan">🌍 {r.target_market}</span>
                  </td>
                  <td><StarDisplay rating={r.rating} /></td>
                  <td>
                    <span style={{ color: r.response_time_ms < 5000 ? 'var(--success)' : 'var(--warning)', fontSize: 12, fontWeight: 600 }}>
                      {(r.response_time_ms / 1000).toFixed(1)}s
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(r.created_at).toLocaleDateString()}<br />
                    <span style={{ fontSize: 11 }}>{new Date(r.created_at).toLocaleTimeString()}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/history/${r.id}`} className="btn btn-ghost btn-sm">View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: '6px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
