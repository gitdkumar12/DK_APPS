import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { User, LeaveQuota, LeaveRequest, Holiday, LeaveType } from '@/types';
import { Calendar, UserCheck, UserX, Plus, Check, X, ShieldAlert } from 'lucide-react';

export default function LeavesPage() {
  const { currentUser, isAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<'my-leaves' | 'requests' | 'holidays' | 'quotas'>('my-leaves');
  
  const [myQuota, setMyQuota] = useState<LeaveQuota | null>(null);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  
  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('CL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Quota states (for admin)
  const [selectedUserForQuota, setSelectedUserForQuota] = useState<string>('');
  const [quotaCL, setQuotaCL] = useState(0);
  const [quotaPL, setQuotaPL] = useState(0);
  const [quotaSick, setQuotaSick] = useState(0);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    refreshData();
    if (isAdmin) {
      setActiveTab('requests');
    }
  }, [isAdmin, currentUser]);

  const refreshData = () => {
    if (!currentUser) return;
    
    setHolidays(LocalDbService.getHolidays());
    
    if (isAdmin) {
      setAllRequests(LocalDbService.getLeaveRequests().sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()));
      setEmployees(LocalDbService.getUsers().filter(u => u.role === 'EMPLOYEE'));
    } else {
      setMyQuota(LocalDbService.getLeaveQuotaForUser(currentUser.id, currentYear));
      setMyRequests(LocalDbService.getLeaveRequests(currentUser.id).sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()));
    }
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason || !currentUser) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    const req: LeaveRequest = {
      id: `lr_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'PENDING',
      appliedOn: new Date().toISOString()
    };

    LocalDbService.saveLeaveRequest(req);
    setStartDate(''); setEndDate(''); setReason('');
    alert('Leave request submitted successfully.');
    refreshData();
  };

  const handleUpdateStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const req = allRequests.find(r => r.id === id);
    if (!req) return;
    
    // Check quota if approving
    if (status === 'APPROVED') {
      const quota = LocalDbService.getLeaveQuotaForUser(req.userId, currentYear);
      if (quota) {
        let updatedQuota = { ...quota };
        if (req.type === 'CL') updatedQuota.usedCL += req.days;
        if (req.type === 'PL') updatedQuota.usedPL += req.days;
        if (req.type === 'SICK') updatedQuota.usedSick += req.days;
        LocalDbService.saveLeaveQuota(updatedQuota);
      }
    }

    req.status = status;
    req.approvedBy = currentUser?.name;
    req.approvedOn = new Date().toISOString();
    LocalDbService.saveLeaveRequest(req);
    refreshData();
  };

  const handleSaveQuota = () => {
    if (!selectedUserForQuota) return;
    const quota: LeaveQuota = {
      userId: selectedUserForQuota,
      year: currentYear,
      totalCL: quotaCL,
      totalPL: quotaPL,
      totalSick: quotaSick,
      usedCL: 0,
      usedPL: 0,
      usedSick: 0
    };
    
    // Preserve existing usage if updating
    const existing = LocalDbService.getLeaveQuotaForUser(selectedUserForQuota, currentYear);
    if (existing) {
      quota.usedCL = existing.usedCL;
      quota.usedPL = existing.usedPL;
      quota.usedSick = existing.usedSick;
    }
    
    LocalDbService.saveLeaveQuota(quota);
    alert('Leave quota saved successfully.');
  };

  const selectUserForQuota = (userId: string) => {
    setSelectedUserForQuota(userId);
    const quota = LocalDbService.getLeaveQuotaForUser(userId, currentYear);
    if (quota) {
      setQuotaCL(quota.totalCL);
      setQuotaPL(quota.totalPL);
      setQuotaSick(quota.totalSick);
    } else {
      setQuotaCL(0); setQuotaPL(0); setQuotaSick(0);
    }
  };

  const renderLeaveGraph = (used: number, total: number, color: string, title: string) => {
    const percentage = total > 0 ? Math.min(100, (used / total) * 100) : 0;
    return (
      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: 16 }}>{title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', 
            background: `conic-gradient(${color} ${percentage}%, var(--bg-secondary) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
              {used}/{total}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Days Used: {used}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total Allowed: {total}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: percentage >= 100 ? '#ef4444' : 'var(--text-primary)', marginTop: 4 }}>
              Remaining: {total - used}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container" style={{ padding: 24, background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Leaves & Holidays</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage employee leave balances, requests, and company holidays.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {!isAdmin && (
          <button 
            className={`btn ${activeTab === 'my-leaves' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('my-leaves')}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'my-leaves' ? 'none' : '' }}
          >
            My Leaves
          </button>
        )}
        {isAdmin && (
          <button 
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('requests')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            Leave Requests
          </button>
        )}
        {isAdmin && (
          <button 
            className={`btn ${activeTab === 'quotas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('quotas')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            Manage Quotas
          </button>
        )}
        <button 
          className={`btn ${activeTab === 'holidays' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('holidays')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          Holiday Calendar
        </button>
      </div>

      {activeTab === 'my-leaves' && !isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {renderLeaveGraph(myQuota?.usedCL ?? 0, myQuota?.totalCL ?? 0, '#3b82f6', 'Casual Leave (CL)')}
              {renderLeaveGraph(myQuota?.usedPL ?? 0, myQuota?.totalPL ?? 0, '#10b981', 'Privilege Leave (PL)')}
              {renderLeaveGraph(myQuota?.usedSick ?? 0, myQuota?.totalSick ?? 0, '#f59e0b', 'Sick Leave')}
            </div>
            
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>My Request History</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Type</th>
                    <th style={{ padding: '12px 16px' }}>Duration</th>
                    <th style={{ padding: '12px 16px' }}>Days</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{req.type}</td>
                      <td style={{ padding: '12px 16px' }}>{req.startDate} to {req.endDate}</td>
                      <td style={{ padding: '12px 16px' }}>{req.days}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                          background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : req.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                        }}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {myRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No leave requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} color="var(--primary)" /> Apply for Leave
            </h3>
            <form onSubmit={handleApplyLeave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Leave Type</label>
                <select className="input-field" value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)}>
                  <option value="CL">Casual Leave (CL)</option>
                  <option value="PL">Privilege Leave (PL)</option>
                  <option value="SICK">Sick Leave</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Start Date</label>
                  <input type="date" className="input-field" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>End Date</label>
                  <input type="date" className="input-field" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Reason</label>
                <textarea className="input-field" rows={3} required value={reason} onChange={e => setReason(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'requests' && isAdmin && (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Employee</th>
                <th style={{ padding: '12px 16px' }}>Type & Reason</th>
                <th style={{ padding: '12px 16px' }}>Duration</th>
                <th style={{ padding: '12px 16px' }}>Days</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{req.userName}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 600, marginRight: 8 }}>{req.type}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{req.reason}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{req.startDate} to {req.endDate}</td>
                  <td style={{ padding: '12px 16px' }}>{req.days}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : req.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(req.id, 'APPROVED')} title="Approve">
                          <Check size={16} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(req.id, 'REJECTED')} title="Reject">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'quotas' && isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Select Employee</h3>
            </div>
            {employees.map(emp => (
              <div 
                key={emp.id}
                onClick={() => selectUserForQuota(emp.id)}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  background: selectedUserForQuota === emp.id ? 'var(--primary-light)' : 'var(--bg-primary)'
                }}
              >
                <div style={{ fontWeight: 600 }}>{emp.name}</div>
              </div>
            ))}
          </div>

          {selectedUserForQuota ? (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: 18 }}>Yearly Leave Quotas ({currentYear})</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Casual Leave (CL)</label>
                  <input type="number" className="input-field" value={quotaCL} onChange={e => setQuotaCL(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Privilege Leave (PL)</label>
                  <input type="number" className="input-field" value={quotaPL} onChange={e => setQuotaPL(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Sick Leave</label>
                  <input type="number" className="input-field" value={quotaSick} onChange={e => setQuotaSick(Number(e.target.value))} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSaveQuota}>Save Quota</button>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Select an employee to manage their leave limits.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} color="var(--primary)" /> Company Holiday Calendar {currentYear}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {holidays.map(h => (
              <div key={h.id} style={{ 
                padding: 16, border: '1px solid var(--border)', borderRadius: 12,
                background: 'var(--bg-secondary)', borderLeft: '4px solid var(--primary)'
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{h.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{h.type} HOLIDAY</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
