'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { User } from '@/types';
import { Plus, Download, X, CheckCircle, Users, Eye, EyeOff } from 'lucide-react';

function EmployeeModal({ onClose, onSave, user }: { onClose: () => void; onSave: (u: Partial<User>) => void; user?: User | null }) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: user?.password ?? '',
    department: user?.department ?? 'Architecture' as User['department'],
    role: user?.role ?? 'EMPLOYEE' as User['role'],
    joinDate: user?.joinDate ?? new Date().toISOString().split('T')[0],
    isActive: user?.isActive ?? true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{user ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@gtconsultancy.in" required />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">{user ? 'Reset Password' : 'Set Password'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: 44 }}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder={user ? 'Enter new password to reset…' : 'Set login password'}
                  required={!user}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.password && (
                <div style={{ fontSize: 11, marginTop: 4, padding: '6px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--accent-indigo-light)', fontFamily: 'monospace' }}>
                  🔑 {form.password}
                </div>
              )}
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="Architecture">Architecture</option>
                  <option value="Valuation">Valuation</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Join Date</label>
                <input type="date" className="form-input" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} />
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end', paddingTop: 22 }}>
                <label className="checkbox-row">
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                  <span className="checkbox-label">Active Employee</span>
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={14} />
              {user ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { refreshKey } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const metrics = LocalDbService.getEmployeeMetrics();

  const load = () => setUsers(LocalDbService.getUsers());
  useEffect(load, [refreshKey]);

  const handleSave = (data: Partial<User>) => {
    if (editUser) {
      // Keep old password if none provided in edit
      const password = data.password?.trim() ? data.password : editUser.password;
      LocalDbService.updateUser({ ...editUser, ...data, password });
    } else {
      LocalDbService.addUser({ ...(data as any), id: `usr_${Date.now()}` });
    }
    load();
    setShowModal(false); setEditUser(null);
  };

  const handleToggle = (user: User) => {
    LocalDbService.updateUser({ ...user, isActive: !user.isActive });
    load();
  };

  const toggleReveal = (id: string) => {
    setRevealedPasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">
            {users.filter(u => u.isActive).length} active team members · {users.length} total · Admin can add, edit, and reset passwords
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => ExportService.exportEmployeeMetrics(metrics)}>
            <Download size={14} /> Export Metrics
          </button>
          <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowModal(true); }}>
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0 }}>
        {/* Employee Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {users.map(user => {
            const m = metrics.find(x => x.userId === user.id);
            const revealed = revealedPasswords.has(user.id);
            return (
              <div key={user.id} className="card" style={{ opacity: user.isActive ? 1 : 0.6 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: user.role === 'ADMIN' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: 'white',
                  }}>{initials(user.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{user.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'monospace' }}>{user.email}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'employee'}`}>{user.role}</span>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {user.department}
                      </span>
                      {!user.isActive && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', fontWeight: 600 }}>Inactive</span>}
                    </div>
                  </div>
                </div>

                {/* Credentials row */}
                <div style={{
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 8, padding: '8px 12px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>Password</div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-indigo-light)', letterSpacing: revealed ? '0.02em' : '0.1em' }}>
                      {revealed ? (user.password || '—') : '••••••••••'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleReveal(user.id)}
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, cursor: 'pointer', padding: '5px 10px', color: 'var(--accent-indigo-light)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600 }}
                  >
                    {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                    {revealed ? 'Hide' : 'Reveal'}
                  </button>
                </div>

                {/* Stats */}
                {m && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Open', value: m.openTasks, color: 'var(--accent-amber)' },
                      { label: 'Overdue', value: m.overdueTasks, color: m.overdueTasks > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' },
                      { label: 'Closed', value: m.closedTasks, color: 'var(--accent-emerald)' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Outfit', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setEditUser(user); setShowModal(true); }}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Edit / Reset Password
                  </button>
                  <button
                    className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-emerald'}`}
                    onClick={() => handleToggle(user)}
                    style={{ justifyContent: 'center', padding: '6px 14px' }}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <EmployeeModal onClose={() => { setShowModal(false); setEditUser(null); }} onSave={handleSave} user={editUser} />
      )}
    </>
  );
}
