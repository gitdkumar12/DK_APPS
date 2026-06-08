'use client';
import { useState, useEffect } from 'react';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { RevenueRecord, EmployeeMetrics, LeaveRequest } from '@/types';
import { Download, TrendingUp, Clock, Users, BarChart2, CalendarDays } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = {
  architecture: '#6366f1',
  valuation: '#10b981',
  overdue: '#f43f5e',
  closed: '#10b981',
  open: '#f59e0b',
  pending: '#8b5cf6',
};

type Period = '3M' | '6M' | '1Y';

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const CustomTooltipRevenue = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [metrics, setMetrics] = useState<EmployeeMetrics[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [period, setPeriod] = useState<Period>('6M');
  const [revenueView, setRevenueView] = useState<'bar' | 'area'>('area');

  useEffect(() => {
    setRevenue(LocalDbService.getRevenue());
    setMetrics(LocalDbService.getEmployeeMetrics());
    setLeaveRequests(LocalDbService.getLeaveRequests());
  }, []);

  const periodMap: Record<Period, number> = { '3M': 3, '6M': 6, '1Y': 8 };
  const displayRevenue = revenue.slice(-periodMap[period]);

  const totalArchRevenue = displayRevenue.reduce((s, r) => s + r.architectureRevenue, 0);
  const totalValRevenue = displayRevenue.reduce((s, r) => s + r.valuationRevenue, 0);
  const totalRevenue = totalArchRevenue + totalValRevenue;

  const pieData = [
    { name: 'Architecture', value: totalArchRevenue },
    { name: 'Valuation', value: totalValRevenue },
  ];

  // TAT Data (mock based on valuation cases)
  const valuations = LocalDbService.getValuations();
  const tatData = (() => {
    const stages = ['CASE_INITIATED', 'SITE_INSPECTED', 'DRAFT_READY', 'DISPATCHED_TO_BANK', 'FEES_SETTLED'];
    return stages.map((s, i) => ({
      stage: s.replace(/_/g, ' '),
      count: valuations.filter(v => v.status === s).length,
      avgDays: [0, 3, 7, 12, 18][i],
    }));
  })();

  // Employee efficiency chart data
  const empChartData = metrics.map(m => ({
    name: m.name.split(' ')[0],
    'Open Tasks': m.openTasks,
    'Overdue': m.overdueTasks,
    'Closed': m.closedTasks,
    'Pending Review': m.pendingReview,
  }));

  // Bank & Branch Payment Stats
  const bankBranchStats = (() => {
    const agg: Record<string, { bank: string; branch: string; paid: number; pending: number; total: number }> = {};
    valuations.forEach(v => {
      const bankName = v.bankName || 'Unknown Bank';
      const branchName = v.branch || 'Unknown Branch';
      const key = `${bankName} (${branchName})`;
      const amt = v.totalAmount || 0;
      if (!agg[key]) {
        agg[key] = { bank: bankName, branch: branchName, paid: 0, pending: 0, total: 0 };
      }
      agg[key].total += amt;
      if (v.feesSettled) {
        agg[key].paid += amt;
      } else {
        agg[key].pending += amt;
      }
    });
    return Object.values(agg).sort((a, b) => b.total - a.total);
  })();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Analytics</h1>
          <p className="page-subtitle">Business intelligence & operational performance dashboard · Admin only</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => ExportService.exportEmployeeMetrics(metrics)}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0, gap: 24 }}>

        {/* KPI Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {[
            { icon: TrendingUp, label: 'Total Revenue (Period)', value: fmt(totalRevenue), color: 'emerald', sub: `${period} period` },
            { icon: BarChart2, label: 'Architecture Revenue', value: fmt(totalArchRevenue), color: 'indigo', sub: `${Math.round((totalArchRevenue / totalRevenue) * 100) || 0}% of total` },
            { icon: Users, label: 'Valuation Revenue', value: fmt(totalValRevenue), color: 'violet', sub: `${Math.round((totalValRevenue / totalRevenue) * 100) || 0}% of total` },
            { icon: Clock, label: 'Active Val. Cases', value: valuations.filter(v => v.status !== 'FEES_SETTLED').length, color: 'amber', sub: 'In pipeline' },
            { icon: CalendarDays, label: 'Pending Leaves', value: leaveRequests.filter(r => r.status === 'PENDING').length, color: 'rose', sub: 'Action required' },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className={`stat-icon ${s.color}`}><s.icon size={18} /></div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Revenue Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Revenue Performance</div>
                <div className="chart-subtitle">Architecture vs. Valuation monthly breakdown</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="tabs">
                  {(['3M', '6M', '1Y'] as Period[]).map(p => (
                    <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
                  ))}
                </div>
                <div className="tabs">
                  {[['area', '📈'], ['bar', '📊']].map(([v, icon]) => (
                    <button key={v} className={`tab ${revenueView === v ? 'active' : ''}`} onClick={() => setRevenueView(v as 'bar' | 'area')}>{icon}</button>
                  ))}
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              {revenueView === 'area' ? (
                <AreaChart data={displayRevenue}>
                  <defs>
                    <linearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.architecture} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.architecture} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.valuation} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.valuation} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                  <Tooltip content={<CustomTooltipRevenue />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="architectureRevenue" name="Architecture" stroke={COLORS.architecture} fill="url(#archGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="valuationRevenue" name="Valuation" stroke={COLORS.valuation} fill="url(#valGrad)" strokeWidth={2} />
                </AreaChart>
              ) : (
                <BarChart data={displayRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                  <Tooltip content={<CustomTooltipRevenue />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="architectureRevenue" name="Architecture" fill={COLORS.architecture} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="valuationRevenue" name="Valuation" fill={COLORS.valuation} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Revenue Split Pie */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Revenue Split</div>
                <div className="chart-subtitle">By income stream</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  <Cell fill={COLORS.architecture} />
                  <Cell fill={COLORS.valuation} />
                </Pie>
                <Tooltip formatter={(v: any) => fmt(v as number)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {[
                { label: 'Architecture', value: totalArchRevenue, color: COLORS.architecture },
                { label: 'Valuation', value: totalValRevenue, color: COLORS.valuation },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit', color: s.color }}>{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bank & Branch Payments Analytics */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Bank & Branch Valuation Fees Status</div>
              <div className="chart-subtitle">Completed (Settled) vs. Pending (Unpaid) gross amounts (including GST) by bank branch</div>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => ExportService.exportUnpaidValuations(valuations, true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={12} /> Export Unpaid List
            </button>
          </div>
          {bankBranchStats.length === 0 ? (
            <div className="empty-state">
              <span className="empty-title">No bank branch valuations recorded</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <div style={{ minHeight: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={bankBranchStats} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="branch" 
                      tick={({ x, y, payload }) => {
                        const data = bankBranchStats[payload.index];
                        const label = `${data.bank} - ${data.branch}`;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text 
                              x={0} 
                              y={0} 
                              dy={16} 
                              textAnchor="end" 
                              fill="#94a3b8" 
                              fontSize={9} 
                              transform="rotate(-25)"
                              fontWeight={500}
                            >
                              {label.length > 22 ? `${label.slice(0, 20)}...` : label}
                            </text>
                          </g>
                        );
                      }}
                      interval={0}
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fill: '#475569', fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={v => `₹${v / 1000}K`} 
                    />
                    <Tooltip 
                      formatter={(value: any, name: any) => [fmt(Number(value)), name === 'paid' ? 'Paid (Settled)' : 'Pending (Unpaid)']} 
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} 
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      formatter={(value) => value === 'paid' ? 'Paid (Settled)' : 'Pending (Unpaid)'}
                      wrapperStyle={{ fontSize: 12 }} 
                    />
                    <Bar dataKey="paid" name="paid" stackId="a" fill={COLORS.closed} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="pending" name="pending" stackId="a" fill={COLORS.overdue} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Branch Fee Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bankBranchStats.map((item, idx) => {
                    const pct = item.total > 0 ? Math.round((item.paid / item.total) * 100) : 0;
                    return (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{item.bank}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.branch}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button 
                              type="button" 
                              onClick={() => {
                                const list = valuations.filter(v => v.bankName === item.bank && v.branch === item.branch);
                                ExportService.exportUnpaidValuations(list, true);
                              }}
                              style={{ 
                                border: 'none', 
                                background: 'rgba(244,63,94,0.1)', 
                                color: 'var(--accent-rose)', 
                                cursor: 'pointer', 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                fontSize: 9, 
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                              title="Export Unpaid CSV"
                            >
                              📥 Unpaid
                            </button>
                            <span style={{ 
                              fontSize: 9, 
                              fontWeight: 700, 
                              color: pct === 100 ? 'var(--accent-emerald)' : pct > 0 ? 'var(--accent-indigo-light)' : 'var(--accent-rose)',
                              background: pct === 100 ? 'rgba(16,185,129,0.08)' : pct > 0 ? 'rgba(99,102,241,0.08)' : 'rgba(244,63,94,0.08)',
                              padding: '2px 6px',
                              borderRadius: 4
                            }}>
                              {pct}% Paid
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11, marginBottom: 6 }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Paid:</span>
                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginLeft: 4 }}>{fmt(item.paid)}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Pending:</span>
                            <span style={{ color: 'var(--accent-rose)', fontWeight: 600, marginLeft: 4 }}>{fmt(item.pending)}</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, background: 'var(--gradient-emerald)', height: '100%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Efficiency Matrix */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Employee Efficiency Matrix</div>
              <div className="chart-subtitle">Task distribution — open, overdue, pending review, closed per employee</div>
            </div>
          </div>
          {empChartData.length === 0 ? (
            <div className="empty-state"><span className="empty-title">No employee data</span></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={empChartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Open Tasks" fill={COLORS.open} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Overdue" fill={COLORS.overdue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Pending Review" fill={COLORS.pending} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Closed" fill={COLORS.closed} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* TAT Tracking */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Valuation TAT (Turnaround Time)</div>
                <div className="chart-subtitle">Cases by pipeline stage</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tatData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Cases" fill={COLORS.architecture} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Employee Performance Table</div>
                <div className="chart-subtitle">Tasks and valuations per team member</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => ExportService.exportEmployeeMetrics(metrics)}>
                <Download size={12} /> CSV
              </button>
            </div>
            <table style={{ width: '100%', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Employee</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Open</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Overdue</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Closed</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Val.</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>{m.name.split(' ')[0]}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>{m.totalTasks}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--accent-amber)', fontWeight: 600 }}>{m.openTasks}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: m.overdueTasks > 0 ? 'var(--accent-rose)' : 'var(--text-muted)', fontWeight: m.overdueTasks > 0 ? 700 : 400 }}>{m.overdueTasks}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--accent-emerald)', fontWeight: 600 }}>{m.closedTasks}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--accent-indigo-light)' }}>{m.valuationCases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
