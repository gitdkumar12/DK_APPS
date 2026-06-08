import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { User, AccountRecord } from '@/types';
import {
  IndianRupee, TrendingUp, Award, Save, Plus,
  BarChart3, Users, Briefcase, Percent, ArrowUpRight,
  PiggyBank, Calendar, Settings
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

const COLORS = [
  'var(--accent-indigo)',
  'var(--accent-emerald)',
  'var(--accent-amber)',
  'var(--accent-rose)',
  'var(--accent-sky)',
  'var(--accent-violet)'
];

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const CustomTooltipPayroll = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || p.stroke || 'var(--text-primary)', marginBottom: 2 }}>
          {p.name}: {
            p.name.includes('Ratio') || p.name.includes('Efficiency') || p.name.includes('Workload')
              ? p.value.toLocaleString()
              : `₹${p.value.toLocaleString()}`
          }
        </div>
      ))}
    </div>
  );
};

export default function AccountsPage() {
  const { currentUser, isAdmin, refreshKey } = useApp();
  const [employees, setEmployees] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'manage'>('analytics');

  // Editing state
  const [baseSalary, setBaseSalary] = useState(0);
  const [increments, setIncrements] = useState<{date: string, amount: number, reason: string}[]>([]);
  const [bonuses, setBonuses] = useState<{date: string, amount: number, reason: string}[]>([]);

  useEffect(() => {
    // Accounts page is for Admins and Accounts department
    if (!isAdmin && currentUser?.department !== 'Accounts') return;

    const users = LocalDbService.getUsers().filter(u => u.role === 'EMPLOYEE' || u.id === currentUser?.id);
    const accs = LocalDbService.getAccounts();
    
    setEmployees(users);
    setAccounts(accs);
  }, [currentUser, isAdmin, refreshKey]);

  const handleSelectUser = (user: User, accs: AccountRecord[] = accounts) => {
    setSelectedUser(user);
    const acc = accs.find(a => a.userId === user.id);
    if (acc) {
      setBaseSalary(acc.baseSalary);
      setIncrements([...acc.increments]);
      setBonuses([...acc.bonuses]);
    } else {
      setBaseSalary(0);
      setIncrements([]);
      setBonuses([]);
    }
  };

  const handleSaveAccount = () => {
    if (!selectedUser) return;
    
    const acc: AccountRecord = {
      id: `acc_${selectedUser.id}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      baseSalary,
      effectiveDate: new Date().toISOString().split('T')[0],
      increments,
      bonuses
    };
    
    LocalDbService.saveAccount(acc);
    const updatedAccounts = LocalDbService.getAccounts();
    setAccounts(updatedAccounts);
    alert('Account details saved successfully!');
  };

  const addIncrement = () => {
    setIncrements([...increments, { date: new Date().toISOString().split('T')[0], amount: 0, reason: '' }]);
  };

  const addBonus = () => {
    setBonuses([...bonuses, { date: new Date().toISOString().split('T')[0], amount: 0, reason: '' }]);
  };

  if (!isAdmin && currentUser?.department !== 'Accounts') {
    return (
      <div className="page-container" style={{ padding: 24 }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view the Accounts module.</p>
      </div>
    );
  }

  // ─── Analytics Dashboard Computations ──────────────────────────────────────────

  // 1. Total Monthly Outflow
  const totalMonthlyPayroll = accounts.reduce((sum, acc) => {
    const incrementsSum = acc.increments.reduce((s, inc) => s + inc.amount, 0);
    return sum + acc.baseSalary + incrementsSum;
  }, 0);

  // 2. Projected Annual Outflow (Monthly * 12 + YTD Bonuses)
  const currentYear = 2026;
  const ytdBonuses = accounts.reduce((sum, acc) => {
    const bonusSum = acc.bonuses
      .filter(b => b.date.startsWith(String(currentYear)))
      .reduce((s, b) => s + b.amount, 0);
    return sum + bonusSum;
  }, 0);
  const projectedAnnualPayroll = (totalMonthlyPayroll * 12) + ytdBonuses;

  // 3. Average Salary
  const employeeAccounts = accounts.filter(acc => {
    const user = employees.find(e => e.id === acc.userId);
    return user && user.role === 'EMPLOYEE';
  });
  const avgMonthlySalary = employeeAccounts.length > 0
    ? employeeAccounts.reduce((sum, acc) => {
        const incrementsSum = acc.increments.reduce((s, inc) => s + inc.amount, 0);
        return sum + acc.baseSalary + incrementsSum;
      }, 0) / employeeAccounts.length
    : 0;

  // 4. Cost to Revenue Ratio
  const revenue = LocalDbService.getRevenue();
  const latestRevenueRecord = revenue[revenue.length - 1];
  const latestRevenue = latestRevenueRecord?.totalRevenue ?? 0;
  const payrollToRevenueRatio = latestRevenue > 0 ? (totalMonthlyPayroll / latestRevenue) * 100 : 0;

  // 6. Top Earners Breakdown
  const topEarners = accounts
    .map(acc => {
      const user = employees.find(e => e.id === acc.userId);
      const effSalary = acc.baseSalary + acc.increments.reduce((s, inc) => s + inc.amount, 0);
      return {
        name: user?.name.split(' ')[0] || acc.userName.split(' ')[0],
        salary: effSalary,
      };
    })
    .sort((a, b) => b.salary - a.salary)
    .slice(0, 5);

  // 7. Workload vs Compensation Chart
  const metrics = LocalDbService.getEmployeeMetrics();
  const workloadVsCompensation = accounts
    .filter(acc => {
      const user = employees.find(e => e.id === acc.userId);
      return user && user.role === 'EMPLOYEE'; // Only show employees
    })
    .map(acc => {
      const user = employees.find(e => e.id === acc.userId);
      const effSalary = acc.baseSalary + acc.increments.reduce((s, inc) => s + inc.amount, 0);
      const metric = metrics.find(m => m.userId === acc.userId);
      const closedTasks = metric?.closedTasks || 0;
      const valuationCases = metric?.valuationCases || 0;
      
      // Workload Index = Closed Tasks + 2 * Valuation cases
      const workloadIndex = closedTasks + (valuationCases * 2);
      
      return {
        name: user?.name.split(' ')[0] || acc.userName.split(' ')[0],
        Salary: effSalary,
        'Workload Index': workloadIndex,
      };
    })
    .sort((a, b) => b['Workload Index'] - a['Workload Index']);

  // 8. Department Distribution
  const deptDistributionRaw = accounts.reduce((acc, a) => {
    const user = employees.find(e => e.id === a.userId);
    const dept = user?.department || 'Other';
    const effSalary = a.baseSalary + a.increments.reduce((s, inc) => s + inc.amount, 0);
    acc[dept] = (acc[dept] || 0) + effSalary;
    return acc;
  }, {} as Record<string, number>);

  const deptDistribution = Object.entries(deptDistributionRaw).map(([name, value]) => ({
    name,
    value,
  }));

  // 9. Monthly Payroll Cost vs Revenue Timeline
  const getPayrollForMonth = (monthStr: string, year: number): number => {
    const monthMap: Record<string, number> = {
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5
    };
    const m = monthMap[monthStr] ?? 0;
    const targetDate = new Date(year, m + 1, 0);

    return accounts.reduce((total, acc) => {
      const effectiveDate = new Date(acc.effectiveDate);
      if (effectiveDate > targetDate) return total;

      const incrementsSum = acc.increments
        .filter(inc => new Date(inc.date) <= targetDate)
        .reduce((sum, inc) => sum + inc.amount, 0);

      return total + acc.baseSalary + incrementsSum;
    }, 0);
  };

  const payrollVsRevenueData = revenue.map(rev => {
    const payrollCost = getPayrollForMonth(rev.month, rev.year);
    return {
      month: `${rev.month} ${rev.year % 100}`,
      Revenue: rev.totalRevenue,
      Payroll: payrollCost,
    };
  });

  // 10. Leaderboard details
  const leaderboardData = accounts.map(acc => {
    const user = employees.find(e => e.id === acc.userId);
    const effSalary = acc.baseSalary + acc.increments.reduce((s, inc) => s + inc.amount, 0);
    const totalInc = acc.increments.reduce((s, inc) => s + inc.amount, 0);
    const totalBonuses = acc.bonuses
      .filter(b => b.date.startsWith(String(currentYear)))
      .reduce((s, b) => s + b.amount, 0);
    const metric = metrics.find(m => m.userId === acc.userId);
    const workloadIndex = (metric?.closedTasks || 0) + ((metric?.valuationCases || 0) * 2);
    
    // Pay Efficiency = Workload Index / (Effective Salary / 10000)
    const payEfficiency = effSalary > 0
      ? Number(((workloadIndex / effSalary) * 10000).toFixed(2))
      : 0;

    return {
      id: acc.id,
      name: user?.name || acc.userName,
      department: user?.department || 'Other',
      baseSalary: acc.baseSalary,
      increments: totalInc,
      bonuses: totalBonuses,
      effectiveSalary: effSalary,
      workloadIndex,
      payEfficiency,
      role: user?.role || 'EMPLOYEE'
    };
  }).sort((a, b) => b.effectiveSalary - a.effectiveSalary);

  const activeEmployeeSalary = baseSalary + increments.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <div className="page-container" style={{ padding: 24, background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Accounts & Payroll</h1>
          <p style={{ color: 'var(--text-muted)' }}>Financial analysis, employee salaries, and pay performance metrics</p>
        </div>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setSelectedUser(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <BarChart3 size={16} /> Payroll Analytics
          </button>
          <button 
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manage'); setSelectedUser(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Settings size={16} /> Manage Salaries
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {[
              { icon: IndianRupee, label: 'Total Monthly Outflow', value: `₹${totalMonthlyPayroll.toLocaleString()}`, color: 'indigo', sub: 'Active monthly payroll' },
              { icon: PiggyBank, label: 'Projected Annual cost', value: `₹${projectedAnnualPayroll.toLocaleString()}`, color: 'emerald', sub: '12M base + YTD bonuses' },
              { icon: Users, label: 'Avg Monthly Salary', value: `₹${Math.round(avgMonthlySalary).toLocaleString()}`, color: 'violet', sub: 'Employee base average' },
              { icon: Percent, label: 'Payroll-to-Revenue', value: `${payrollToRevenueRatio.toFixed(1)}%`, color: 'amber', sub: `Of ${latestRevenueRecord?.month ?? 'latest'} revenue` },
              { icon: Award, label: 'YTD Bonuses Paid', value: `₹${ytdBonuses.toLocaleString()}`, color: 'rose', sub: `Distributed in ${currentYear}` }
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`}><s.icon size={18} /></div>
                <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Row 1 Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            
            {/* Payroll vs Revenue Line Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Monthly Payroll vs. Business Revenue</div>
                  <div className="chart-subtitle">Cost burden tracking against monthly turnover</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={payrollVsRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                  <Tooltip content={<CustomTooltipPayroll />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Revenue" stroke="var(--accent-emerald)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Payroll" stroke="var(--accent-rose)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Department Split Pie */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Department Allocation</div>
                  <div className="chart-subtitle">Monthly payroll share by section</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deptDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {deptDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmt(v as number)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {deptDistribution.map((s, idx) => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[idx % COLORS.length], display: 'inline-block' }} />
                      <span style={{ color: 'var(--text-muted)' }}>{s.name}</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit', color: COLORS[idx % COLORS.length] }}>
                      {fmt(s.value)} ({((s.value / (totalMonthlyPayroll || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Row 2 Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            
            {/* Workload vs Compensation Composed Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Workload vs. Monthly Salary</div>
                  <div className="chart-subtitle">Evaluating compensation against tasks and valuation output</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={workloadVsCompensation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Workload Index', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: {fontSize: 10} }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Salary (₹)', angle: 90, position: 'insideRight', fill: '#94a3b8', style: {fontSize: 10} }} tickFormatter={v => `${v/1000}k`} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipPayroll />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="Workload Index" fill="var(--accent-indigo)" radius={[4, 4, 0, 0]} barSize={30} />
                  <Line yAxisId="right" type="monotone" dataKey="Salary" stroke="var(--accent-rose)" strokeWidth={2} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>
                *Workload Index = Closed Tasks + (Valuation Cases × 2). Higher ratio represents greater output.
              </div>
            </div>

            {/* Top Earners Bar Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Salary Leaderboard (Top 5)</div>
                  <div className="chart-subtitle">Highest effective monthly salaries</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topEarners} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltipPayroll />} />
                  <Bar dataKey="salary" name="Effective Salary" fill="var(--accent-violet)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Salary Leaderboard Table */}
          <div className="table-container">
            <div className="table-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="table-title">Full Payroll & Efficiency Index</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Analyzing payout breakdown vs. pay efficiency (Workload points generated per ₹10,000 salary)
                </span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Employee</th>
                  <th>Department</th>
                  <th>Base Salary</th>
                  <th>Total Increments</th>
                  <th>Bonuses (YTD)</th>
                  <th>Effective Salary</th>
                  <th style={{ textAlign: 'center' }}>Workload Index</th>
                  <th style={{ textAlign: 'center' }}>Pay Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>{emp.name}</td>
                    <td>
                      <span className={`badge ${
                        emp.department === 'Architecture' ? 'badge-open' :
                        emp.department === 'Valuation' ? 'badge-dispatched' :
                        emp.department === 'Accounts' ? 'badge-pending' : 'badge-inactive'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {emp.department}
                      </span>
                    </td>
                    <td>₹{emp.baseSalary.toLocaleString()}</td>
                    <td style={{ color: emp.increments > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {emp.increments > 0 ? `+₹${emp.increments.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ color: emp.bonuses > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                      {emp.bonuses > 0 ? `₹${emp.bonuses.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{emp.effectiveSalary.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: emp.workloadIndex > 0 ? 'var(--accent-indigo-light)' : 'var(--text-muted)' }}>
                      {emp.workloadIndex}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {emp.role === 'ADMIN' ? (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A (Admin)</span>
                      ) : emp.department === 'Accounts' ? (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A (Operations)</span>
                      ) : (
                        <span style={{
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: emp.payEfficiency > 1.5 ? 'rgba(16, 185, 129, 0.12)' : emp.payEfficiency > 0.5 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                          color: emp.payEfficiency > 1.5 ? 'var(--accent-emerald)' : emp.payEfficiency > 0.5 ? 'var(--accent-indigo-light)' : 'var(--text-muted)'
                        }}>
                          {emp.payEfficiency} pts
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* Manage Compensation View */
        !selectedUser ? (
          /* Show Directory Table of All Employee Salaries */
          <div className="table-container">
            <div className="table-header" style={{ borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="table-title">Employee Compensation Directory</span>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  List of all employees and their base/effective salaries. Select Edit to modify compensation structures.
                </p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Employee</th>
                  <th>Department</th>
                  <th>Base Salary</th>
                  <th>Total Increments</th>
                  <th>Bonuses (YTD)</th>
                  <th>Effective Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const acc = accounts.find(a => a.userId === emp.id);
                  const base = acc?.baseSalary ?? 0;
                  const incSum = acc?.increments.reduce((s, i) => s + i.amount, 0) ?? 0;
                  const bonSum = acc?.bonuses.reduce((s, b) => s + b.amount, 0) ?? 0;
                  const effective = base + incSum;
                  
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>{emp.name}</td>
                      <td>
                        <span className={`badge ${
                          emp.department === 'Architecture' ? 'badge-open' :
                          emp.department === 'Valuation' ? 'badge-dispatched' :
                          emp.department === 'Accounts' ? 'badge-pending' : 'badge-inactive'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {emp.department}
                        </span>
                      </td>
                      <td>₹{base.toLocaleString()}</td>
                      <td style={{ color: incSum > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                        {incSum > 0 ? `+₹${incSum.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ color: bonSum > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                        {bonSum > 0 ? `₹${bonSum.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{effective.toLocaleString()}</td>
                      <td>
                        <button 
                          onClick={() => handleSelectUser(emp)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: 6 }}
                        >
                          <Settings size={14} /> {acc ? 'Edit Salary' : 'Configure'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Show Editing Form for Selected Employee */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="btn btn-secondary" 
                style={{ padding: '8px 14px', fontSize: 13 }}
              >
                ← Back to Salaries List
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Top Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ padding: 10, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo-light)', borderRadius: 12 }}>
                      <IndianRupee size={20} />
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Current Salary</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>₹{activeEmployeeSalary.toLocaleString()}</div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ padding: 10, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', borderRadius: 12 }}>
                      <TrendingUp size={20} />
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Total Increments</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{increments.length}</div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ padding: 10, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', borderRadius: 12 }}>
                      <Award size={20} />
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Total Bonuses</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>₹{bonuses.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Editing Form */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>Payroll Information: {selectedUser.name}</h3>
                  <button onClick={handleSaveAccount} className="btn btn-primary" style={{ gap: 8 }}>
                    <Save size={18} /> Save Changes
                  </button>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Base Salary (Monthly)</label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
                    <input 
                      type="number" 
                      className="form-input" 
                      value={baseSalary} 
                      onChange={e => setBaseSalary(Number(e.target.value))}
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>

                {/* Increments Section */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={18} color="var(--accent-indigo-light)" /> Salary Increments
                    </h4>
                    <button onClick={addIncrement} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                      <Plus size={16} /> Add Increment
                    </button>
                  </div>
                  {increments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>No increments recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {increments.map((inc, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 2fr', gap: 12, alignItems: 'center' }}>
                          <input type="date" className="form-input" value={inc.date} onChange={e => {
                            const newIncs = [...increments]; newIncs[idx].date = e.target.value; setIncrements(newIncs);
                          }} />
                          <div style={{ position: 'relative' }}>
                            <IndianRupee size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                            <input type="number" className="form-input" placeholder="Amount" value={inc.amount} onChange={e => {
                              const newIncs = [...increments]; newIncs[idx].amount = Number(e.target.value); setIncrements(newIncs);
                            }} style={{ paddingLeft: 36 }} />
                          </div>
                          <input type="text" className="form-input" placeholder="Reason (e.g. Annual Appraisal)" value={inc.reason} onChange={e => {
                            const newIncs = [...increments]; newIncs[idx].reason = e.target.value; setIncrements(newIncs);
                          }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bonuses Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Award size={18} color="var(--accent-amber)" /> One-time Bonuses
                    </h4>
                    <button onClick={addBonus} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                      <Plus size={16} /> Add Bonus
                    </button>
                  </div>
                  {bonuses.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>No bonuses recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {bonuses.map((bonus, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 2fr', gap: 12, alignItems: 'center' }}>
                          <input type="date" className="form-input" value={bonus.date} onChange={e => {
                            const newBons = [...bonuses]; newBons[idx].date = e.target.value; setBonuses(newBons);
                          }} />
                          <div style={{ position: 'relative' }}>
                            <IndianRupee size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                            <input type="number" className="form-input" placeholder="Amount" value={bonus.amount} onChange={e => {
                              const newBons = [...bonuses]; newBons[idx].amount = Number(e.target.value); setBonuses(newBons);
                            }} style={{ paddingLeft: 36 }} />
                          </div>
                          <input type="text" className="form-input" placeholder="Reason (e.g. Diwali Bonus)" value={bonus.reason} onChange={e => {
                            const newBons = [...bonuses]; newBons[idx].reason = e.target.value; setBonuses(newBons);
                          }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
