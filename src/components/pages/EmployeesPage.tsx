'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { User, Department } from '@/types';
import { Plus, Download, X, CheckCircle, Users, Eye, EyeOff, Settings, FileText, Trash } from 'lucide-react';

function EmployeeModal({ onClose, onSave, user }: { onClose: () => void; onSave: (u: Partial<User>) => void; user?: User | null }) {
  const departments = LocalDbService.getDepartments();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    password: user?.password ?? '',
    department: user?.department ?? (departments[0]?.name ?? 'Architecture'),
    role: user?.role ?? 'EMPLOYEE' as User['role'],
    joinDate: user?.joinDate ?? new Date().toISOString().split('T')[0],
    isActive: user?.isActive ?? true,
    notifyEmail: user?.notifyEmail ?? true,
    notifySms: user?.notifySms ?? true,
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
            {user?.employeeId && (
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Employee ID</label>
                <input type="text" className="form-input" value={user.employeeId} disabled style={{ opacity: 0.7, background: 'rgba(255,255,255,0.03)' }} />
              </div>
            )}

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@gtconsultancy.in" required />
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ marginTop: 10 }}>
              <div className="form-group">
                <label className="form-label">Mobile Phone (SMS / WhatsApp)</label>
                <input type="tel" className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label className="form-label">{user ? 'Reset Password' : 'Set Password'}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingRight: 44 }}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={user ? 'Enter new password…' : 'Set password'}
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
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ marginTop: 10 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                  <option value="PRINCIPAL_ADMIN">Principal Admin</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 14, marginTop: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--accent-indigo-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                ⚡ Automated Alerts & Dispatch Settings
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="checkbox-row">
                  <input type="checkbox" checked={form.notifyEmail} onChange={e => set('notifyEmail', e.target.checked)} />
                  <span className="checkbox-label" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                    ✉️ Send Instant Email Alerts on Task Creation, Status Updates & Remarks
                  </span>
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={form.notifySms} onChange={e => set('notifySms', e.target.checked)} />
                  <span className="checkbox-label" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                    📱 Send Direct Mobile SMS / WhatsApp Messages to Phone Number
                  </span>
                </label>
              </div>
            </div>

            <div className="form-grid form-grid-2" style={{ marginTop: 14 }}>
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

const handlePrint = (type: 'joining' | 'experience', details: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert('Please allow popups to generate documents');

  const formattedSalary = details.salary ? `₹${Number(details.salary).toLocaleString('en-IN')}` : 'competitive';

  const joiningTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6;">
      <!-- Letterhead -->
      <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #1e1b4b; font-size: 26px; font-weight: bold; letter-spacing: 1px;">G.T. DESIGN STUDIO</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">Architects, Town Planners, Engineers & Project Managers</p>
        <p style="margin: 4px 0 0 0; font-size: 10px; color: #777;">P-27, Kavita Nagar, Avanti Vihar, Raipur (C.G.) - 492001 | Tel: 0771-4011330</p>
      </div>

      <!-- Date & Reference -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">
        <div><b>Ref:</b> GTDS/HR/${details.employeeId}/${new Date(details.date).getFullYear()}</div>
        <div><b>Date:</b> ${new Date(details.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>

      <!-- To Address -->
      <div style="margin-bottom: 30px; font-size: 14px;">
        To,<br/>
        <b>${details.name}</b><br/>
        ${details.email ? `Email: ${details.email}<br/>` : ''}
        ${details.phone ? `Phone: ${details.phone}<br/>` : ''}
      </div>

      <!-- Subject -->
      <div style="text-align: center; font-weight: bold; font-size: 16px; text-decoration: underline; margin-bottom: 25px; text-transform: uppercase;">
        Subject: Offer & Appointment Letter for ${details.roleName}
      </div>

      <!-- Body -->
      <div style="font-size: 14px; text-align: justify; margin-bottom: 30px;">
        <p>Dear ${details.name},</p>
        <p>With reference to your application and subsequent interview, we are pleased to appoint you as <b>${details.roleName}</b> in the <b>${details.department}</b> department at <b>G.T. Design Studio</b>, Raipur, with effect from <b>${new Date(details.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</b>.</p>
        
        <p>Your monthly consolidated gross salary will be <b>${formattedSalary} per month</b>, inclusive of all allowances. Your duties and responsibilities will be as discussed and assigned by the management.</p>
        
        <p>Please return the duplicate copy of this letter duly signed by you as a token of your acceptance of the offer and its terms and conditions.</p>
        
        <p>We welcome you to G.T. Design Studio and look forward to a mutually beneficial association.</p>
      </div>

      <!-- Closing -->
      <div style="margin-top: 50px; font-size: 14px;">
        Warm regards,<br/><br/><br/>
        <b>For G.T. Design Studio</b><br/>
        <span style="display: inline-block; border-top: 1px solid #777; width: 150px; margin-top: 40px; padding-top: 5px;">Authorized Signatory<br/>(${details.signatory})</span>
      </div>
    </div>
  `;

  const experienceTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6;">
      <!-- Letterhead -->
      <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-bottom: 40px;">
        <h1 style="margin: 0; color: #1e1b4b; font-size: 26px; font-weight: bold; letter-spacing: 1px;">G.T. DESIGN STUDIO</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">Architects, Town Planners, Engineers & Project Managers</p>
        <p style="margin: 4px 0 0 0; font-size: 10px; color: #777;">P-27, Kavita Nagar, Avanti Vihar, Raipur (C.G.) - 492001 | Tel: 0771-4011330</p>
      </div>

      <!-- Date & Reference -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px;">
        <div><b>Ref:</b> GTDS/EXP/${details.employeeId}/${new Date(details.date).getFullYear()}</div>
        <div><b>Date:</b> ${new Date(details.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>

      <!-- Subject -->
      <div style="text-align: center; font-weight: bold; font-size: 18px; text-decoration: underline; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 0.5px;">
        TO WHOMSOEVER IT MAY CONCERN
      </div>

      <!-- Body -->
      <div style="font-size: 14px; text-align: justify; line-height: 1.8; margin-bottom: 40px;">
        <p>This is to certify that <b>${details.name}</b> has been employed with <b>G.T. Design Studio</b>, Raipur, as <b>${details.roleName}</b> in the <b>${details.department}</b> department from <b>${new Date(details.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</b> to <b>${new Date(details.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</b>.</p>
        
        <p>During their tenure with us, we found them to be sincere, hard-working, and dedicated to their duties. They have demonstrated strong professional skills and worked well within our team.</p>
        
        <p>We wish them all the success in their future professional endeavors.</p>
      </div>

      <!-- Closing -->
      <div style="margin-top: 80px; font-size: 14px;">
        Warm regards,<br/><br/><br/>
        <b>For G.T. Design Studio</b><br/>
        <span style="display: inline-block; border-top: 1px solid #777; width: 150px; margin-top: 40px; padding-top: 5px;">Authorized Signatory<br/>(${details.signatory})</span>
      </div>
    </div>
  `;

  printWindow.document.write(`
    <html>
      <head>
        <title>${type === 'joining' ? 'Joining Letter' : 'Experience Certificate'} - ${details.name}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            @page { size: A4; margin: 1.5cm; }
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        ${type === 'joining' ? joiningTemplate : experienceTemplate}
      </body>
    </html>
  `);
  printWindow.document.close();
};

function DepartmentModal({ onClose }: { onClose: () => void }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [deptName, setDeptName] = useState('');
  const [divisionsText, setDivisionsText] = useState('');

  useEffect(() => {
    setDepartments(LocalDbService.getDepartments());
  }, []);

  const handleSelectDept = (id: string) => {
    setSelectedDeptId(id);
    if (id === 'new') {
      setDeptName('');
      setDivisionsText('');
    } else {
      const dept = departments.find(d => d.id === id);
      if (dept) {
        setDeptName(dept.name);
        setDivisionsText(dept.divisions.join(', '));
      }
    }
  };

  const handleSave = () => {
    if (!deptName.trim()) return alert('Please enter a department name');
    const divs = divisionsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    if (selectedDeptId === 'new') {
      const newDept = {
        id: `dept_${Date.now()}`,
        name: deptName.trim(),
        divisions: divs
      };
      LocalDbService.addDepartment(newDept);
    } else {
      const updated = {
        id: selectedDeptId,
        name: deptName.trim(),
        divisions: divs
      };
      LocalDbService.updateDepartment(updated);
    }
    setDepartments(LocalDbService.getDepartments());
    setSelectedDeptId('');
    setDeptName('');
    setDivisionsText('');
    alert('Department settings saved successfully!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    LocalDbService.deleteDepartment(id);
    setDepartments(LocalDbService.getDepartments());
    setSelectedDeptId('');
    setDeptName('');
    setDivisionsText('');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Manage Departments & Divisions</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Select Department to Edit</label>
            <select className="form-select" value={selectedDeptId} onChange={e => handleSelectDept(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="new">+ Add New Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {selectedDeptId && (
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input type="text" className="form-input" value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Design" />
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="form-label">Divisions (Comma Separated)</label>
                <textarea 
                  className="form-textarea" 
                  value={divisionsText} 
                  onChange={e => setDivisionsText(e.target.value)} 
                  placeholder="e.g. Layouts, Interiors, Tendering"
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button type="button" className="btn btn-primary" onClick={handleSave}>Save Department</button>
                {selectedDeptId !== 'new' && (
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(selectedDeptId)}>Delete Department</button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function LetterModal({ onClose, user }: { onClose: () => void; user: User }) {
  const [type, setType] = useState<'joining' | 'experience'>('joining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatory, setSignatory] = useState('Ar. Piyush Raj Verma');
  const [salary, setSalary] = useState('');

  useEffect(() => {
    const records = LocalDbService.getAccounts();
    const match = records.find(r => r.userId === user.id);
    if (match) {
      setSalary(String(match.baseSalary));
    }
  }, [user]);

  const handleGenerate = () => {
    let roleTitle = 'Employee';
    if (user.department === 'Architecture') {
      roleTitle = user.role === 'ADMIN' ? 'Senior Architect' : 'Junior Architect';
    } else if (user.department === 'Valuation') {
      roleTitle = 'Valuation Engineer';
    } else if (user.department === 'Accounts') {
      roleTitle = 'Accounts Executive';
    } else if (user.department === 'Admin') {
      roleTitle = 'Administrator';
    }
    
    handlePrint(type, {
      id: user.id,
      employeeId: user.employeeId || 'TEMP-ID',
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleName: roleTitle,
      department: user.department,
      joinDate: user.joinDate,
      endDate,
      date,
      signatory,
      salary
    });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <h2 className="modal-title">📄 Generate Letter Document</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
            Generating document for: <b>{user.name}</b> (${user.employeeId})
          </div>

          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="joining">Offer & Appointment Letter</option>
              <option value="experience">Experience Certificate</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Issue Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {type === 'joining' && (
            <div className="form-group" style={{ marginTop: 10 }}>
              <label className="form-label">Salary Details (Monthly Consolidated ₹)</label>
              <input type="number" className="form-input" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 25000" />
            </div>
          )}

          {type === 'experience' && (
            <div className="form-group" style={{ marginTop: 10 }}>
              <label className="form-label">Employment End Date</label>
              <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          )}

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Authorized Signatory Name</label>
            <input type="text" className="form-input" value={signatory} onChange={e => setSignatory(e.target.value)} placeholder="e.g. Ar. Piyush Raj Verma" />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleGenerate}>
            Generate & Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { isAdmin, isPrincipalAdmin, refreshKey } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterUser, setLetterUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const metrics = LocalDbService.getEmployeeMetrics();
  const departments = LocalDbService.getDepartments();

  const load = () => setUsers(LocalDbService.getUsers());
  useEffect(load, [refreshKey]);

  const handleSave = (data: Partial<User>) => {
    if (editUser) {
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

  const filteredUsers = users.filter(u => {
    if (filterDept && u.department !== filterDept) return false;
    if (filterRole && u.role !== filterRole) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.department.toLowerCase().includes(s) ||
        u.role.toLowerCase().includes(s)
      );
    }
    return true;
  });

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
          {isAdmin && (
            <button className="btn btn-secondary" onClick={() => setShowDeptModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings size={14} /> Departments
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-secondary" onClick={() => ExportService.exportEmployeeMetrics(metrics)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} /> Export Metrics
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowModal(true); }}>
              <Plus size={14} /> Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0 }}>
        {/* Search & Filter Bar */}
        <div className="table-container" style={{ padding: '14px 20px', marginBottom: 16 }}>
          <div className="filter-bar">
            <input
              type="text"
              className="filter-input"
              placeholder="🔍 Search employee name, email, department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 260 }}
            />
            <select className="filter-input" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <select className="filter-input" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="PRINCIPAL_ADMIN">Principal Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
            {(search || filterDept || filterRole) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterDept(''); setFilterRole(''); }}>
                <X size={12} /> Clear
              </button>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {filteredUsers.length} of {users.length} members
            </span>
          </div>
        </div>

        {/* Employee Cards */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={36} style={{ opacity: 0.4 }} />
            <span className="empty-title">No employees found</span>
            <span className="empty-sub">Try adjusting your search query or department filter</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filteredUsers.map(user => {
              const m = metrics.find(x => x.userId === user.id);
              const revealed = revealedPasswords.has(user.id);
              const isPiyush = user.email.toLowerCase() === 'piyush@gtconsultancy.in';

              return (
                <div key={user.id} className="card" style={{ opacity: user.isActive ? 1 : 0.6 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: user.role === 'PRINCIPAL_ADMIN' ? 'var(--gradient-primary)' : user.role === 'ADMIN' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: 'white',
                    }}>{initials(user.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{user.name}</div>
                        {user.employeeId && (
                          <span style={{ fontSize: 9, color: 'var(--accent-indigo-light)', fontWeight: 700, fontFamily: 'monospace', background: 'rgba(99,102,241,0.08)', padding: '1px 5px', borderRadius: 4 }}>
                            {user.employeeId}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'monospace' }}>{user.email}</div>
                      {user.phone && (
                        <div style={{ fontSize: 11, color: 'var(--accent-indigo-light)', marginBottom: 6, fontWeight: 500 }}>
                          📱 {user.phone}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <span className={`role-badge ${user.role === 'PRINCIPAL_ADMIN' ? 'admin' : user.role === 'ADMIN' ? 'admin' : 'employee'}`} style={{ fontSize: 8.5 }}>
                          {user.role.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {user.department}
                        </span>
                        {user.notifySms && <span style={{ fontSize: 8.5, padding: '2px 6px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', color: 'var(--accent-emerald)', fontWeight: 600 }}>SMS ON</span>}
                        {user.notifyEmail && <span style={{ fontSize: 8.5, padding: '2px 6px', borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: 'var(--accent-indigo-light)', fontWeight: 600 }}>Email ON</span>}
                        {!user.isActive && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', fontWeight: 600 }}>Inactive</span>}
                      </div>
                    </div>
                  </div>

                  {/* Credentials row (only visible to admin, and only reveal non-Principal admin passwords unless logged in as Principal Admin) */}
                  {isAdmin && (
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
                      {(!isPiyush || isPrincipalAdmin) && (
                        <button
                          onClick={() => toggleReveal(user.id)}
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, cursor: 'pointer', padding: '5px 10px', color: 'var(--accent-indigo-light)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600 }}
                        >
                          {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                          {revealed ? 'Hide' : 'Reveal'}
                        </button>
                      )}
                    </div>
                  )}

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
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(!isPiyush || isPrincipalAdmin) && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setEditUser(user); setShowModal(true); }}
                          style={{ flex: 1.2, justifyContent: 'center', fontSize: 11 }}
                        >
                          Edit Details
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setLetterUser(user); setShowLetterModal(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', fontSize: 11 }}
                        title="Generate Offer/Experience Letters"
                      >
                        <FileText size={12} /> Document
                      </button>
                      {(!isPiyush || isPrincipalAdmin) && (
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-emerald'}`}
                          onClick={() => handleToggle(user)}
                          style={{ padding: '6px 8px', fontSize: 11 }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <EmployeeModal onClose={() => { setShowModal(false); setEditUser(null); }} onSave={handleSave} user={editUser} />
      )}

      {showDeptModal && (
        <DepartmentModal onClose={() => { setShowDeptModal(false); load(); }} />
      )}

      {showLetterModal && letterUser && (
        <LetterModal onClose={() => { setShowLetterModal(false); setLetterUser(null); }} user={letterUser} />
      )}
    </>
  );
}
