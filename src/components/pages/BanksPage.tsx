'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { Bank, BankStatus } from '@/types';
import { Plus, Download, X, CheckCircle, Building2 } from 'lucide-react';

function BankModal({ onClose, onSave, bank }: { onClose: () => void; onSave: (b: Partial<Bank>) => void; bank?: Bank | null }) {
  const [form, setForm] = useState({
    name: bank?.name ?? '',
    shortName: bank?.shortName ?? '',
    templateFormat: bank?.templateFormat ?? '',
    contactPerson: bank?.contactPerson ?? '',
    contactEmail: bank?.contactEmail ?? '',
    status: (bank?.status ?? 'ACTIVE') as BankStatus,
    branches: bank?.branches ?? [],
  });
  const [newBranch, setNewBranch] = useState('');
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleAddBranch = () => {
    if (!newBranch.trim()) return;
    if (form.branches.includes(newBranch.trim())) {
      alert('Branch already exists!');
      return;
    }
    set('branches', [...form.branches, newBranch.trim()]);
    setNewBranch('');
  };

  const handleRemoveBranch = (br: string) => {
    set('branches', form.branches.filter(b => b !== br));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{bank ? 'Edit Bank' : 'Add Bank'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Bank Full Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="State Bank of India" required />
              </div>
              <div className="form-group">
                <label className="form-label">Short Name / Code</label>
                <input type="text" className="form-input" value={form.shortName} onChange={e => set('shortName', e.target.value)} placeholder="SBI" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Template Format</label>
              <input type="text" className="form-input" value={form.templateFormat} onChange={e => set('templateFormat', e.target.value)} placeholder="e.g. SBI-Standard-V2" />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input type="text" className="form-input" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input type="email" className="form-input" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bank Branches</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Raipur Main Branch" 
                  value={newBranch} 
                  onChange={e => setNewBranch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBranch();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddBranch}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Add Branch
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 100, overflowY: 'auto', padding: '2px 0' }}>
                {form.branches.map((br) => (
                  <span 
                    key={br} 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      background: 'rgba(255, 255, 255, 0.04)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 16, 
                      padding: '4px 10px', 
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {br}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveBranch(br)}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: 'var(--accent-rose)', 
                        padding: 0,
                        fontSize: 14,
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {form.branches.length === 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No branches registered yet.</span>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><CheckCircle size={14} />{bank ? 'Update Bank' : 'Add Bank'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BanksPage() {
  const { refreshKey } = useApp();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editBank, setEditBank] = useState<Bank | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => setBanks(LocalDbService.getBanks());
  useEffect(load, [refreshKey]);

  const filtered = banks.filter(b => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return b.name.toLowerCase().includes(s) || b.shortName.toLowerCase().includes(s);
    }
    return true;
  });

  const handleSave = (data: Partial<Bank>) => {
    if (editBank) {
      LocalDbService.updateBank({ ...editBank, ...data });
    } else {
      LocalDbService.addBank({
        ...(data as any),
        id: `bnk_${Date.now()}`,
        casesThisYear: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
    load();
    setShowModal(false); setEditBank(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this bank from registry?')) return;
    LocalDbService.deleteBank(id);
    load();
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bank Registry</h1>
          <p className="page-subtitle">Manage financial institutions and their valuation report formats</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => ExportService.exportBanks(filtered)}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { setEditBank(null); setShowModal(true); }}>
            <Plus size={14} /> Add Bank
          </button>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0 }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { label: 'Total Banks', value: banks.length, color: 'var(--accent-indigo-light)' },
            { label: 'Active Banks', value: banks.filter(b => b.status === 'ACTIVE').length, color: 'var(--accent-emerald)' },
            { label: 'Total Cases YTD', value: banks.reduce((s, b) => s + b.casesThisYear, 0), color: 'var(--accent-amber)' },
            { label: 'Total Revenue', value: fmt(banks.reduce((s, b) => s + b.totalRevenue, 0)), color: 'var(--accent-rose)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Outfit', color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="table-container">
          <div className="table-header">
            <div className="filter-bar">
              <input type="text" className="filter-input" placeholder="🔍 Search banks..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 200 }} />
              <select className="filter-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} banks</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <Building2 size={36} style={{ opacity: 0.4 }} />
              <span className="empty-title">No banks in registry</span>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bank Name</th>
                  <th>Code</th>
                  <th>Template Format</th>
                  <th>Contact Person</th>
                  <th>Contact Email</th>
                  <th>Cases YTD</th>
                  <th>Revenue YTD</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(99,102,241,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--accent-indigo-light)', flexShrink: 0 }}>
                          {b.shortName.slice(0,3)}
                        </span>
                        <div>
                          <div>{b.name}</div>
                          {b.branches && b.branches.length > 0 && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {b.branches.map(br => (
                                <span key={br} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '1px 5px', borderRadius: 4 }}>
                                  {br}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent-indigo-light)' }}>{b.shortName}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{b.templateFormat}</td>
                    <td>{b.contactPerson}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.contactEmail}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'Outfit' }}>{b.casesThisYear}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-emerald)', fontFamily: 'Outfit' }}>{fmt(b.totalRevenue)}</td>
                    <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditBank(b); setShowModal(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}><X size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <BankModal onClose={() => { setShowModal(false); setEditBank(null); }} onSave={handleSave} bank={editBank} />
      )}
    </>
  );
}
