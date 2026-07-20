'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { ValuationCase, ValuationStatus, Bank, PropertyType, User, TicketComment } from '@/types';
import { Plus, Download, X, ChevronRight, CheckCircle, Scale, MapPin } from 'lucide-react';
import CommentsSection from '@/components/common/CommentsSection';

const PIPELINE_STEPS: { status: ValuationStatus; label: string; short: string }[] = [
  { status: 'CASE_INITIATED', label: 'Case Initiated', short: 'Initiated' },
  { status: 'SITE_INSPECTED', label: 'Site Inspected', short: 'Inspected' },
  { status: 'DRAFT_READY', label: 'Draft Ready', short: 'Draft' },
  { status: 'DISPATCHED_TO_BANK', label: 'Dispatched to Bank', short: 'Dispatched' },
  { status: 'FEES_SETTLED', label: 'Fees Settled', short: 'Settled' },
];

const PIPELINE_ORDER: ValuationStatus[] = PIPELINE_STEPS.map(s => s.status);

const PROPERTY_TYPES: PropertyType[] = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use'];

const GEO_ZONES = [
  'Zone A - Urban Core', 'Zone B - Commercial', 'Zone C - Peripheral',
  'Zone D - Agricultural', 'Zone E - Industrial',
];

const STATUS_BADGE: Record<ValuationStatus, string> = {
  CASE_INITIATED: 'badge-initiated',
  SITE_INSPECTED: 'badge-inspected',
  DRAFT_READY: 'badge-draft',
  DISPATCHED_TO_BANK: 'badge-dispatched',
  FEES_SETTLED: 'badge-settled',
};

function getStepIndex(status: ValuationStatus): number {
  return PIPELINE_ORDER.indexOf(status);
}

function ValuationModal({
  onClose, onSave, valuation, banks, employees, currentUserId,
}: {
  onClose: () => void;
  onSave: (v: Partial<ValuationCase>) => void;
  valuation?: ValuationCase | null;
  banks: Bank[];
  employees: User[];
  currentUserId: string;
}) {
  const { currentUser, isAdmin } = useApp();
  const [comments, setComments] = useState<TicketComment[]>(valuation?.comments ?? []);
  const [form, setForm] = useState({
    bankId: valuation?.bankId ?? '',
    bankName: valuation?.bankName ?? '',
    branch: valuation?.branch ?? '',
    siteAddress: valuation?.siteAddress ?? '',
    propertyDetail: valuation?.propertyDetail ?? '',
    visitor: valuation?.visitor ?? '',
    geographicZone: valuation?.geographicZone ?? 'Zone A - Urban Core',
    landRatePerSqFt: valuation?.landRatePerSqFt ?? 0,
    builtUpAreaRate: valuation?.builtUpAreaRate ?? 0,
    builtUpArea: valuation?.builtUpArea ?? 0,
    depreciation: valuation?.depreciation ?? 0,
    finalAssessedValue: valuation?.finalAssessedValue ?? 0,
    propertyType: (valuation?.propertyType ?? 'Residential') as PropertyType,
    status: (valuation?.status ?? 'CASE_INITIATED') as ValuationStatus,
    assignedTo: valuation?.assignedTo ?? currentUserId,
    assignedToName: valuation?.assignedToName ?? '',
    fees: valuation?.fees ?? 0,
    cgst: valuation?.cgst ?? 0,
    sgst: valuation?.sgst ?? 0,
    totalAmount: valuation?.totalAmount ?? 0,
    feesSettled: valuation?.feesSettled ?? false,
    remarks: valuation?.remarks ?? '',
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const selectedBank = banks.find(b => b.id === form.bankId);
  const selectedBankBranches = selectedBank?.branches ?? [];

  // Auto-calculate final value
  useEffect(() => {
    const landValue = form.landRatePerSqFt * form.builtUpArea;
    const buildValue = form.builtUpAreaRate * form.builtUpArea;
    const depreciationAmt = buildValue * (form.depreciation / 100);
    const computed = landValue + buildValue - depreciationAmt;
    if (computed > 0) set('finalAssessedValue', Math.round(computed));
  }, [form.landRatePerSqFt, form.builtUpAreaRate, form.builtUpArea, form.depreciation]);

  const handleBankChange = (id: string) => {
    const bank = banks.find(b => b.id === id);
    set('bankId', id);
    set('bankName', bank?.shortName ?? '');
  };

  const handleEmployeeChange = (id: string) => {
    const emp = employees.find(e => e.id === id);
    set('assignedTo', id);
    set('assignedToName', emp?.name ?? '');
  };

  const handleAddComment = (content: string, attachment?: TicketComment['attachment']) => {
    if (!valuation) return;
    const newComment: TicketComment = {
      id: `vcmt_${Date.now()}`,
      authorId: currentUserId,
      authorName: currentUser?.name ?? 'Unknown',
      authorRole: currentUser?.role ?? 'EMPLOYEE',
      content,
      attachment,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    LocalDbService.updateValuation({
      ...valuation,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!valuation) return;
    if (!confirm('Delete this comment?')) return;
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    LocalDbService.updateValuation({
      ...valuation,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const renderPipeline = () => {
    const currentStepIdx = PIPELINE_ORDER.indexOf(form.status);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255, 255, 255, 0.02)', padding: '14px 20px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Valuation Stage Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 4, overflowX: 'auto' }}>
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            const labelColor = isActive ? 'var(--accent-indigo-light)' : isCompleted ? 'var(--accent-emerald)' : 'var(--text-muted)';
            const nodeBg = isActive ? 'rgba(99, 102, 241, 0.15)' : isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)';
            const nodeBorder = isActive ? '1px solid rgba(99, 102, 241, 0.3)' : isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)';

            return (
              <div key={step.status} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => {
                    set('status', step.status);
                    if (step.status === 'FEES_SETTLED') {
                      set('feesSettled', true);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: labelColor,
                    cursor: 'pointer',
                    borderRadius: 8,
                    background: nodeBg,
                    border: nodeBorder,
                    flex: 1,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{isCompleted ? '✓' : isActive ? '●' : `Step ${idx + 1}`}</span>
                  <span>{step.short}</span>
                </button>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 24,
                      height: 2,
                      background: idx < currentStepIdx ? 'var(--accent-emerald)' : 'var(--border)',
                      margin: '0 8px',
                      flexShrink: 0
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFormFields = () => (
    <>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>
        Bank & Case Info
      </div>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Bank</label>
          <select className="form-select" value={form.bankId} onChange={e => handleBankChange(e.target.value)} required>
            <option value="">Select bank...</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.shortName})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bank Branch</label>
          {selectedBankBranches.length > 0 ? (
            <select 
              className="form-select" 
              value={form.branch} 
              onChange={e => {
                if (e.target.value === '__CUSTOM__') {
                  const custom = prompt('Enter custom branch name:');
                  if (custom) {
                    set('branch', custom);
                  }
                } else {
                  set('branch', e.target.value);
                }
              }} 
              required
            >
              <option value="">Select branch...</option>
              {selectedBankBranches.map(br => <option key={br} value={br}>{br}</option>)}
              {form.branch && !selectedBankBranches.includes(form.branch) && (
                <option value={form.branch}>{form.branch}</option>
              )}
              <option value="__CUSTOM__">+ Enter custom branch...</option>
            </select>
          ) : (
            <input type="text" className="form-input" value={form.branch} onChange={e => set('branch', e.target.value)} placeholder="e.g. Raipur Main" required />
          )}
        </div>
      </div>
      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="form-label">Assigned To</label>
        <select className="form-select" value={form.assignedTo} onChange={e => handleEmployeeChange(e.target.value)}>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8, marginTop: 16 }}>
        Property Location & Description
      </div>
      <div className="form-group">
        <label className="form-label">Site Address</label>
        <input type="text" className="form-input" value={form.siteAddress} onChange={e => set('siteAddress', e.target.value)} placeholder="Complete property physical address" />
      </div>
      <div className="form-grid form-grid-2" style={{ marginTop: 12 }}>
        <div className="form-group">
          <label className="form-label">Property Detail</label>
          <input type="text" className="form-input" value={form.propertyDetail} onChange={e => set('propertyDetail', e.target.value)} placeholder="e.g. Patwari Halka No 12, Khasra 42/3, Area description" required />
        </div>
        <div className="form-group">
          <label className="form-label">Visitor</label>
          <input type="text" className="form-input" value={form.visitor} onChange={e => set('visitor', e.target.value)} placeholder="Name of site inspector" required />
        </div>
      </div>
      <div className="form-grid form-grid-2" style={{ marginTop: 12 }}>
        <div className="form-group">
          <label className="form-label">Geographic Zone</label>
          <select className="form-select" value={form.geographicZone} onChange={e => set('geographicZone', e.target.value)}>
            {GEO_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Property Type</label>
          <select className="form-select" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8, marginTop: 16 }}>
        Technical Valuation Parameters
      </div>
      <div className="form-grid form-grid-3">
        <div className="form-group">
          <label className="form-label">Land Rate (₹/sq.ft)</label>
          <input type="number" className="form-input" value={form.landRatePerSqFt} onChange={e => set('landRatePerSqFt', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">Built-up Area Rate (₹/sq.ft)</label>
          <input type="number" className="form-input" value={form.builtUpAreaRate} onChange={e => set('builtUpAreaRate', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">Built-up Area (sq.ft)</label>
          <input type="number" className="form-input" value={form.builtUpArea} onChange={e => set('builtUpArea', Number(e.target.value))} />
        </div>
      </div>
      <div className="form-grid form-grid-2" style={{ marginTop: 12 }}>
        <div className="form-group">
          <label className="form-label">Depreciation (%)</label>
          <input type="number" className="form-input" value={form.depreciation} onChange={e => set('depreciation', Number(e.target.value))} min="0" max="100" />
        </div>
        <div className="form-group">
          <label className="form-label">Final Assessed Value (Auto-calculated)</label>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 9, padding: '10px 14px', fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {fmt(form.finalAssessedValue)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8, marginTop: 16 }}>
        Status & Fees
      </div>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Pipeline Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {PIPELINE_STEPS.map(s => <option key={s.status} value={s.status}>{s.label}</option>)}
          </select>
        </div>
        {isAdmin && (
          <div className="form-group" style={{ justifyContent: 'flex-end', paddingTop: 26 }}>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.feesSettled} onChange={e => set('feesSettled', e.target.checked)} />
              <span className="checkbox-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Fees Settled</span>
            </label>
          </div>
        )}
      </div>

      {isAdmin && (
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)', marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>
            Valuation Fees & Tax Breakdown (18% GST)
          </div>
          <div className="form-grid form-grid-4" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label">Valuation Fees (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={form.fees} 
                onChange={e => {
                  const val = Number(e.target.value);
                  setForm(f => {
                    const cgstAmt = Math.round(val * 0.09);
                    const sgstAmt = Math.round(val * 0.09);
                    return {
                      ...f,
                      fees: val,
                      cgst: cgstAmt,
                      sgst: sgstAmt,
                      totalAmount: val + cgstAmt + sgstAmt
                    };
                  });
                }} 
                placeholder="Base amount" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">CGST (9%)</label>
              <div style={{ padding: '10px 0', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                ₹{form.cgst.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">SGST (9%)</label>
              <div style={{ padding: '10px 0', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                ₹{form.sgst.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--accent-emerald)' }}>Total (incl. GST)</label>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 9, padding: '8px 12px', fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: 'var(--accent-emerald)' }}>
                ₹{form.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="form-label">Remarks</label>
        <textarea className="form-textarea" value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Valuation case notes and remarks..." />
      </div>
    </>
  );

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{valuation ? 'Edit Valuation Details' : 'New Valuation Case'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, comments }); }}>
          <div className="modal-body">
            {renderPipeline()}
            {valuation ? (
              <div className="modal-split-layout">
                <div className="modal-split-left">
                  {renderFormFields()}
                </div>
                <div className="modal-split-right">
                  <CommentsSection
                    comments={comments}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                  />
                </div>
              </div>
            ) : (
              renderFormFields()
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={14} />
              {valuation ? 'Update Case' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ValuationPage() {
  const { currentUser, isAdmin, refresh, refreshKey } = useApp();
  const [cases, setCases] = useState<ValuationCase[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editCase, setEditCase] = useState<ValuationCase | null>(null);
  const [filterBank, setFilterBank] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setCases(LocalDbService.getValuations());
    setBanks(LocalDbService.getBanks());
    setEmployees(LocalDbService.getUsers().filter(u => u.role === 'EMPLOYEE'));
  };

  useEffect(load, [currentUser, isAdmin, refreshKey]);

  const filtered = cases.filter(v => {
    if (filterBank && v.bankId !== filterBank) return false;
    if (filterStatus && v.status !== filterStatus) return false;
    if (filterEmployee && v.assignedTo !== filterEmployee) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        v.bankName.toLowerCase().includes(s) ||
        (v.branch && v.branch.toLowerCase().includes(s)) ||
        (v.visitor && v.visitor.toLowerCase().includes(s)) ||
        (v.propertyDetail && v.propertyDetail.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const handleSave = (data: Partial<ValuationCase>) => {
    if (editCase) {
      LocalDbService.updateValuation({ ...editCase, ...data, updatedAt: new Date().toISOString() });
    } else {
      const newCase: ValuationCase = {
        ...(data as any),
        id: `val_${Date.now()}`,
        initiatedAt: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      LocalDbService.addValuation(newCase);
    }
    load();
    setShowModal(false); setEditCase(null);
    refresh();
  };

  const handleAdvance = (v: ValuationCase) => {
    const nextIdx = getStepIndex(v.status) + 1;
    if (nextIdx >= PIPELINE_ORDER.length) return;
    LocalDbService.advanceValuationStatus(v.id, PIPELINE_ORDER[nextIdx]);
    load(); refresh();
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const totalPortfolio = filtered.reduce((s, v) => s + v.finalAssessedValue, 0);
  const totalBaseFees = filtered.reduce((s, v) => s + (v.fees || 0), 0);
  const totalTax = filtered.reduce((s, v) => s + ((v.cgst || 0) + (v.sgst || 0)), 0);
  const totalGrossFees = filtered.reduce((s, v) => s + (v.totalAmount || 0), 0);
  const totalSettled = filtered.filter(v => v.feesSettled).reduce((s, v) => s + (v.totalAmount || 0), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Property Valuations</h1>
          <p className="page-subtitle">
            {filtered.length} cases · Portfolio: {fmt(totalPortfolio)}
            {isAdmin && ` · Base Fees: ${fmt(totalBaseFees)} · Tax (GST): ${fmt(totalTax)} · Gross: ${fmt(totalGrossFees)} · Settled: ${fmt(totalSettled)}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => ExportService.exportValuations(filtered, isAdmin)}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-danger" onClick={() => ExportService.exportUnpaidValuations(filtered, isAdmin)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Export Unpaid List
          </button>
          <button className="btn btn-primary" onClick={() => { setEditCase(null); setShowModal(true); }}>
            <Plus size={14} /> New Case
          </button>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0 }}>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {PIPELINE_STEPS.map(step => {
            const count = cases.filter(v => v.status === step.status).length;
            return (
              <div
                key={step.status}
                className="card"
                style={{
                  cursor: 'pointer', textAlign: 'center',
                  border: filterStatus === step.status ? '1px solid var(--accent-indigo)' : undefined,
                  background: filterStatus === step.status ? 'rgba(99,102,241,0.08)' : undefined,
                }}
                onClick={() => setFilterStatus(prev => prev === step.status ? '' : step.status)}
              >
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: 4 }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{step.short}</div>
              </div>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="table-container">
          <div className="table-header">
            <div className="filter-bar">
              <input type="text" className="filter-input" placeholder="🔍 Search cases..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 180 }} />
              <select className="filter-input" value={filterBank} onChange={e => setFilterBank(e.target.value)}>
                <option value="">All Banks</option>
                {banks.map(b => <option key={b.id} value={b.id}>{b.shortName}</option>)}
              </select>
              <select className="filter-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                {PIPELINE_STEPS.map(s => <option key={s.status} value={s.status}>{s.label}</option>)}
              </select>
              <select className="filter-input" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                <option value="">All Employees</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {(filterBank || filterStatus || filterEmployee || search) && (
                <button className="btn btn-secondary btn-sm" onClick={() => { setFilterBank(''); setFilterStatus(''); setFilterEmployee(''); setSearch(''); }}>
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} cases</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <Scale size={36} style={{ opacity: 0.4 }} />
              <span className="empty-title">No valuation cases found</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Bank</th>
                    <th>Branch</th>
                    <th>Visitor</th>
                    <th>Property & Site Details</th>
                    <th>Property Type</th>
                    <th>Zone</th>
                    <th>Area (sq.ft)</th>
                    <th>Assessed Value</th>
                    {isAdmin && <th>Fees & Tax (GST)</th>}
                    <th>Status</th>
                    <th>Assigned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => {
                    const stepIdx = getStepIndex(v.status);
                    const canAdvance = stepIdx < PIPELINE_ORDER.length - 1;
                    return (
                      <tr key={v.id}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo-light)', padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                            {v.bankName}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {v.branch || '—'}
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {v.visitor || '—'}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.propertyDetail}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                            {v.siteAddress && (
                              <span style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                                <MapPin size={10} style={{ color: 'var(--accent-rose)' }} />
                                {v.siteAddress}
                              </span>
                            )}
                            {v.comments && v.comments.length > 0 && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: 9,
                                color: 'var(--accent-indigo-light)',
                                background: 'rgba(99,102,241,0.1)',
                                padding: '1px 5px',
                                borderRadius: 4,
                                fontWeight: 500,
                                width: 'fit-content',
                                marginTop: 4
                              }}>
                                💬 {v.comments.length} comments
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{v.propertyType}</td>
                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.geographicZone}</td>
                        <td>{v.builtUpArea > 0 ? v.builtUpArea.toLocaleString() : '—'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'Outfit' }}>{fmt(v.finalAssessedValue)}</td>
                        {isAdmin && (
                          <td>
                            <div style={{ fontWeight: 600 }}>Fees: ₹{v.fees?.toLocaleString('en-IN') ?? 0}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              GST (18%): ₹{((v.cgst ?? 0) + (v.sgst ?? 0)).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--accent-emerald)', marginTop: 2 }}>
                              Total: ₹{v.totalAmount?.toLocaleString('en-IN') ?? 0}
                            </div>
                            {v.feesSettled ? (
                              <div style={{ fontSize: 10, color: 'var(--accent-emerald)', fontWeight: 600, marginTop: 2 }}>✓ Settled</div>
                            ) : (
                              <div style={{ fontSize: 10, color: 'var(--accent-rose)', fontWeight: 600, marginTop: 2 }}>⚠️ Unpaid</div>
                            )}
                          </td>
                        )}
                        <td><span className={`badge ${STATUS_BADGE[v.status]}`}>{v.status.replace(/_/g, ' ')}</span></td>
                        <td>{v.assignedToName.split(' ')[0]}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setEditCase(v); setShowModal(true); }}>Edit</button>
                            {canAdvance && (
                              <button className="btn btn-emerald btn-sm" onClick={() => handleAdvance(v)} title="Advance to next stage">
                                <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ValuationModal
          onClose={() => { setShowModal(false); setEditCase(null); }}
          onSave={handleSave}
          valuation={editCase}
          banks={banks}
          employees={employees}
          currentUserId={currentUser?.id ?? ''}
        />
      )}
    </>
  );
}
