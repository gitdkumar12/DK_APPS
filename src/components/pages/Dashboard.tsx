'use client';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { formatCommentTime } from '@/components/common/CommentsSection';
import {
  FolderKanban, ClipboardList, Scale, AlertTriangle,
  TrendingUp, Users, CheckCircle, Clock, MapPin
} from 'lucide-react';

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` :
  n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;

// ── 1. ADMIN DASHBOARD ──────────────────────────────────────
function AdminDashboard({ onNavigate, stats, recentTasks, overdueTasks, pendingReview, recentComments }: any) {
  const dailyPerformance = LocalDbService.getValuationDailyPerformance();
  const valuations = LocalDbService.getValuations();
  
  // MTD completed valuations
  const completedValuations = valuations.filter(v => v.status === 'FEES_SETTLED' || v.status === 'DISPATCHED_TO_BANK');
  const mtdEarnings = completedValuations.reduce((s, v) => s + v.totalAmount, 0);
  const totalValValue = valuations.reduce((s, v) => s + v.finalAssessedValue, 0);

  const fmtCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Welcome back, Piyush Ji</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · Full operational overview'}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card indigo" style={{ cursor: 'pointer' }} onClick={() => onNavigate('projects')}>
          <span className="stat-delta up">+2 new</span>
          <div className="stat-icon indigo"><FolderKanban size={20} /></div>
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">Active Projects</div>
        </div>

        <div className="stat-card amber" style={{ cursor: 'pointer' }} onClick={() => onNavigate('tasks')}>
          {stats.overdueTasks > 0 && <span className="stat-delta down">{stats.overdueTasks} overdue</span>}
          <div className="stat-icon amber"><ClipboardList size={20} /></div>
          <div className="stat-value">{stats.openTasks}</div>
          <div className="stat-label">Open Tasks</div>
        </div>

        <div className="stat-card emerald" style={{ cursor: 'pointer' }} onClick={() => onNavigate('valuation')}>
          <div className="stat-icon emerald"><Scale size={20} /></div>
          <div className="stat-value">{stats.totalValuationCases}</div>
          <div className="stat-label">Valuation Cases</div>
        </div>

        <div className="stat-card rose">
          <span className="stat-delta up">This month</span>
          <div className="stat-icon rose"><TrendingUp size={20} /></div>
          <div className="stat-value">{fmt(stats.monthlyRevenue)}</div>
          <div className="stat-label">Monthly Revenue</div>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0, gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Recent Tasks */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Recent Task Activity</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('tasks')}>
                View All
              </button>
            </div>
            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <span className="empty-title">No tasks yet</span>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 120 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {t.projectName}
                        </span>
                      </td>
                      <td>{t.majorTask}</td>
                      <td>
                        <span className={`badge badge-${t.status === 'OPEN' ? 'open' : t.status === 'PENDING_REVIEW' ? 'pending' : 'closed'}`}>
                          {t.status === 'PENDING_REVIEW' ? 'Review' : t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Attention Checklist */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} style={{ color: 'var(--accent-rose)' }} />
                Needs Attention
              </span>
            </div>
            {overdueTasks.length === 0 && pendingReview.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={32} style={{ color: 'var(--accent-emerald)', opacity: 0.8 }} />
                <span className="empty-title">All caught up!</span>
              </div>
            ) : (
              <table>
                <thead><tr><th>Project</th><th>Task</th><th>Employee</th><th>Status</th></tr></thead>
                <tbody>
                  {[...pendingReview, ...overdueTasks]
                    .filter((t, idx, self) => self.findIndex(x => x.id === t.id) === idx)
                    .slice(0, 5)
                    .map((t: any) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.projectName}</td>
                        <td>{t.majorTask}</td>
                        <td>{t.assignedToName.split(' ')[0]}</td>
                        <td>
                          <span className={`badge ${t.status === 'PENDING_REVIEW' ? 'badge-pending' : 'badge-open'}`}>
                            {t.status === 'PENDING_REVIEW' ? 'Review' : 'Overdue'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Valuation Earnings & Daily Performance Tracker */}
        <div className="table-container">
          <div className="table-header" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
            <div>
              <span className="table-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}>
                <span>📈</span> Valuation Volume & Revenue Tracker
              </span>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Billed valuation details (MTD Portfolio Assessed: {fmtCurrency(totalValValue)} · MTD Billing: {fmtCurrency(mtdEarnings)})
              </p>
            </div>
          </div>
          {dailyPerformance.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 8px' }}>
              <span className="empty-title">No daily valuation earnings logged</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, padding: 20 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th style={{ textAlign: 'center' }}>Valuations Completed</th>
                      <th style={{ textAlign: 'right' }}>Fees Earned</th>
                      <th>Revenue Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyPerformance.map((d, idx) => {
                      const maxEarnings = Math.max(...dailyPerformance.map(x => x.earnings)) || 1;
                      const pct = Math.round((d.earnings / maxEarnings) * 100);
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                            {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-indigo-light)' }}>{d.count}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'Outfit' }}>{fmtCurrency(d.earnings)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: 6, borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                                <div style={{ width: `${pct}%`, background: 'var(--gradient-emerald)', height: '100%', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 25, textAlign: 'right' }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MTD Fees Collected</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent-indigo-light)', fontFamily: 'Outfit', marginTop: 4 }}>
                    {fmtCurrency(mtdEarnings)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Billed across {completedValuations.length} completed cases
                  </div>
                </div>
                
                <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Valuation Fee</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'Outfit', marginTop: 4 }}>
                    {completedValuations.length > 0 ? fmtCurrency(Math.round(mtdEarnings / completedValuations.length)) : '₹0'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Average billing per dispatched report
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Snapshot */}
        <div className="table-container">
          <div className="table-header">
            <span className="table-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} />Employee Snapshot
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('analytics')}>
              Full Analytics →
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Total Tasks</th>
                <th>Open</th>
                <th>Pending Review</th>
                <th>Overdue</th>
                <th>Closed</th>
                <th>Valuation Cases</th>
              </tr>
            </thead>
            <tbody>
              {LocalDbService.getEmployeeMetrics().map(m => (
                <tr key={m.userId}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {m.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </span>
                      {m.name}
                    </span>
                  </td>
                  <td>{m.totalTasks}</td>
                  <td><span className="badge badge-open">{m.openTasks}</span></td>
                  <td><span className="badge badge-pending">{m.pendingReview}</span></td>
                  <td>
                    {m.overdueTasks > 0
                      ? <span className="badge badge-open" style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)' }}>{m.overdueTasks}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td><span className="badge badge-closed">{m.closedTasks}</span></td>
                  <td>{m.valuationCases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Comments Feed */}
        <div className="table-container">
          <div className="table-header">
            <span className="table-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>💬</span> Recent Comments & Activity Log
            </span>
          </div>
          {recentComments.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 24px' }}>
              <span className="empty-title" style={{ fontSize: 13 }}>No recent comments logged</span>
            </div>
          ) : (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentComments.map((act: any, idx: number) => {
                const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: act.comment.authorRole === 'ADMIN' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0
                    }}>
                      {getInitials(act.comment.authorName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {act.comment.authorName}
                          <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}> commented on </span>
                          <span style={{ color: 'var(--accent-indigo-light)', fontWeight: 500, fontSize: 12 }}>
                            {act.targetName}
                          </span>
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatCommentTime(act.comment.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 12.5,
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.01)',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.02)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        marginTop: 4
                      }}>
                        {act.comment.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── 2. VALUATION EMPLOYEE DASHBOARD ──────────────────────────
function ValuationEmployeeDashboard({ onNavigate, currentUser, valuations, recentComments }: any) {
  const pendingInspections = valuations.filter((v: any) => v.status === 'CASE_INITIATED').length;
  const draftsReady = valuations.filter((v: any) => v.status === 'DRAFT_READY' || v.status === 'SITE_INSPECTED').length;
  const completedCases = valuations.filter((v: any) => v.status === 'FEES_SETTLED' || v.status === 'DISPATCHED_TO_BANK').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Hello, {currentUser?.name.split(' ')[0]}</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · Valuation Workspace Dashboard'}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card indigo" style={{ cursor: 'pointer' }} onClick={() => onNavigate('valuation')}>
          <div className="stat-icon indigo"><Scale size={20} /></div>
          <div className="stat-value">{valuations.length}</div>
          <div className="stat-label">Assigned Cases</div>
        </div>

        <div className="stat-card amber" style={{ cursor: 'pointer' }} onClick={() => onNavigate('valuation')}>
          <div className="stat-icon amber"><Clock size={20} /></div>
          <div className="stat-value">{pendingInspections}</div>
          <div className="stat-label">Pending Inspections</div>
        </div>

        <div className="stat-card violet" style={{ cursor: 'pointer' }} onClick={() => onNavigate('valuation')}>
          <div className="stat-icon violet"><ClipboardList size={20} /></div>
          <div className="stat-value">{draftsReady}</div>
          <div className="stat-label">Drafts / Inspected</div>
        </div>

        <div className="stat-card emerald" style={{ cursor: 'pointer' }} onClick={() => onNavigate('valuation')}>
          <div className="stat-icon emerald"><CheckCircle size={20} /></div>
          <div className="stat-value">{completedCases}</div>
          <div className="stat-label">Completed / Dispatched</div>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0, gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          
          {/* Active Cases Pipeline */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">My Active Case Pipeline</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('valuation')}>
                View All
              </button>
            </div>
            {valuations.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">⚖️</span>
                <span className="empty-title">No cases assigned</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Bank</th>
                      <th>Branch</th>
                      <th>Visitor</th>
                      <th>Property & Site Details</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valuations.slice(0, 5).map((v: any) => (
                      <tr key={v.id}>
                        <td>
                          <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo-light)', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            {v.bankName}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 12 }}>
                          {v.branch || '—'}
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 12 }}>
                          {v.visitor || '—'}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.propertyDetail || 'Property Valuation'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <MapPin size={10} style={{ color: 'var(--accent-indigo-light)' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }} title={v.siteAddress}>
                              {v.siteAddress || '—'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${v.status === 'FEES_SETTLED' ? 'settled' : v.status === 'DISPATCHED_TO_BANK' ? 'dispatched' : v.status === 'DRAFT_READY' ? 'draft' : v.status === 'SITE_INSPECTED' ? 'inspected' : 'initiated'}`}>
                            {v.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Recent Comments & Updates</span>
            </div>
            {recentComments.length === 0 ? (
              <div className="empty-state">
                <span className="empty-title">No recent updates logged</span>
              </div>
            ) : (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
                {recentComments.map((act: any, idx: number) => {
                  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: act.comment.authorRole === 'ADMIN' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0
                      }}>
                        {getInitials(act.comment.authorName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.comment.authorName}</span>
                          {' commented on '}<span style={{ color: 'var(--accent-indigo-light)' }}>{act.targetName.split(' ')[0]}</span>
                          {' · '}{formatCommentTime(act.comment.createdAt)}
                        </div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.015)',
                          padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.02)'
                        }}>{act.comment.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── 3. ARCHITECTURE EMPLOYEE DASHBOARD ───────────────────────
function ArchitectureEmployeeDashboard({ onNavigate, currentUser, stats, recentTasks, overdueTasks, pendingReview, recentComments, now }: any) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Hello, {currentUser?.name.split(' ')[0]}</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · Architecture Workspace Dashboard'}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card indigo" style={{ cursor: 'pointer' }} onClick={() => onNavigate('my-tasks')}>
          <div className="stat-icon indigo"><ClipboardList size={20} /></div>
          <div className="stat-value">{stats.openTasks}</div>
          <div className="stat-label">Assigned Open Tasks</div>
        </div>

        <div className="stat-card rose" style={{ cursor: 'pointer' }} onClick={() => onNavigate('my-tasks')}>
          <div className="stat-icon rose"><AlertTriangle size={20} /></div>
          <div className="stat-value">{stats.overdueTasks}</div>
          <div className="stat-label">Overdue Tasks</div>
        </div>

        <div className="stat-card emerald" style={{ cursor: 'pointer' }} onClick={() => onNavigate('my-tasks')}>
          <div className="stat-icon emerald"><CheckCircle size={20} /></div>
          <div className="stat-value">{stats.tasksClosedThisMonth}</div>
          <div className="stat-label">Closed This Month</div>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0, gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          
          {/* Work Log Tasks */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">My Recent Tasks</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('my-tasks')}>
                View Board
              </button>
            </div>
            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <span className="empty-title">No tasks logged yet</span>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Target Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.projectName}</td>
                      <td>{t.majorTask}</td>
                      <td>
                        <span className={`badge badge-${t.status === 'OPEN' ? 'open' : t.status === 'PENDING_REVIEW' ? 'pending' : 'closed'}`}>
                          {t.status === 'PENDING_REVIEW' ? 'Review' : t.status}
                        </span>
                      </td>
                      <td style={{ color: t.targetClosingDate < now && t.status !== 'CLOSED' ? 'var(--accent-rose)' : undefined }}>
                        {t.targetClosingDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Task Updates Log */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Recent Task Comments</span>
            </div>
            {recentComments.length === 0 ? (
              <div className="empty-state">
                <span className="empty-title">No recent task comments</span>
              </div>
            ) : (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
                {recentComments.map((act: any, idx: number) => {
                  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: act.comment.authorRole === 'ADMIN' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0
                      }}>
                        {getInitials(act.comment.authorName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.comment.authorName}</span>
                          {' commented on '}<span style={{ color: 'var(--accent-indigo-light)' }}>{act.targetName}</span>
                          {' · '}{formatCommentTime(act.comment.createdAt)}
                        </div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.015)',
                          padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.02)'
                        }}>{act.comment.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── MAIN DASHBOARD ENTRY POINT ──────────────────────────────
interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { currentUser, isAdmin } = useApp();
  const stats = LocalDbService.getDashboardStats(currentUser?.id, currentUser?.role);
  const tasks = LocalDbService.getTasks(currentUser?.id, currentUser?.role);
  const valuations = LocalDbService.getValuations(currentUser?.id, currentUser?.role);
  const now = new Date().toISOString().split('T')[0];

  const recentTasks = tasks.slice(-5).reverse();
  const recentComments = LocalDbService.getRecentComments(currentUser?.id, currentUser?.role, 5);
  const overdueTasks = tasks.filter(t => t.status !== 'CLOSED' && t.targetClosingDate < now);
  const pendingReview = tasks.filter(t => t.status === 'PENDING_REVIEW');

  if (isAdmin) {
    return (
      <AdminDashboard
        onNavigate={onNavigate}
        stats={stats}
        recentTasks={recentTasks}
        overdueTasks={overdueTasks}
        pendingReview={pendingReview}
        recentComments={recentComments}
      />
    );
  }

  if (currentUser?.department === 'Valuation') {
    return (
      <ValuationEmployeeDashboard
        onNavigate={onNavigate}
        currentUser={currentUser}
        valuations={valuations}
        recentComments={recentComments}
      />
    );
  }

  return (
    <ArchitectureEmployeeDashboard
      onNavigate={onNavigate}
      currentUser={currentUser}
      stats={stats}
      recentTasks={recentTasks}
      overdueTasks={overdueTasks}
      pendingReview={pendingReview}
      recentComments={recentComments}
      now={now}
    />
  );
}
