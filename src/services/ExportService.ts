// ============================================================
// GT CONSULTANCY RAIPUR - EXPORT SERVICE
// Phase 1 — CSV Download Engine
// Phase 2 ready: Mobile Web Share API already integrated
// ============================================================

export class ExportService {
  /**
   * Convert an array of objects to a CSV string
   */
  static toCSV(headers: string[], rows: (string | number | boolean)[][]): string {
    const escapeCell = (cell: string | number | boolean): string => {
      const str = String(cell ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };
    const headerRow = headers.map(escapeCell).join(',');
    const dataRows = rows.map(row => row.map(escapeCell).join(','));
    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Trigger browser download or native share sheet
   */
  static downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || window.innerWidth < 768;

    if (isMobile && navigator.canShare) {
      const file = new File([blob], filename, { type: 'text/csv' });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: filename }).catch(console.error);
        return;
      }
    }

    // Desktop fallback: direct download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ── Task Export ───────────────────────────────────────────
  static exportTasks(tasks: import('@/types').Task[]): void {
    const headers = ['S.No', 'Date', 'Project', 'Major Task', 'Target Closing Date', 'Target Closing Day', 'Status', 'Remarks', 'Site Visit', 'Visit Location', 'Assigned To'];
    const rows = tasks.map((t, i) => [
      i + 1, t.date, t.projectName, t.majorTask, t.targetClosingDate,
      t.targetClosingDay, t.status, t.remarks,
      t.siteVisit ? 'Yes' : 'No', t.visitLocation, t.assignedToName,
    ]);
    this.downloadCSV(`GT_Tasks_${new Date().toISOString().split('T')[0]}.csv`, this.toCSV(headers, rows));
  }

  // ── Valuation Export ──────────────────────────────────────
  static exportValuations(valuations: import('@/types').ValuationCase[], isAdmin = false): void {
    const headers = isAdmin
      ? ['S.No', 'Bank', 'Branch', 'Visitor', 'Site Address', 'Property Detail', 'Remarks', 'Zone', 'Land Rate/sqft', 'Built-up Area', 'Depreciation %', 'Final Value', 'Property Type', 'Status', 'Base Fees', 'CGST (9%)', 'SGST (9%)', 'Total (incl GST)', 'Fees Settled', 'Assigned To']
      : ['S.No', 'Bank', 'Branch', 'Visitor', 'Site Address', 'Property Detail', 'Remarks', 'Zone', 'Land Rate/sqft', 'Built-up Area', 'Depreciation %', 'Final Value', 'Property Type', 'Status', 'Assigned To'];

    const rows = valuations.map((v, i) => isAdmin
      ? [
          i + 1, v.bankName, v.branch, v.visitor, v.siteAddress, v.propertyDetail, v.remarks, v.geographicZone,
          v.landRatePerSqFt, v.builtUpArea, v.depreciation, v.finalAssessedValue,
          v.propertyType, v.status, v.fees, v.cgst, v.sgst, v.totalAmount, v.feesSettled ? 'Yes' : 'No', v.assignedToName,
        ]
      : [
          i + 1, v.bankName, v.branch, v.visitor, v.siteAddress, v.propertyDetail, v.remarks, v.geographicZone,
          v.landRatePerSqFt, v.builtUpArea, v.depreciation, v.finalAssessedValue,
          v.propertyType, v.status, v.assignedToName,
        ]
    );
    this.downloadCSV(`GT_Valuations_${new Date().toISOString().split('T')[0]}.csv`, this.toCSV(headers, rows));
  }

  static exportUnpaidValuations(valuations: import('@/types').ValuationCase[], isAdmin = false): void {
    const unpaid = valuations.filter(v => !v.feesSettled);
    const headers = isAdmin
      ? ['S.No', 'Bank', 'Branch', 'Visitor', 'Site Address', 'Property Detail', 'Remarks', 'Zone', 'Land Rate/sqft', 'Built-up Area', 'Depreciation %', 'Final Value', 'Property Type', 'Status', 'Base Fees', 'CGST (9%)', 'SGST (9%)', 'Total Pending Amount', 'Assigned To']
      : ['S.No', 'Bank', 'Branch', 'Visitor', 'Site Address', 'Property Detail', 'Remarks', 'Zone', 'Land Rate/sqft', 'Built-up Area', 'Depreciation %', 'Final Value', 'Property Type', 'Status', 'Assigned To'];

    const rows = unpaid.map((v, i) => isAdmin
      ? [
          i + 1, v.bankName, v.branch, v.visitor, v.siteAddress, v.propertyDetail, v.remarks, v.geographicZone,
          v.landRatePerSqFt, v.builtUpArea, v.depreciation, v.finalAssessedValue,
          v.propertyType, v.status, v.fees, v.cgst, v.sgst, v.totalAmount, v.assignedToName,
        ]
      : [
          i + 1, v.bankName, v.branch, v.visitor, v.siteAddress, v.propertyDetail, v.remarks, v.geographicZone,
          v.landRatePerSqFt, v.builtUpArea, v.depreciation, v.finalAssessedValue,
          v.propertyType, v.status, v.assignedToName,
        ]
    );
    let filename = `GT_Unpaid_Valuations_${new Date().toISOString().split('T')[0]}.csv`;
    if (valuations.length > 0) {
      const first = valuations[0];
      const allSameBank = valuations.every(v => v.bankName === first.bankName);
      const allSameBranch = valuations.every(v => v.branch === first.branch);
      if (allSameBank && allSameBranch) {
        filename = `GT_Unpaid_Valuations_${first.bankName}_${first.branch.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (allSameBank) {
        filename = `GT_Unpaid_Valuations_${first.bankName}_${new Date().toISOString().split('T')[0]}.csv`;
      }
    }
    this.downloadCSV(filename, this.toCSV(headers, rows));
  }

  // ── Bank Export ───────────────────────────────────────────
  static exportBanks(banks: import('@/types').Bank[]): void {
    const headers = ['S.No', 'Bank Name', 'Short Name', 'Template Format', 'Contact Person', 'Contact Email', 'Status', 'Cases This Year', 'Total Revenue'];
    const rows = banks.map((b, i) => [i + 1, b.name, b.shortName, b.templateFormat, b.contactPerson, b.contactEmail, b.status, b.casesThisYear, b.totalRevenue]);
    this.downloadCSV(`GT_Banks_${new Date().toISOString().split('T')[0]}.csv`, this.toCSV(headers, rows));
  }

  // ── Employee Performance Export ───────────────────────────
  static exportEmployeeMetrics(metrics: import('@/types').EmployeeMetrics[]): void {
    const headers = ['Employee', 'Total Tasks', 'Open', 'Pending Review', 'Overdue', 'Closed', 'Valuation Cases'];
    const rows = metrics.map(m => [m.name, m.totalTasks, m.openTasks, m.pendingReview, m.overdueTasks, m.closedTasks, m.valuationCases]);
    this.downloadCSV(`GT_Employee_Metrics_${new Date().toISOString().split('T')[0]}.csv`, this.toCSV(headers, rows));
  }

  // ── Projects Export ───────────────────────────────────────
  static exportProjects(projects: import('@/types').Project[]): void {
    const headers = ['S.No', 'Project Name', 'Client', 'Site Address', 'Location', 'Total Value', 'Status'];
    const rows = projects.map((p, i) => [i + 1, p.name, p.clientName, p.siteAddress, p.siteLocation, p.totalValue, p.status]);
    this.downloadCSV(`GT_Projects_${new Date().toISOString().split('T')[0]}.csv`, this.toCSV(headers, rows));
  }
}
