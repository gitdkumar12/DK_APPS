'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { Project, ProjectStatus, ProjectDocument } from '@/types';
import { Plus, Download, X, CheckCircle, MapPin, FileText, Trash } from 'lucide-react';

const STATUS_MAP: Record<ProjectStatus, string> = {
  ACTIVE: 'badge-active',
  ON_HOLD: 'badge-open',
  COMPLETED: 'badge-closed',
};

function ProjectModal({
  onClose, onSave, project,
}: { onClose: () => void; onSave: (p: Partial<Project>) => void; project?: Project | null }) {
  const [form, setForm] = useState({
    name: project?.name ?? '',
    clientName: project?.clientName ?? '',
    siteAddress: project?.siteAddress ?? '',
    siteLocation: project?.siteLocation ?? '',
    totalValue: project?.totalValue ?? 0,
    status: project?.status ?? 'ACTIVE' as ProjectStatus,
    description: project?.description ?? '',
    departmentId: project?.departmentId ?? '',
    division: project?.division ?? '',
    documents: project?.documents ?? [] as ProjectDocument[],
  });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const departments = LocalDbService.getDepartments();
  const selectedDeptDivisions = departments.find(d => d.id === form.departmentId)?.divisions ?? [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const docUrl = reader.result as string;
      const newDoc: ProjectDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: docType,
        fileName: file.name,
        fileType: file.name.split('.').pop() || '',
        fileSize: file.size,
        dataUrl: docUrl,
        createdAt: new Date().toISOString().split('T')[0]
      };
      // Keep only one file per document type, replace if already exists
      const filteredDocs = (form.documents || []).filter(d => d.name !== docType);
      set('documents', [...filteredDocs, newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (docId: string) => {
    set('documents', (form.documents || []).filter(d => d.id !== docId));
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Project Name / Code</label>
                <input type="text" className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. SBLD, CSIDC_WWH" required />
              </div>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input type="text" className="form-input" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. NRDA, CSIDC" required />
              </div>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select 
                  className="form-select" 
                  value={form.departmentId} 
                  onChange={e => { set('departmentId', e.target.value); set('division', ''); }} 
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Division *</label>
                <select 
                  className="form-select" 
                  value={form.division} 
                  onChange={e => set('division', e.target.value)} 
                  required 
                  disabled={!form.departmentId}
                >
                  <option value="">Select Division</option>
                  {selectedDeptDivisions.map((div: string) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Site Address</label>
              <input type="text" className="form-input" value={form.siteAddress} onChange={e => set('siteAddress', e.target.value)} placeholder="Full site address" />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Site Location</label>
                <input type="text" className="form-input" value={form.siteLocation} onChange={e => set('siteLocation', e.target.value)} placeholder="e.g. Naya Raipur, Korba" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Deal Value (₹)</label>
                <input type="number" className="form-input" value={form.totalValue} onChange={e => set('totalValue', Number(e.target.value))} placeholder="0" />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description / Notes</label>
              <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Project details..." />
            </div>

            {/* Document Upload Section */}
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>📁 Project Documents (PDF / JPG)</div>
              
              <div className="form-grid form-grid-2" style={{ gap: 10 }}>
                {['Work Order', 'Agreement', 'Completion Certificate', 'Receiving Letter', 'Other'].map(type => (
                  <div key={type} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>{type}</label>
                    <input 
                      type="file" 
                      className="form-input" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => handleFileUpload(e, type)} 
                      style={{ fontSize: 11, padding: '4px 8px' }}
                    />
                  </div>
                ))}
              </div>

              {form.documents && form.documents.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Attached Files:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                    {form.documents.map((d: ProjectDocument) => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 6, fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent-indigo-light)' }}>{d.name}:</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 280 }}>{d.fileName}</span>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-danger" 
                          onClick={() => removeDoc(d.id)} 
                          style={{ padding: '2px 6px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          <Trash size={10} /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={14} />
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin, refresh, refreshKey } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterDiv, setFilterDiv] = useState('');

  useEffect(() => { setProjects(LocalDbService.getProjects()); }, [refreshKey]);

  const departments = LocalDbService.getDepartments();
  const allDivisions = filterDept ? (departments.find(d => d.id === filterDept)?.divisions ?? []) : [];

  const filtered = projects.filter(p => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterDept && p.departmentId !== filterDept) return false;
    if (filterDiv && p.division !== filterDiv) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.clientName.toLowerCase().includes(s) || p.siteLocation.toLowerCase().includes(s);
    }
    return true;
  });

  const handleSave = (data: Partial<Project>) => {
    if (editProject) {
      LocalDbService.updateProject({ ...editProject, ...data });
    } else {
      LocalDbService.addProject({ ...(data as any), id: `prj_${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] });
    }
    setProjects(LocalDbService.getProjects());
    setShowModal(false); setEditProject(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this project? All linked tasks will remain.')) return;
    LocalDbService.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    refresh();
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const totalValue = filtered.reduce((s, p) => s + p.totalValue, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Projects</h1>
          <p className="page-subtitle">All architectural and civil projects · Total portfolio: {fmt(totalValue)}</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => ExportService.exportProjects(filtered)}>
              <Download size={14} /> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
              <Plus size={14} /> New Project
            </button>
          </div>
        )}
      </div>

      <div className="content-area" style={{ paddingTop: 0 }}>
        <div className="table-container">
          <div className="table-header">
            <div className="filter-bar">
              <input
                type="text" className="filter-input"
                placeholder="🔍 Search projects..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ minWidth: 160 }}
              />
              <select className="filter-input" value={filterDept} onChange={e => { setFilterDept(e.target.value); setFilterDiv(''); }}>
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select className="filter-input" value={filterDiv} onChange={e => setFilterDiv(e.target.value)} disabled={!filterDept}>
                <option value="">All Divisions</option>
                {allDivisions.map((div: string) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
              <select className="filter-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} projects</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏗</span>
              <span className="empty-title">No projects found</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Project Name</th>
                    <th>Client</th>
                    <th>Site Location</th>
                    <th>Site Address</th>
                    <th>Documents</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Created</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.description}</div>}
                        {(p.departmentId || p.division) && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            {p.departmentId && (
                              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(99,102,241,0.12)', color: 'var(--accent-indigo-light)', fontWeight: 600 }}>
                                {departments.find(d => d.id === p.departmentId)?.name || p.departmentId}
                              </span>
                            )}
                            {p.division && (
                              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(16,185,129,0.12)', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                                {p.division}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>{p.clientName}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <MapPin size={11} style={{ color: 'var(--accent-indigo-light)', flexShrink: 0 }} />
                          {p.siteLocation}
                        </span>
                      </td>
                      <td style={{ maxWidth: 160, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.siteAddress}>
                          {p.siteAddress}
                        </span>
                      </td>
                      <td>
                        {p.documents && p.documents.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100 }}>
                            {p.documents.map((d: ProjectDocument) => (
                              <a 
                                key={d.id} 
                                href={d.dataUrl} 
                                download={d.fileName}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-indigo-light)', textDecoration: 'none', fontWeight: 500 }}
                                title={`Download ${d.fileName}`}
                              >
                                <FileText size={11} /> {d.name}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>No docs</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-emerald)', fontFamily: 'Outfit' }}>
                        {fmt(p.totalValue)}
                      </td>
                      <td><span className={`badge ${STATUS_MAP[p.status]}`}>{p.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.createdAt}</td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setEditProject(p); setShowModal(true); }}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><X size={12} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && isAdmin && (
        <ProjectModal
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSave={handleSave}
          project={editProject}
        />
      )}
    </>
  );
}
