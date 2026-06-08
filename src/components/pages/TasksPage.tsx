'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { ExportService } from '@/services/ExportService';
import { Task, MajorTask, TaskStatus, Project, User, TicketComment } from '@/types';
import { Plus, Download, X, MapPin, CheckCircle, ChevronDown } from 'lucide-react';
import CommentsSection from '@/components/common/CommentsSection';

const MAJOR_TASKS: MajorTask[] = [
  'Approval Drawing', 'Section + Site Level', 'Elevation', 'Electrical Dwg',
  'Chowk Development', 'DWG Upload', 'Tank Details', '4th Floor', 'Site Visit', 'Meeting', 'Other',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getDayFromDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1] ?? '';
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  OPEN: 'badge-open',
  PENDING_REVIEW: 'badge-pending',
  CLOSED: 'badge-closed',
};

interface TaskModalProps {
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
  projects: Project[];
  employees: User[];
  isAdmin: boolean;
  currentUserId: string;
}

function TaskModal({ onClose, onSave, task, projects, employees, isAdmin, currentUserId }: TaskModalProps) {
  const { currentUser } = useApp();
  const [comments, setComments] = useState<TicketComment[]>(task?.comments ?? []);
  const [form, setForm] = useState({
    projectId: task?.projectId ?? '',
    projectName: task?.projectName ?? '',
    date: task?.date ?? new Date().toISOString().split('T')[0],
    majorTask: (task?.majorTask ?? 'Approval Drawing') as MajorTask,
    targetClosingDate: task?.targetClosingDate ?? '',
    status: (task?.status ?? 'OPEN') as TaskStatus,
    remarks: task?.remarks ?? '',
    siteVisit: task?.siteVisit ?? false,
    visitLocation: task?.visitLocation ?? '',
    assignedTo: task?.assignedTo ?? currentUserId,
    assignedToName: task?.assignedToName ?? '',
  });

  const setField = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const handleProjectChange = (id: string) => {
    const proj = projects.find(p => p.id === id);
    setField('projectId', id);
    setField('projectName', proj?.name ?? '');
  };

  const handleEmployeeChange = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setField('assignedTo', id);
    setField('assignedToName', emp?.name ?? '');
  };

  const handleAddComment = (content: string, attachment?: TicketComment['attachment']) => {
    if (!task) return;
    const newComment: TicketComment = {
      id: `cmt_${Date.now()}`,
      authorId: currentUserId,
      authorName: currentUser?.name ?? 'Unknown',
      authorRole: currentUser?.role ?? 'EMPLOYEE',
      content,
      attachment,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    LocalDbService.updateTask({
      ...task,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!task) return;
    if (!confirm('Delete this comment?')) return;
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    LocalDbService.updateTask({
      ...task,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClosingDay = getDayFromDate(form.targetClosingDate);
    onSave({ ...form, targetClosingDay, comments });
  };

  const renderPipeline = () => {
    const steps: { status: TaskStatus; label: string; short: string }[] = [
      { status: 'OPEN', label: 'Open', short: 'Open' },
      { status: 'PENDING_REVIEW', label: 'Pending Review', short: 'In Review' },
      { status: 'CLOSED', label: 'Closed', short: 'Closed' }
    ];
    const currentStepIdx = ['OPEN', 'PENDING_REVIEW', 'CLOSED'].indexOf(form.status);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255, 255, 255, 0.02)', padding: '14px 20px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Task Status Lifecycle
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 4 }}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            const isDisabled = step.status === 'CLOSED' && !isAdmin;
            const labelColor = isActive ? 'var(--accent-indigo-light)' : isCompleted ? 'var(--accent-emerald)' : 'var(--text-muted)';
            const nodeBg = isActive ? 'rgba(99, 102, 241, 0.15)' : isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)';
            const nodeBorder = isActive ? '1px solid rgba(99, 102, 241, 0.3)' : isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)';

            return (
              <div key={step.status} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setField('status', step.status)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: labelColor,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    borderRadius: 8,
                    background: nodeBg,
                    border: nodeBorder,
                    flex: 1,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    opacity: isDisabled ? 0.4 : 1,
                    outline: 'none',
                  }}
                  title={isDisabled ? 'Only Admin can close tasks' : undefined}
                >
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{isCompleted ? '✓' : isActive ? '●' : `Step ${idx + 1}`}</span>
                  <span>{step.short}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      width: '100%',
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
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.date} onChange={e => setField('date', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Project</label>
          <select className="form-select" value={form.projectId} onChange={e => handleProjectChange(e.target.value)} required>
            <option value="">Select project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Major Task</label>
          <select className="form-select" value={form.majorTask} onChange={e => setField('majorTask', e.target.value)} required>
            {MAJOR_TASKS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Target Closing Date</label>
          <input type="date" className="form-input" value={form.targetClosingDate} onChange={e => setField('targetClosingDate', e.target.value)} />
        </div>
      </div>

      <div className="form-grid form-grid-2">
        {isAdmin && (
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-select" value={form.assignedTo} onChange={e => handleEmployeeChange(e.target.value)}>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={form.status}
            onChange={e => setField('status', e.target.value)}
            disabled={!isAdmin && form.status === 'CLOSED'}
          >
            <option value="OPEN">OPEN</option>
            <option value="PENDING_REVIEW">PENDING REVIEW</option>
            {isAdmin && <option value="CLOSED">CLOSED</option>}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Remarks</label>
        <textarea className="form-textarea" value={form.remarks} onChange={e => setField('remarks', e.target.value)} placeholder="Add any notes or remarks..." />
      </div>

      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 16 }}>
        <label className="checkbox-row" style={{ marginBottom: form.siteVisit ? 12 : 0 }}>
          <input type="checkbox" checked={form.siteVisit} onChange={e => setField('siteVisit', e.target.checked)} />
          <MapPin size={14} style={{ color: 'var(--accent-indigo-light)' }} />
          <span className="checkbox-label" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Site Visit Required</span>
        </label>
        {form.siteVisit && (
          <input
            type="text"
            className="form-input"
            placeholder="Enter visit location (e.g. Naya Raipur, NRDA Office)"
            value={form.visitLocation}
            onChange={e => setField('visitLocation', e.target.value)}
          />
        )}
      </div>
    </>
  );

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task Details' : 'New Task Log'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {renderPipeline()}
            {task ? (
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
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TasksPageProps {
  myTasksOnly?: boolean;
}

export default function TasksPage({ myTasksOnly = false }: TasksPageProps) {
  const { currentUser, isAdmin, refresh } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterEmployee, setFilterEmployee] = useState<string>('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const uid = myTasksOnly || !isAdmin ? currentUser?.id : undefined;
    const role = myTasksOnly || !isAdmin ? 'EMPLOYEE' : undefined;
    setTasks(LocalDbService.getTasks(uid, role));
    setProjects(LocalDbService.getProjects());
    setEmployees(LocalDbService.getUsers().filter(u => u.role === 'EMPLOYEE'));
  }, [currentUser, isAdmin, myTasksOnly]);

  const filtered = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterEmployee && t.assignedTo !== filterEmployee) return false;
    if (filterProject && t.projectId !== filterProject) return false;
    if (filterDateFrom && t.date < filterDateFrom) return false;
    if (filterDateTo && t.date > filterDateTo) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.projectName.toLowerCase().includes(s) ||
        t.majorTask.toLowerCase().includes(s) ||
        t.remarks.toLowerCase().includes(s) ||
        t.assignedToName.toLowerCase().includes(s);
    }
    return true;
  });

  const handleSave = (taskData: Partial<Task>) => {
    if (editTask) {
      LocalDbService.updateTask({ ...editTask, ...taskData, updatedAt: new Date().toISOString() });
    } else {
      const newTask: Task = {
        ...(taskData as any),
        id: `tsk_${Date.now()}`,
        createdBy: currentUser?.id ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      LocalDbService.addTask(newTask);
    }
    const uid = myTasksOnly || !isAdmin ? currentUser?.id : undefined;
    const role = myTasksOnly || !isAdmin ? 'EMPLOYEE' : undefined;
    setTasks(LocalDbService.getTasks(uid, role));
    setShowModal(false);
    setEditTask(null);
    refresh();
  };

  const handleClose = (task: Task) => {
    if (!isAdmin) return;
    LocalDbService.closeTask(task.id, currentUser?.id ?? '');
    setTasks(LocalDbService.getTasks());
    refresh();
  };

  const handleMarkReview = (task: Task) => {
    LocalDbService.updateTask({ ...task, status: 'PENDING_REVIEW', updatedAt: new Date().toISOString() });
    const uid = myTasksOnly || !isAdmin ? currentUser?.id : undefined;
    const role = myTasksOnly || !isAdmin ? 'EMPLOYEE' : undefined;
    setTasks(LocalDbService.getTasks(uid, role));
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this task?')) return;
    LocalDbService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    refresh();
  };

  const handleExport = () => {
    ExportService.exportTasks(filtered);
  };

  const now = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{myTasksOnly ? 'My Task Board' : 'Task Log'}</h1>
          <p className="page-subtitle">
            {myTasksOnly ? 'Your assigned tasks — mark complete for Admin review' : 'GTDS Daily Work Log Sheet — all team tasks'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0 }}>
        {/* Filters */}
        <div className="table-container">
          <div className="table-header">
            <div className="filter-bar">
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ minWidth: 200 }}
              />
              <input type="date" className="filter-input" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="From date" />
              <input type="date" className="filter-input" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="To date" />
              <select className="filter-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="CLOSED">Closed</option>
              </select>
              {isAdmin && !myTasksOnly && (
                <>
                  <select className="filter-input" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                    <option value="">All Employees</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  <select className="filter-input" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                    <option value="">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </>
              )}
              {(filterStatus || filterEmployee || filterProject || filterDateFrom || filterDateTo || search) && (
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setFilterStatus(''); setFilterEmployee(''); setFilterProject('');
                  setFilterDateFrom(''); setFilterDateTo(''); setSearch('');
                }}>
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {filtered.length} of {tasks.length} tasks
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <span className="empty-title">No tasks found</span>
              <span className="empty-sub">Try adjusting your filters or add a new task</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Major Task</th>
                    <th>Target Date</th>
                    <th>Target Day</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Visit</th>
                    {isAdmin && !myTasksOnly && <th>Assigned To</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const isOverdue = t.status !== 'CLOSED' && t.targetClosingDate < now;
                    return (
                      <tr key={t.id} style={{ background: isOverdue ? 'rgba(244,63,94,0.04)' : undefined }}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{i + 1}</td>
                        <td>{t.date}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 120 }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.projectName}>
                            {t.projectName}
                          </span>
                        </td>
                        <td>{t.majorTask}</td>
                        <td style={{ color: isOverdue ? 'var(--accent-rose)' : undefined, fontWeight: isOverdue ? 600 : undefined }}>
                          {t.targetClosingDate || '—'}
                          {isOverdue && ' ⚠'}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{t.targetClosingDay}</td>
                        <td><span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status === 'PENDING_REVIEW' ? 'REVIEW' : t.status}</span></td>
                        <td style={{ maxWidth: 160 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.remarks}>
                              {t.remarks || '—'}
                            </span>
                            {t.comments && t.comments.length > 0 && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 10,
                                color: 'var(--accent-indigo-light)',
                                background: 'rgba(99,102,241,0.1)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                width: 'fit-content',
                                fontWeight: 500
                              }}>
                                💬 {t.comments.length} update{t.comments.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {t.siteVisit
                            ? <span style={{ color: 'var(--accent-indigo-light)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={11} />{t.visitLocation || 'Yes'}
                              </span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </td>
                        {isAdmin && !myTasksOnly && <td>{t.assignedToName.split(' ')[0]}</td>}
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => { setEditTask(t); setShowModal(true); }}
                              title="Edit"
                            >Edit</button>
                            {t.status === 'OPEN' && !isAdmin && (
                              <button className="btn btn-sm" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-violet)', border: '1px solid rgba(139,92,246,0.3)' }}
                                onClick={() => handleMarkReview(t)}>
                                Submit
                              </button>
                            )}
                            {isAdmin && t.status === 'PENDING_REVIEW' && (
                              <button className="btn btn-emerald btn-sm" onClick={() => handleClose(t)}>
                                <CheckCircle size={12} /> Close
                              </button>
                            )}
                            {isAdmin && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)} title="Delete">
                                <X size={12} />
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
        <TaskModal
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
          task={editTask}
          projects={projects}
          employees={employees}
          isAdmin={isAdmin}
          currentUserId={currentUser?.id ?? ''}
        />
      )}
    </>
  );
}
