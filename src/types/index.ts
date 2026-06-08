// ============================================================
// GT CONSULTANCY RAIPUR - TYPE DEFINITIONS
// Phase 1 — Core Entity Contracts
// ============================================================

export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface TicketComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  attachment?: {
    name: string;
    type: string;
    size: number;
    data: string; // Base64 data URL
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  department: 'Architecture' | 'Valuation' | 'Admin' | 'Accounts';
  joinDate: string;
  isActive: boolean;
}

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  siteAddress: string;
  siteLocation: string;
  totalValue: number;
  status: ProjectStatus;
  createdAt: string;
  description?: string;
}

export type TaskStatus = 'OPEN' | 'PENDING_REVIEW' | 'CLOSED';

export type MajorTask =
  | 'Approval Drawing'
  | 'Section + Site Level'
  | 'Elevation'
  | 'Electrical Dwg'
  | 'Chowk Development'
  | 'DWG Upload'
  | 'Tank Details'
  | '4th Floor'
  | 'Site Visit'
  | 'Meeting'
  | 'Other';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  majorTask: MajorTask;
  targetClosingDate: string;
  targetClosingDay: string;
  status: TaskStatus;
  remarks: string;
  siteVisit: boolean;
  visitLocation: string;
  assignedTo: string; // User ID
  assignedToName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  comments?: TicketComment[];
}

export type BankStatus = 'ACTIVE' | 'INACTIVE';

export interface Bank {
  id: string;
  name: string;
  shortName: string;
  templateFormat: string;
  contactPerson: string;
  contactEmail: string;
  status: BankStatus;
  casesThisYear: number;
  totalRevenue: number;
  createdAt: string;
  branches: string[];
}

export type ValuationStatus =
  | 'CASE_INITIATED'
  | 'SITE_INSPECTED'
  | 'DRAFT_READY'
  | 'DISPATCHED_TO_BANK'
  | 'FEES_SETTLED';

export type PropertyType =
  | 'Residential'
  | 'Commercial'
  | 'Industrial'
  | 'Agricultural'
  | 'Mixed Use';

export interface ValuationCase {
  id: string;
  bankId: string;
  bankName: string;
  siteAddress: string;
  geographicZone: string;
  landRatePerSqFt: number;
  builtUpAreaRate: number;
  builtUpArea: number;
  depreciation: number;
  finalAssessedValue: number;
  propertyType: PropertyType;
  status: ValuationStatus;
  assignedTo: string;
  assignedToName: string;
  branch: string;
  propertyDetail: string;
  visitor: string;
  fees: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  feesSettled: boolean;
  initiatedAt: string;
  siteInspectedAt?: string;
  draftReadyAt?: string;
  dispatchedAt?: string;
  settledAt?: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  comments?: TicketComment[];
}

export interface RevenueRecord {
  month: string;
  year: number;
  architectureRevenue: number;
  valuationRevenue: number;
  totalRevenue: number;
}

export interface EmployeeMetrics {
  userId: string;
  name: string;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  closedTasks: number;
  pendingReview: number;
  valuationCases: number;
}

export interface ExportFilter {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  bankId?: string;
  projectId?: string;
  status?: string;
}

export interface DashboardStats {
  totalProjects: number;
  openTasks: number;
  overdueTasks: number;
  totalValuationCases: number;
  pendingValuations: number;
  monthlyRevenue: number;
  totalEmployees: number;
  tasksClosedThisMonth: number;
}

// ============================================================
// Phase 2 — Accounts & HR Entities
// ============================================================

export interface AccountRecord {
  id: string;
  userId: string;
  userName: string;
  baseSalary: number;
  effectiveDate: string;
  increments: {
    date: string;
    amount: number;
    reason: string;
  }[];
  bonuses: {
    date: string;
    amount: number;
    reason: string;
  }[];
}

export interface LeaveQuota {
  userId: string;
  year: number;
  totalCL: number; // Casual Leave
  totalPL: number; // Privilege Leave
  totalSick: number; // Sick Leave
  usedCL: number;
  usedPL: number;
  usedSick: number;
}

export type LeaveType = 'CL' | 'PL' | 'SICK';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'PUBLIC' | 'COMPANY';
}
