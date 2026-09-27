import type { ProjectMaster } from '../data/projectData';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a ProjectMaster record before manual save or Excel commit.
 */
export function validateProjectMaster(data: Partial<ProjectMaster>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.projectId || typeof data.projectId !== 'string' || data.projectId.trim() === '') {
    errors.push({ field: 'projectId', message: 'Project ID is required and cannot be empty.' });
  }

  if (data.contractQtyM2 !== undefined && data.contractQtyM2 !== null && data.contractQtyM2 < 0) {
    errors.push({ field: 'contractQtyM2', message: 'Contract Qty (m²) cannot be negative.' });
  }

  if (data.contractWeightTons !== undefined && data.contractWeightTons !== null && data.contractWeightTons < 0) {
    errors.push({ field: 'contractWeightTons', message: 'Contract Weight (Tons) cannot be negative.' });
  }

  if (data.actualDesignQtyM2 !== undefined && data.actualDesignQtyM2 !== null && data.actualDesignQtyM2 < 0) {
    errors.push({ field: 'actualDesignQtyM2', message: 'Actual Design Qty (m²) cannot be negative.' });
  }

  if (data.actualDesignWeightTons !== undefined && data.actualDesignWeightTons !== null && data.actualDesignWeightTons < 0) {
    errors.push({ field: 'actualDesignWeightTons', message: 'Actual Design Weight (Tons) cannot be negative.' });
  }

  if (data.designProgressPercent !== undefined && data.designProgressPercent !== null) {
    if (typeof data.designProgressPercent !== 'number' || isNaN(data.designProgressPercent)) {
      errors.push({ field: 'designProgressPercent', message: 'Design Progress (%) must be a valid number.' });
    } else if (data.designProgressPercent < 0 || data.designProgressPercent > 100) {
      errors.push({ field: 'designProgressPercent', message: 'Design Progress (%) must be between 0% and 100%.' });
    }
  }

  if (data.totalAmountUSD !== undefined && data.totalAmountUSD !== null && data.totalAmountUSD < 0) {
    errors.push({ field: 'totalAmountUSD', message: 'Total Amount (USD) cannot be negative.' });
  }

  if (data.advanceUSD !== undefined && data.advanceUSD !== null && data.advanceUSD < 0) {
    errors.push({ field: 'advanceUSD', message: 'Advance USD cannot be negative.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '' || dateStr.toLowerCase() === 'done' || dateStr.toLowerCase() === 'n/a' || dateStr.toLowerCase().includes('waiting') || dateStr.toLowerCase().includes('asap')) {
    return null;
  }
  try {
    let d: Date;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        d = new Date(dateStr);
      } else if (parts[2].length === 4) {
        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        d = new Date(dateStr);
      }
    } else {
      d = new Date(dateStr);
    }
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export interface DateChronologyResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateDateChronology(dates: {
  contractDate?: string | null;
  shellPlanConfirmation?: string | null;
  productionStart?: string | null;
  productionComplete?: string | null;
  loadingDate?: string | null;
  etd?: string | null;
  eta?: string | null;
  fwd?: string | null;
}): DateChronologyResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const contract = parseDateString(dates.contractDate);
  const shellPlan = parseDateString(dates.shellPlanConfirmation);
  const prodStart = parseDateString(dates.productionStart);
  const prodComplete = parseDateString(dates.productionComplete);
  const loading = parseDateString(dates.loadingDate);
  const etd = parseDateString(dates.etd);
  const eta = parseDateString(dates.eta);
  const fwd = parseDateString(dates.fwd);

  if (prodStart && prodComplete && prodStart > prodComplete) {
    errors.push(`Production Start Date (${dates.productionStart}) cannot be after Production Complete Date (${dates.productionComplete}).`);
  }

  if (etd && eta && etd > eta) {
    errors.push(`ETD (${dates.etd}) cannot be after ETA (${dates.eta}).`);
  }

  if (contract && prodStart && contract > prodStart) {
    warnings.push(`Production Start (${dates.productionStart}) is set before Contract Date (${dates.contractDate}).`);
  }

  if (shellPlan && prodStart && shellPlan > prodStart) {
    warnings.push(`Production Start (${dates.productionStart}) is set before Shell Plan Confirmation (${dates.shellPlanConfirmation}).`);
  }

  if (loading && etd && loading > etd) {
    warnings.push(`ETD (${dates.etd}) is set before Loading Date (${dates.loadingDate}).`);
  }

  if (prodComplete && etd && prodComplete > etd) {
    warnings.push(`ETD (${dates.etd}) is set before Production Complete Date (${dates.productionComplete}).`);
  }

  if (fwd && etd && fwd > etd) {
    warnings.push(`Forwarder Assignment Date (${dates.fwd}) is recorded after ETD (${dates.etd}). Normally forwarder assignment precedes ETD.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

