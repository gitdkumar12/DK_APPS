'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard, FolderKanban, ClipboardList,
  Building2, Users, BarChart3, LogOut,
  Scale, ChevronRight, X, Eye, EyeOff, CheckCircle, IndianRupee, CalendarDays
} from 'lucide-react';
import { LocalDbService } from '@/services/LocalDbService';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS_ADMIN = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'OVERVIEW' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, section: 'ARCHITECTURE' },
  { id: 'tasks', label: 'Task Log', icon: ClipboardList, section: 'ARCHITECTURE' },
  { id: 'valuation', label: 'Valuations', icon: Scale, section: 'VALUATION' },
  { id: 'banks', label: 'Bank Registry', icon: Building2, section: 'VALUATION' },
  { id: 'accounts', label: 'Accounts', icon: IndianRupee, section: 'ADMIN' },
  { id: 'leaves', label: 'Leaves & Holidays', icon: CalendarDays, section: 'HR' },
  { id: 'employees', label: 'Employees', icon: Users, section: 'HR' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'ADMIN' },
];

export default function Sidebar({ activePage, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  const { currentUser, isAdmin, logout, setCurrentUser } = useApp();
  const [showResetModal, setShowResetModal] = useState(false);
  const allUsers = LocalDbService.getUsers();

  const handleResetPassword = (newPassword: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, password: newPassword };
    LocalDbService.updateUser(updatedUser);
    setCurrentUser(updatedUser);
    alert('Password updated successfully!');
    setShowResetModal(false);
  };

  const navItems = isAdmin
    ? NAV_ITEMS_ADMIN
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MY WORKSPACE' },
        ...(currentUser?.department === 'Valuation'
          ? [{ id: 'valuation', label: 'Valuations', icon: Scale, section: 'MY WORKSPACE' }]
          : currentUser?.department === 'Accounts'
          ? [{ id: 'accounts', label: 'Accounts', icon: IndianRupee, section: 'MY WORKSPACE' }]
          : [{ id: 'my-tasks', label: 'My Tasks', icon: ClipboardList, section: 'MY WORKSPACE' }]
        ),
        { id: 'leaves', label: 'Leaves & Holidays', icon: CalendarDays, section: 'HR' },
      ];

  // Group nav items by section
  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const initials = currentUser?.name
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'GU';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="brand-icon">GT</div>
            <div className="brand-text">
              <span className="brand-name">GT Consultancy</span>
              <span className="brand-sub">Raipur Operations</span>
            </div>
            {mobileOpen && (
              <button
                onClick={onMobileClose}
                className="btn btn-icon btn-secondary ml-auto"
                style={{ marginLeft: 'auto' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <div className="nav-section-title">{section}</div>
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item w-full text-left ${isActive ? 'active' : ''}`}
                    onClick={() => { onNavigate(item.id); onMobileClose?.(); }}
                    style={{ width: '100%', background: 'none' }}
                  >
                    <Icon size={16} />
                    {item.label}
                    {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Role Switcher (for demo/testing) */}
        {currentUser && (
          <div style={{ padding: '0 12px 12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', padding: '0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Switch Role (Demo)
            </div>
            <div className="role-switcher">
              {allUsers.map(user => (
                <button
                  key={user.id}
                  className={`role-switch-btn ${currentUser.id === user.id ? 'active' : ''}`}
                  onClick={() => setCurrentUser(user)}
                  title={user.name}
                >
                  {user.role === 'ADMIN' ? '👑 Admin' : user.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Profile & Logout */}
        <div className="sidebar-bottom">
          {currentUser && (
            <button
              className="sidebar-user w-full text-left"
              onClick={() => setShowResetModal(true)}
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--glass-bg)', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '10px 12px', borderRadius: 10 }}
              title="Change your password"
            >
              <div className="user-avatar">{initials}</div>
              <div className="user-info">
                <div className="user-name">{currentUser.name}</div>
                <div className="user-role">{currentUser.department}</div>
              </div>
              <span className={`role-badge ${isAdmin ? 'admin' : 'employee'}`}>
                {isAdmin ? 'Admin' : 'Staff'}
              </span>
            </button>
          )}
          <button
            className="btn btn-secondary w-full"
            onClick={logout}
            style={{ width: '100%', justifyContent: 'center', gap: 8 }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {showResetModal && (
        <ChangePasswordModal
          onClose={() => setShowResetModal(false)}
          onSave={handleResetPassword}
        />
      )}
    </>
  );
}

function ChangePasswordModal({ onClose, onSave }: { onClose: () => void; onSave: (p: string) => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      alert('Password cannot be empty');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSave(password);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">Change Password</h2>
          <button type="button" className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: 44 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={14} />
              Save Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
