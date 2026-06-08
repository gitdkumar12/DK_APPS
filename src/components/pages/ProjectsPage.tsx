'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { Project, ProjectStatus } from '@/types';
import { Plus, Download, X, CheckCircle, MapPin } from 'lucide-react';

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
  });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
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
  const { isAdmin, refresh } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { setProjects(LocalDbService.getProjects()); }, []);

  const filtered = projects.filter(p => {
    if (filterStatus && p.status !== filterStatus) return false;
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
                style={{ minWidth: 200 }}
              />
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
                      </td>
                      <td>{p.clientName}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <MapPin size={11} style={{ color: 'var(--accent-indigo-light)', flexShrink: 0 }} />
                          {p.siteLocation}
                        </span>
                      </td>
                      <td style={{ maxWidth: 180, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.siteAddress}>
                          {p.siteAddress}
                        </span>
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
