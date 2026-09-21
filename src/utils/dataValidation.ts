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
    } else if (data.designProgressPercent < 0 || data.designProgressPercent > 500) {
      errors.push({ field: 'designProgressPercent', message: 'Design Progress (%) should be a valid percentage.' });
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
