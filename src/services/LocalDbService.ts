// ============================================================
// GT CONSULTANCY RAIPUR - LOCAL DATABASE SERVICE
// Phase 1 — localStorage-backed data persistence layer
// Phase 2 ready: Swap implementations with REST/GraphQL calls
//                without changing any consuming UI components.
// ============================================================

import {
  User, Project, Task, Bank, ValuationCase,
  RevenueRecord, DashboardStats, EmployeeMetrics,
  ExportFilter, TaskStatus, ValuationStatus, TicketComment,
  AccountRecord, LeaveQuota, LeaveRequest, Holiday, LeaveStatus
} from '@/types';

// ─── Seed Data (mirrors GTDS_WORKSHEET.xlsx) ─────────────────

const SEED_USERS: User[] = [
  {
    id: 'usr_admin_001',
    name: 'Piyush Raj Verma',
    email: 'piyush@gtconsultancy.in',
    password: 'GT@Admin2026',
    role: 'ADMIN',
    department: 'Admin',
    joinDate: '2020-01-15',
    isActive: true,
  },
  {
    id: 'usr_emp_001',
    name: 'Aman Verma',
    email: 'aman@gtconsultancy.in',
    password: 'GT@Aman2026',
    role: 'EMPLOYEE',
    department: 'Architecture',
    joinDate: '2022-03-01',
    isActive: true,
  },
  {
    id: 'usr_emp_002',
    name: 'Ravi Kumar',
    email: 'ravi@gtconsultancy.in',
    password: 'GT@Ravi2026',
    role: 'EMPLOYEE',
    department: 'Valuation',
    joinDate: '2023-06-15',
    isActive: true,
  },
  {
    id: 'usr_emp_003',
    name: 'Sneha Patel',
    email: 'sneha@gtconsultancy.in',
    password: 'GT@Sneha2026',
    role: 'EMPLOYEE',
    department: 'Architecture',
    joinDate: '2024-01-10',
    isActive: true,
  },
  {
    id: 'usr_acc_001',
    name: 'Neha Sharma',
    email: 'neha@gtconsultancy.in',
    password: 'GT@Neha2026',
    role: 'EMPLOYEE',
    department: 'Accounts',
    joinDate: '2021-08-01',
    isActive: true,
  },
];

const SEED_PROJECTS: Project[] = [
  { id: 'prj_001', name: 'SBLD', clientName: 'NRDA', siteAddress: 'Sector 27, Naya Raipur', siteLocation: 'Naya Raipur', totalValue: 850000, status: 'ACTIVE', createdAt: '2025-12-01', description: 'Smart Building Layout Design for NRDA' },
  { id: 'prj_002', name: 'CSIDC_WWH_USLAPUR', clientName: 'CSIDC', siteAddress: 'Uslapur Industrial Area', siteLocation: 'Uslapur', totalValue: 1200000, status: 'ACTIVE', createdAt: '2025-11-15', description: 'CSIDC Warehouse Works at Uslapur' },
  { id: 'prj_003', name: 'PHAL UDHYAN', clientName: 'Aman Sir', siteAddress: 'Korba Road, Korba', siteLocation: 'Korba', totalValue: 450000, status: 'ACTIVE', createdAt: '2025-12-20', description: 'Phal Udhyan Layout Design' },
  { id: 'prj_004', name: 'CSIDC_WWH', clientName: 'CSIDC', siteAddress: 'Koni Industrial Zone', siteLocation: 'Koni', totalValue: 980000, status: 'ACTIVE', createdAt: '2025-12-10', description: 'CSIDC WWH Main Branch' },
  { id: 'prj_005', name: 'VIJAY NAGAR + BSUP GARDEN', clientName: 'Municipal Corp', siteAddress: 'Vijay Nagar & Labhandi', siteLocation: 'Vijay Nagar', totalValue: 670000, status: 'ACTIVE', createdAt: '2026-01-01', description: 'Chowk Development Project' },
  { id: 'prj_006', name: 'CSIDC_WWH_KONI / USLA', clientName: 'CSIDC', siteAddress: 'Koni / Uslapur', siteLocation: 'Koni', totalValue: 750000, status: 'ACTIVE', createdAt: '2026-01-01', description: 'Elevation Design' },
  { id: 'prj_007', name: 'SBI ADDITIONAL FLOOR', clientName: 'SBI', siteAddress: 'Main Branch, Raipur', siteLocation: 'Raipur', totalValue: 320000, status: 'ACTIVE', createdAt: '2026-01-10', description: '4th Floor Extension Design' },
  { id: 'prj_008', name: 'NIGAM Z-09', clientName: 'Nagar Nigam', siteAddress: 'Zone 9, Raipur', siteLocation: 'Raipur', totalValue: 540000, status: 'ACTIVE', createdAt: '2026-01-13', description: 'Chowk Development Z-09' },
  { id: 'prj_009', name: 'SBILD', clientName: 'NRDA', siteAddress: 'Sector 28, Naya Raipur', siteLocation: 'Naya Raipur', totalValue: 910000, status: 'ACTIVE', createdAt: '2026-01-13', description: 'Smart Building Integrated Layout Design' },
];

const SEED_TASKS: Task[] = [
  { id: 'tsk_001', projectId: 'prj_001', projectName: 'SBLD', date: '2026-01-06', majorTask: 'Approval Drawing', targetClosingDate: '2026-01-06', targetClosingDay: 'Tuesday', status: 'OPEN', remarks: 'NRDA Office visit required', siteVisit: true, visitLocation: 'Naya Raipur', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-06T09:00:00', updatedAt: '2026-01-06T09:00:00', comments: [
    { id: 'c1', authorId: 'usr_emp_001', authorName: 'Aman Verma', authorRole: 'EMPLOYEE', content: 'Draft of drawing ready. Need to visit NRDA tomorrow morning for submission.', createdAt: '2026-06-06T09:30:00Z' },
    { id: 'c2', authorId: 'usr_admin_001', authorName: 'Piyush Raj Verma', authorRole: 'ADMIN', content: 'Sure Aman, make sure to collect the receipt copy.', createdAt: '2026-06-06T10:15:00Z' }
  ] },
  { id: 'tsk_002', projectId: 'prj_002', projectName: 'CSIDC_WWH_USLAPUR', date: '2026-01-07', majorTask: 'Section + Site Level', targetClosingDate: '2026-01-08', targetClosingDay: 'Wednesday', status: 'OPEN', remarks: 'Site Section check', siteVisit: false, visitLocation: '', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-07T09:00:00', updatedAt: '2026-01-07T09:00:00', comments: [] },
  { id: 'tsk_003', projectId: 'prj_003', projectName: 'PHAL UDHYAN', date: '2026-01-07', majorTask: 'Approval Drawing', targetClosingDate: '2026-01-07', targetClosingDay: 'Thursday', status: 'CLOSED', remarks: 'To Aman Sir, Korba — Change in Location of Complex', siteVisit: true, visitLocation: 'Korba', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-07T09:00:00', updatedAt: '2026-01-07T17:00:00', closedAt: '2026-01-07T17:00:00', comments: [] },
  { id: 'tsk_004', projectId: 'prj_004', projectName: 'CSIDC_WWH', date: '2026-01-08', majorTask: 'Section + Site Level', targetClosingDate: '2026-01-08', targetClosingDay: 'Wednesday', status: 'CLOSED', remarks: '', siteVisit: false, visitLocation: '', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-08T09:00:00', updatedAt: '2026-01-08T17:00:00', closedAt: '2026-01-08T17:00:00', comments: [] },
  { id: 'tsk_005', projectId: 'prj_001', projectName: 'SBLD', date: '2026-01-09', majorTask: 'DWG Upload', targetClosingDate: '2026-01-09', targetClosingDay: 'Thursday', status: 'OPEN', remarks: '', siteVisit: false, visitLocation: '', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-09T09:00:00', updatedAt: '2026-01-09T09:00:00', comments: [] },
  { id: 'tsk_006', projectId: 'prj_005', projectName: 'VIJAY NAGAR + BSUP GARDEN', date: '2026-01-09', majorTask: 'Chowk Development', targetClosingDate: '2026-01-10', targetClosingDay: 'Friday', status: 'PENDING_REVIEW', remarks: 'Vijay Nagar + Labhandi site check done', siteVisit: true, visitLocation: 'Vijay Nagar + Labhandi', assignedTo: 'usr_emp_003', assignedToName: 'Sneha Patel', createdBy: 'usr_admin_001', createdAt: '2026-01-09T09:00:00', updatedAt: '2026-01-09T16:00:00', comments: [
    { id: 'c3', authorId: 'usr_emp_003', authorName: 'Sneha Patel', authorRole: 'EMPLOYEE', content: 'Site check done. Labhandi site has minor boundary line mismatch. Uploaded revised coordinates.', createdAt: '2026-06-06T14:20:00Z' }
  ] },
  { id: 'tsk_007', projectId: 'prj_006', projectName: 'CSIDC_WWH_KONI / USLA', date: '2026-01-09', majorTask: 'Elevation', targetClosingDate: '2026-01-12', targetClosingDay: 'Monday', status: 'OPEN', remarks: '', siteVisit: false, visitLocation: '', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-09T09:00:00', updatedAt: '2026-01-09T09:00:00', comments: [] },
  { id: 'tsk_008', projectId: 'prj_007', projectName: 'SBI ADDITIONAL FLOOR', date: '2026-01-10', majorTask: '4th Floor', targetClosingDate: '2026-01-14', targetClosingDay: 'Wednesday', status: 'PENDING_REVIEW', remarks: '', siteVisit: false, visitLocation: '', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-10T09:00:00', updatedAt: '2026-01-13T15:00:00', comments: [] },
  { id: 'tsk_009', projectId: 'prj_004', projectName: 'CSIDC_WWH', date: '2026-01-12', majorTask: 'Tank Details', targetClosingDate: '2026-01-15', targetClosingDay: 'Thursday', status: 'OPEN', remarks: 'NRDA coordination needed', siteVisit: true, visitLocation: 'Naya Raipur', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-12T09:00:00', comments: [] },
  { id: 'tsk_010', projectId: 'prj_008', projectName: 'NIGAM Z-09', date: '2026-01-13', majorTask: 'Chowk Development', targetClosingDate: '2026-01-16', targetClosingDay: 'Friday', status: 'OPEN', remarks: '', siteVisit: false, visitLocation: '', assignedTo: 'usr_emp_003', assignedToName: 'Sneha Patel', createdBy: 'usr_admin_001', createdAt: '2026-01-13T09:00:00', updatedAt: '2026-01-13T09:00:00', comments: [] },
  { id: 'tsk_011', projectId: 'prj_009', projectName: 'SBILD', date: '2026-01-13', majorTask: 'Electrical Dwg', targetClosingDate: '2026-01-17', targetClosingDay: 'Saturday', status: 'OPEN', remarks: '', siteVisit: false, visitLocation: '', assignedTo: 'usr_emp_001', assignedToName: 'Aman Verma', createdBy: 'usr_admin_001', createdAt: '2026-01-13T09:00:00', updatedAt: '2026-01-13T09:00:00', comments: [] },
];

const SEED_BANKS: Bank[] = [
  { id: 'bnk_001', name: 'State Bank of India', shortName: 'SBI', templateFormat: 'SBI-Standard-V2', contactPerson: 'Rajesh Gupta', contactEmail: 'rajesh.gupta@sbi.co.in', status: 'ACTIVE', casesThisYear: 18, totalRevenue: 720000, createdAt: '2024-01-01', branches: ['Raipur Main Branch', 'Pandri Branch', 'Shankar Nagar Branch'] },
  { id: 'bnk_002', name: 'HDFC Bank', shortName: 'HDFC', templateFormat: 'HDFC-Val-Pro', contactPerson: 'Priya Sharma', contactEmail: 'priya.s@hdfc.com', status: 'ACTIVE', casesThisYear: 12, totalRevenue: 540000, createdAt: '2024-01-01', branches: ['Civil Lines Branch', 'Devendra Nagar Branch'] },
  { id: 'bnk_003', name: 'Punjab National Bank', shortName: 'PNB', templateFormat: 'PNB-GOI-Format', contactPerson: 'Suresh Yadav', contactEmail: 'suresh.y@pnb.in', status: 'ACTIVE', casesThisYear: 9, totalRevenue: 360000, createdAt: '2024-03-15', branches: ['Tatibandh Branch', 'Fafadih Branch'] },
  { id: 'bnk_004', name: 'ICICI Bank', shortName: 'ICICI', templateFormat: 'ICICI-Premium', contactPerson: 'Kavita Singh', contactEmail: 'kavita.s@icici.com', status: 'ACTIVE', casesThisYear: 7, totalRevenue: 280000, createdAt: '2024-06-01', branches: ['Jail Road Branch', 'Chowk Branch'] },
  { id: 'bnk_005', name: 'Bank of Baroda', shortName: 'BOB', templateFormat: 'BOB-Standard', contactPerson: 'Manoj Tiwari', contactEmail: 'manoj.t@bob.in', status: 'INACTIVE', casesThisYear: 3, totalRevenue: 120000, createdAt: '2024-02-20', branches: ['Urla Main Branch', 'Bhanpuri Branch'] },
];

const SEED_VALUATIONS: ValuationCase[] = [
  {
    id: 'val_001',
    bankId: 'bnk_001',
    bankName: 'SBI',
    siteAddress: 'Plot 42, Shankar Nagar, Raipur',
    geographicZone: 'Zone A - Urban Core',
    landRatePerSqFt: 4500,
    builtUpAreaRate: 1800,
    builtUpArea: 1200,
    depreciation: 15,
    finalAssessedValue: 7200000,
    propertyType: 'Residential',
    status: 'DISPATCHED_TO_BANK',
    assignedTo: 'usr_emp_002',
    assignedToName: 'Ravi Kumar',
    branch: 'Raipur Main Branch',
    propertyDetail: 'Residential plot 40x30 with brick boundary wall',
    visitor: 'Ravi Kumar',
    fees: 40000,
    cgst: 3600,
    sgst: 3600,
    totalAmount: 47200,
    feesSettled: false,
    initiatedAt: '2026-01-05',
    siteInspectedAt: '2026-01-08',
    draftReadyAt: '2026-01-12',
    dispatchedAt: '2026-01-15',
    remarks: 'Standard SBI residential valuation',
    createdAt: '2026-01-05T10:00:00',
    updatedAt: '2026-01-15T15:00:00',
    comments: [
      { id: 'vcmt1', authorId: 'usr_emp_002', authorName: 'Ravi Kumar', authorRole: 'EMPLOYEE', content: 'Completed site inspection. Owner verified all boundary wall measurements.', createdAt: '2026-06-06T11:00:00Z' },
      { id: 'vcmt2', authorId: 'usr_admin_001', authorName: 'Piyush Raj Verma', authorRole: 'ADMIN', content: 'Draft report looks solid. Ready to dispatch.', createdAt: '2026-06-06T12:00:00Z' }
    ]
  },
  {
    id: 'val_002',
    bankId: 'bnk_002',
    bankName: 'HDFC',
    siteAddress: 'Shop 14, Pandri Market, Raipur',
    geographicZone: 'Zone B - Commercial',
    landRatePerSqFt: 8200,
    builtUpAreaRate: 3200,
    builtUpArea: 450,
    depreciation: 20,
    finalAssessedValue: 3890000,
    propertyType: 'Commercial',
    status: 'DRAFT_READY',
    assignedTo: 'usr_emp_002',
    assignedToName: 'Ravi Kumar',
    branch: 'Pandri Branch',
    propertyDetail: 'Ground floor shop unit in commercial market area',
    visitor: 'Ravi Kumar',
    fees: 30000,
    cgst: 2700,
    sgst: 2700,
    totalAmount: 35400,
    feesSettled: false,
    initiatedAt: '2026-01-10',
    siteInspectedAt: '2026-01-13',
    draftReadyAt: '2026-01-18',
    remarks: 'Commercial shop valuation — HDFC format',
    createdAt: '2026-01-10T11:00:00',
    updatedAt: '2026-01-18T14:00:00',
    comments: []
  },
  {
    id: 'val_003',
    bankId: 'bnk_001',
    bankName: 'SBI',
    siteAddress: 'House 7, Vidhan Sabha Road, Raipur',
    geographicZone: 'Zone A - Urban Core',
    landRatePerSqFt: 6100,
    builtUpAreaRate: 2200,
    builtUpArea: 2100,
    depreciation: 10,
    finalAssessedValue: 14850000,
    propertyType: 'Residential',
    status: 'FEES_SETTLED',
    assignedTo: 'usr_emp_002',
    assignedToName: 'Ravi Kumar',
    branch: 'Vidhan Sabha Branch',
    propertyDetail: '2-story residential house structure',
    visitor: 'Ravi Kumar',
    fees: 65000,
    cgst: 5850,
    sgst: 5850,
    totalAmount: 76700,
    feesSettled: true,
    initiatedAt: '2025-12-15',
    siteInspectedAt: '2025-12-20',
    draftReadyAt: '2025-12-28',
    dispatchedAt: '2026-01-03',
    settledAt: '2026-01-10',
    remarks: 'High-value residential — fully settled',
    createdAt: '2025-12-15T09:00:00',
    updatedAt: '2026-01-10T12:00:00'
  },
  {
    id: 'val_004',
    bankId: 'bnk_003',
    bankName: 'PNB',
    siteAddress: 'Farm Land, Abhanpur Tehsil',
    geographicZone: 'Zone D - Agricultural',
    landRatePerSqFt: 350,
    builtUpAreaRate: 0,
    builtUpArea: 0,
    depreciation: 0,
    finalAssessedValue: 2800000,
    propertyType: 'Agricultural',
    status: 'SITE_INSPECTED',
    assignedTo: 'usr_emp_002',
    assignedToName: 'Ravi Kumar',
    branch: 'Abhanpur Branch',
    propertyDetail: 'Agricultural field land, boundary demarcated',
    visitor: 'Ravi Kumar',
    fees: 20000,
    cgst: 1800,
    sgst: 1800,
    totalAmount: 23600,
    feesSettled: false,
    initiatedAt: '2026-01-20',
    siteInspectedAt: '2026-01-25',
    remarks: 'PNB agricultural land valuation',
    createdAt: '2026-01-20T10:00:00',
    updatedAt: '2026-01-25T16:00:00'
  },
  {
    id: 'val_005',
    bankId: 'bnk_004',
    bankName: 'ICICI',
    siteAddress: 'Office G-12, Magneto Mall, Raipur',
    geographicZone: 'Zone B - Commercial',
    landRatePerSqFt: 12000,
    builtUpAreaRate: 4500,
    builtUpArea: 800,
    depreciation: 5,
    finalAssessedValue: 9120000,
    propertyType: 'Commercial',
    status: 'CASE_INITIATED',
    assignedTo: 'usr_emp_002',
    assignedToName: 'Ravi Kumar',
    branch: 'Magneto Mall Branch',
    propertyDetail: 'Commercial office unit G-12, ground floor corner',
    visitor: 'Ravi Kumar',
    fees: 50000,
    cgst: 4500,
    sgst: 4500,
    totalAmount: 59000,
    feesSettled: false,
    initiatedAt: '2026-02-01',
    remarks: 'ICICI commercial office valuation — new case',
    createdAt: '2026-02-01T09:00:00',
    updatedAt: '2026-02-01T09:00:00'
  }
];

const SEED_REVENUE: RevenueRecord[] = [
  { month: 'Jul', year: 2025, architectureRevenue: 180000, valuationRevenue: 95000, totalRevenue: 275000 },
  { month: 'Aug', year: 2025, architectureRevenue: 210000, valuationRevenue: 110000, totalRevenue: 320000 },
  { month: 'Sep', year: 2025, architectureRevenue: 195000, valuationRevenue: 130000, totalRevenue: 325000 },
  { month: 'Oct', year: 2025, architectureRevenue: 250000, valuationRevenue: 145000, totalRevenue: 395000 },
  { month: 'Nov', year: 2025, architectureRevenue: 290000, valuationRevenue: 160000, totalRevenue: 450000 },
  { month: 'Dec', year: 2025, architectureRevenue: 310000, valuationRevenue: 175000, totalRevenue: 485000 },
  { month: 'Jan', year: 2026, architectureRevenue: 270000, valuationRevenue: 145000, totalRevenue: 415000 },
  { month: 'Feb', year: 2026, architectureRevenue: 285000, valuationRevenue: 155000, totalRevenue: 440000 },
];

const SEED_ACCOUNTS: AccountRecord[] = [
  {
    id: 'acc_usr_admin_001',
    userId: 'usr_admin_001',
    userName: 'Piyush Raj Verma',
    baseSalary: 120000,
    effectiveDate: '2020-01-15',
    increments: [
      { date: '2022-01-15', amount: 15000, reason: 'Director Increment' }
    ],
    bonuses: []
  },
  {
    id: 'acc_usr_emp_001',
    userId: 'usr_emp_001',
    userName: 'Aman Verma',
    baseSalary: 45000,
    effectiveDate: '2022-03-01',
    increments: [
      { date: '2023-03-01', amount: 5000, reason: 'Annual Appraisal' },
      { date: '2024-03-01', amount: 6000, reason: 'Promotion to Senior Designer' },
      { date: '2025-03-01', amount: 7000, reason: 'Annual Appraisal' }
    ],
    bonuses: [
      { date: '2025-11-01', amount: 15000, reason: 'Diwali Bonus' },
      { date: '2026-01-05', amount: 10000, reason: 'Project Completion Bonus' }
    ]
  },
  {
    id: 'acc_usr_emp_002',
    userId: 'usr_emp_002',
    userName: 'Ravi Kumar',
    baseSalary: 35000,
    effectiveDate: '2023-06-15',
    increments: [
      { date: '2024-06-15', amount: 4000, reason: 'Annual Appraisal' },
      { date: '2025-06-15', amount: 5000, reason: 'Annual Appraisal' }
    ],
    bonuses: [
      { date: '2025-11-01', amount: 10000, reason: 'Diwali Bonus' }
    ]
  },
  {
    id: 'acc_usr_emp_003',
    userId: 'usr_emp_003',
    userName: 'Sneha Patel',
    baseSalary: 30000,
    effectiveDate: '2024-01-10',
    increments: [
      { date: '2025-01-10', amount: 3500, reason: 'Appraisal' }
    ],
    bonuses: [
      { date: '2025-11-01', amount: 8000, reason: 'Diwali Bonus' }
    ]
  },
  {
    id: 'acc_usr_acc_001',
    userId: 'usr_acc_001',
    userName: 'Neha Sharma',
    baseSalary: 40000,
    effectiveDate: '2021-08-01',
    increments: [
      { date: '2022-08-01', amount: 4000, reason: 'Annual Appraisal' },
      { date: '2023-08-01', amount: 5000, reason: 'Annual Appraisal' },
      { date: '2024-08-01', amount: 5000, reason: 'Annual Appraisal' }
    ],
    bonuses: [
      { date: '2025-11-01', amount: 12000, reason: 'Diwali Bonus' }
    ]
  }
];

// ─── Keys ────────────────────────────────────────────────────
const KEYS = {
  users: 'gtc_users',
  projects: 'gtc_projects',
  tasks: 'gtc_tasks',
  banks: 'gtc_banks',
  valuations: 'gtc_valuations',
  revenue: 'gtc_revenue',
  accounts: 'gtc_accounts',
  leaveQuotas: 'gtc_leave_quotas',
  leaveRequests: 'gtc_leave_requests',
  holidays: 'gtc_holidays',
  currentUser: 'gtc_current_user',
  initialized: 'gtc_initialized',
  schemaVersion: 'gtc_schema_v',
};

const SCHEMA_VERSION = '9'; // bumped to 9 for Bank branches field

// ─── Helper ───────────────────────────────────────────────────
function store<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function load<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

// ─── Service Class ────────────────────────────────────────────
export class LocalDbService {
  static init(): void {
    if (typeof window === 'undefined') return;
    // Re-seed if schema version changed (e.g. passwords added)
    const storedVersion = localStorage.getItem(KEYS.schemaVersion);
    if (storedVersion !== SCHEMA_VERSION) {
      localStorage.removeItem(KEYS.initialized);
      localStorage.removeItem(KEYS.currentUser);
      localStorage.removeItem(KEYS.users);
      localStorage.removeItem(KEYS.projects);
      localStorage.removeItem(KEYS.tasks);
      localStorage.removeItem(KEYS.banks);
      localStorage.removeItem(KEYS.valuations);
      localStorage.removeItem(KEYS.revenue);
      localStorage.removeItem(KEYS.accounts);
      localStorage.removeItem(KEYS.leaveQuotas);
      localStorage.removeItem(KEYS.leaveRequests);
      localStorage.removeItem(KEYS.holidays);
    }
    if (localStorage.getItem(KEYS.initialized)) return;
    store(KEYS.users, SEED_USERS);
    store(KEYS.projects, SEED_PROJECTS);
    store(KEYS.tasks, SEED_TASKS);
    store(KEYS.banks, SEED_BANKS);
    store(KEYS.valuations, SEED_VALUATIONS);
    store(KEYS.revenue, SEED_REVENUE);
    // Initialize collections
    store(KEYS.accounts, SEED_ACCOUNTS);
    if (!localStorage.getItem(KEYS.leaveQuotas)) store(KEYS.leaveQuotas, []);
    if (!localStorage.getItem(KEYS.leaveRequests)) store(KEYS.leaveRequests, []);
    if (!localStorage.getItem(KEYS.holidays)) store(KEYS.holidays, [
      { id: 'hol_1', date: '2026-01-26', name: 'Republic Day', type: 'PUBLIC' },
      { id: 'hol_2', date: '2026-03-25', name: 'Holi', type: 'PUBLIC' },
      { id: 'hol_3', date: '2026-08-15', name: 'Independence Day', type: 'PUBLIC' },
      { id: 'hol_4', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'PUBLIC' },
      { id: 'hol_5', date: '2026-11-01', name: 'Diwali', type: 'PUBLIC' },
      { id: 'hol_6', date: '2026-12-25', name: 'Christmas', type: 'PUBLIC' },
    ]);

    store(KEYS.initialized, true);
    store(KEYS.schemaVersion, SCHEMA_VERSION);
  }

  // ── Auth ──────────────────────────────────────────────────
  static login(email: string, password: string): { user: User | null; error: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { user: null, error: 'No account found with this email address.' };
    if (!user.isActive) return { user: null, error: 'This account has been deactivated. Contact Admin.' };
    if (user.password !== password) return { user: null, error: 'Incorrect password. Please try again.' };
    return { user, error: '' };
  }

  static getCurrentUser(): User | null {
    return load<User>(KEYS.currentUser);
  }

  static setCurrentUser(user: User): void {
    store(KEYS.currentUser, user);
  }

  static logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.currentUser);
  }

  static getUsers(): User[] {
    return load<User[]>(KEYS.users) ?? [];
  }

  static addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    store(KEYS.users, users);
  }

  static updateUser(updated: User): void {
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    store(KEYS.users, users);
  }

  // ── Projects ──────────────────────────────────────────────
  static getProjects(): Project[] {
    return load<Project[]>(KEYS.projects) ?? [];
  }

  static addProject(project: Project): void {
    const projects = this.getProjects();
    projects.push(project);
    store(KEYS.projects, projects);
  }

  static updateProject(updated: Project): void {
    const projects = this.getProjects().map(p => p.id === updated.id ? updated : p);
    store(KEYS.projects, projects);
  }

  static deleteProject(id: string): void {
    store(KEYS.projects, this.getProjects().filter(p => p.id !== id));
  }

  // ── Tasks ─────────────────────────────────────────────────
  static getTasks(userId?: string, role?: string): Task[] {
    const tasks = load<Task[]>(KEYS.tasks) ?? [];
    if (role === 'EMPLOYEE' && userId) {
      return tasks.filter(t => t.assignedTo === userId);
    }
    return tasks;
  }

  static addTask(task: Task): void {
    const tasks = load<Task[]>(KEYS.tasks) ?? [];
    tasks.push(task);
    store(KEYS.tasks, tasks);
  }

  static updateTask(updated: Task): void {
    const tasks = (load<Task[]>(KEYS.tasks) ?? []).map(t => t.id === updated.id ? updated : t);
    store(KEYS.tasks, tasks);
  }

  static deleteTask(id: string): void {
    store(KEYS.tasks, (load<Task[]>(KEYS.tasks) ?? []).filter(t => t.id !== id));
  }

  static closeTask(id: string, adminId: string): void {
    const tasks = (load<Task[]>(KEYS.tasks) ?? []).map(t =>
      t.id === id ? { ...t, status: 'CLOSED' as TaskStatus, closedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : t
    );
    store(KEYS.tasks, tasks);
    void adminId;
  }

  // ── Banks ─────────────────────────────────────────────────
  static getBanks(): Bank[] {
    return load<Bank[]>(KEYS.banks) ?? [];
  }

  static addBank(bank: Bank): void {
    const banks = this.getBanks();
    banks.push(bank);
    store(KEYS.banks, banks);
  }

  static updateBank(updated: Bank): void {
    store(KEYS.banks, this.getBanks().map(b => b.id === updated.id ? updated : b));
  }

  static deleteBank(id: string): void {
    store(KEYS.banks, this.getBanks().filter(b => b.id !== id));
  }

  // ── Valuations ────────────────────────────────────────────
  static getValuations(userId?: string, role?: string): ValuationCase[] {
    const vals = load<ValuationCase[]>(KEYS.valuations) ?? [];
    if (role === 'EMPLOYEE' && userId) {
      return vals.filter(v => v.assignedTo === userId);
    }
    return vals;
  }

  static addValuation(valuation: ValuationCase): void {
    const vals = this.getValuations();
    vals.push(valuation);
    store(KEYS.valuations, vals);
  }

  static updateValuation(updated: ValuationCase): void {
    store(KEYS.valuations, this.getValuations().map(v => v.id === updated.id ? updated : v));
  }

  static advanceValuationStatus(id: string, newStatus: ValuationStatus): void {
    const now = new Date().toISOString().split('T')[0];
    const vals = (load<ValuationCase[]>(KEYS.valuations) ?? []).map(v => {
      if (v.id !== id) return v;
      const update: Partial<ValuationCase> = { status: newStatus, updatedAt: new Date().toISOString() };
      if (newStatus === 'SITE_INSPECTED') update.siteInspectedAt = now;
      if (newStatus === 'DRAFT_READY') update.draftReadyAt = now;
      if (newStatus === 'DISPATCHED_TO_BANK') update.dispatchedAt = now;
      if (newStatus === 'FEES_SETTLED') { update.settledAt = now; update.feesSettled = true; }
      return { ...v, ...update };
    });
    store(KEYS.valuations, vals);
  }

  // ── Revenue ───────────────────────────────────────────────
  static getRevenue(): RevenueRecord[] {
    return load<RevenueRecord[]>(KEYS.revenue) ?? [];
  }

  // ── Analytics ─────────────────────────────────────────────
  static getDashboardStats(userId?: string, role?: string): DashboardStats {
    const tasks = this.getTasks(userId, role);
    const valuations = this.getValuations(userId, role);
    const projects = this.getProjects();
    const users = this.getUsers().filter(u => u.role === 'EMPLOYEE');
    const now = new Date().toISOString().split('T')[0];
    const thisMonthRevenue = this.getRevenue().slice(-1)[0]?.totalRevenue ?? 0;

    return {
      totalProjects: projects.length,
      openTasks: tasks.filter(t => t.status === 'OPEN').length,
      overdueTasks: tasks.filter(t => t.status !== 'CLOSED' && t.targetClosingDate < now).length,
      totalValuationCases: valuations.length,
      pendingValuations: valuations.filter(v => v.status !== 'FEES_SETTLED').length,
      monthlyRevenue: thisMonthRevenue,
      totalEmployees: users.length,
      tasksClosedThisMonth: tasks.filter(t => t.status === 'CLOSED' && t.closedAt && t.closedAt.startsWith('2026-01')).length,
    };
  }

  static getEmployeeMetrics(): EmployeeMetrics[] {
    const employees = this.getUsers().filter(u => u.role === 'EMPLOYEE');
    const allTasks = load<Task[]>(KEYS.tasks) ?? [];
    const allVals = load<ValuationCase[]>(KEYS.valuations) ?? [];
    const now = new Date().toISOString().split('T')[0];

    return employees.map(emp => ({
      userId: emp.id,
      name: emp.name,
      totalTasks: allTasks.filter(t => t.assignedTo === emp.id).length,
      openTasks: allTasks.filter(t => t.assignedTo === emp.id && t.status === 'OPEN').length,
      overdueTasks: allTasks.filter(t => t.assignedTo === emp.id && t.status !== 'CLOSED' && t.targetClosingDate < now).length,
      closedTasks: allTasks.filter(t => t.assignedTo === emp.id && t.status === 'CLOSED').length,
      pendingReview: allTasks.filter(t => t.assignedTo === emp.id && t.status === 'PENDING_REVIEW').length,
      valuationCases: allVals.filter(v => v.assignedTo === emp.id).length,
    }));
  }

  static getRecentComments(userId?: string, role?: string, limit = 10): { type: 'task' | 'valuation'; targetId: string; targetName: string; comment: TicketComment }[] {
    const tasks = load<Task[]>(KEYS.tasks) ?? [];
    const vals = load<ValuationCase[]>(KEYS.valuations) ?? [];
    
    const activity: { type: 'task' | 'valuation'; targetId: string; targetName: string; comment: TicketComment }[] = [];
    
    tasks.forEach(t => {
      if (role === 'EMPLOYEE' && userId && t.assignedTo !== userId) return;
      (t.comments ?? []).forEach(c => {
        activity.push({
          type: 'task',
          targetId: t.id,
          targetName: `${t.projectName} - ${t.majorTask}`,
          comment: c,
        });
      });
    });
    
    vals.forEach(v => {
      if (role === 'EMPLOYEE' && userId && v.assignedTo !== userId) return;
      (v.comments ?? []).forEach(c => {
        activity.push({
          type: 'valuation',
          targetId: v.id,
          targetName: `${v.bankName} (${v.branch}) - ${v.propertyDetail?.slice(0, 20) || 'Valuation'}...`,
          comment: c,
        });
      });
    });
    
    return activity.sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime()).slice(0, limit);
  }

  static getValuationDailyPerformance(): { date: string; count: number; earnings: number }[] {
    const vals = load<ValuationCase[]>(KEYS.valuations) ?? [];
    const performanceMap: Record<string, { count: number; earnings: number }> = {};
    
    vals.forEach(v => {
      const date = v.initiatedAt;
      if (!date) return;
      if (!performanceMap[date]) {
        performanceMap[date] = { count: 0, earnings: 0 };
      }
      performanceMap[date].count += 1;
      performanceMap[date].earnings += v.totalAmount;
    });
    
    return Object.entries(performanceMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);
  }

  // ── Filtered Exports ──────────────────────────────────────
  static getFilteredTasks(filter: ExportFilter): Task[] {
    let tasks = load<Task[]>(KEYS.tasks) ?? [];
    if (filter.employeeId) tasks = tasks.filter(t => t.assignedTo === filter.employeeId);
    if (filter.projectId) tasks = tasks.filter(t => t.projectId === filter.projectId);
    if (filter.status) tasks = tasks.filter(t => t.status === filter.status);
    if (filter.dateFrom) tasks = tasks.filter(t => t.date >= filter.dateFrom!);
    if (filter.dateTo) tasks = tasks.filter(t => t.date <= filter.dateTo!);
    return tasks;
  }

  static getFilteredValuations(filter: ExportFilter): ValuationCase[] {
    let vals = load<ValuationCase[]>(KEYS.valuations) ?? [];
    if (filter.bankId) vals = vals.filter(v => v.bankId === filter.bankId);
    if (filter.employeeId) vals = vals.filter(v => v.assignedTo === filter.employeeId);
    if (filter.status) vals = vals.filter(v => v.status === filter.status);
    if (filter.dateFrom) vals = vals.filter(v => v.initiatedAt >= filter.dateFrom!);
    if (filter.dateTo) vals = vals.filter(v => v.initiatedAt <= filter.dateTo!);
    return vals;
  }

  // ── Accounts ──────────────────────────────────────────────
  static getAccounts(): AccountRecord[] {
    return load<AccountRecord[]>(KEYS.accounts) ?? [];
  }

  static getAccountForUser(userId: string): AccountRecord | null {
    return this.getAccounts().find(a => a.userId === userId) ?? null;
  }

  static saveAccount(account: AccountRecord): void {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id || a.userId === account.userId);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    store(KEYS.accounts, accounts);
  }

  // ── Leaves & Holidays ─────────────────────────────────────
  static getLeaveQuotas(): LeaveQuota[] {
    return load<LeaveQuota[]>(KEYS.leaveQuotas) ?? [];
  }

  static getLeaveQuotaForUser(userId: string, year: number): LeaveQuota | null {
    return this.getLeaveQuotas().find(q => q.userId === userId && q.year === year) ?? null;
  }

  static saveLeaveQuota(quota: LeaveQuota): void {
    const quotas = this.getLeaveQuotas();
    const index = quotas.findIndex(q => q.userId === quota.userId && q.year === quota.year);
    if (index >= 0) quotas[index] = quota;
    else quotas.push(quota);
    store(KEYS.leaveQuotas, quotas);
  }

  static getLeaveRequests(userId?: string): LeaveRequest[] {
    const reqs = load<LeaveRequest[]>(KEYS.leaveRequests) ?? [];
    if (userId) return reqs.filter(r => r.userId === userId);
    return reqs;
  }

  static saveLeaveRequest(req: LeaveRequest): void {
    const reqs = this.getLeaveRequests();
    const index = reqs.findIndex(r => r.id === req.id);
    if (index >= 0) reqs[index] = req;
    else reqs.push(req);
    store(KEYS.leaveRequests, reqs);
  }

  static getHolidays(): Holiday[] {
    return load<Holiday[]>(KEYS.holidays) ?? [];
  }

  static saveHoliday(holiday: Holiday): void {
    const holidays = this.getHolidays();
    const index = holidays.findIndex(h => h.id === holiday.id);
    if (index >= 0) holidays[index] = holiday;
    else holidays.push(holiday);
    store(KEYS.holidays, holidays);
  }

  static deleteHoliday(id: string): void {
    store(KEYS.holidays, this.getHolidays().filter(h => h.id !== id));
  }
}
