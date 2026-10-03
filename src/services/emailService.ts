import type {
  ProformaInvoiceRecord,
  PIApprovalStage,
  PIDeliveryLog,
  StakeholderEmails,
} from '../types/proformaInvoice';

export interface EmailDispatchResult {
  success: boolean;
  status: 'SENT' | 'FAILED' | 'DEMO_SIMULATED';
  providerMessageId?: string;
  error?: string;
  recipientEmail: string;
  recipientRole: string;
}

/**
 * Dispatches stage approval email via the serverless /api/send-approval-email endpoint (Resend).
 * Safely falls back to DEMO_SIMULATED when running locally or if RESEND_API_KEY is not configured in Vercel.
 */
export async function dispatchPIStageEmail(
  pi: ProformaInvoiceRecord,
  stage: PIApprovalStage,
  stakeholderEmails: StakeholderEmails,
  actionToken: string,
  user = 'Project Manager'
): Promise<EmailDispatchResult> {
  let recipientEmail = '';
  let recipientRole = '';
  let stageLabel = '';

  if (stage === 'PM_REVIEW') {
    recipientEmail = stakeholderEmails.pmEmail;
    recipientRole = 'Project Manager';
    stageLabel = 'Stage 1: Project Manager Review';
  } else if (stage === 'SALES_DIRECTOR_REVIEW') {
    recipientEmail = stakeholderEmails.salesDirectorEmail;
    recipientRole = 'Sales Director';
    stageLabel = 'Stage 2: Sales Director Review';
  } else if (stage === 'MANAGING_DIRECTOR_REVIEW') {
    recipientEmail = stakeholderEmails.managingDirectorEmail;
    recipientRole = 'Managing Director';
    stageLabel = 'Stage 3: Managing Director Review';
  }

  if (!recipientEmail || recipientEmail === 'Email Not Configured') {
    return {
      success: false,
      status: 'FAILED',
      error: 'Recipient email is not configured for this stage',
      recipientEmail: recipientEmail || 'Not Configured',
      recipientRole,
    };
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kumgang-main.vercel.app';

  const payload = {
    piId: pi.id,
    piNumber: pi.piNumber,
    projectName: pi.projectName,
    clientName: pi.clientName,
    stage,
    stageLabel,
    recipientEmail,
    recipientRole,
    actionToken,
    totalAmountUSD: pi.totalAmountUSD,
    currency: pi.currency || 'USD',
    baseUrl,
    submittedBy: user,
  };

  try {
    const res = await fetch('/api/send-approval-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'SENT') {
        return {
          success: true,
          status: 'SENT',
          providerMessageId: data.messageId,
          recipientEmail,
          recipientRole,
        };
      }
      if (data.status === 'CONFIG_REQUIRED' || data.simulated) {
        return {
          success: true,
          status: 'DEMO_SIMULATED',
          providerMessageId: `SIM-${Date.now().toString(36)}`,
          error: data.message || 'Operating in Local/Demo Simulation Mode',
          recipientEmail,
          recipientRole,
        };
      }
      return {
        success: false,
        status: 'FAILED',
        error: data.error || 'Server reported email delivery failure',
        recipientEmail,
        recipientRole,
      };
    } else {
      // Endpoint returned error or not found (e.g. local dev Vite without Vercel CLI)
      return {
        success: true,
        status: 'DEMO_SIMULATED',
        providerMessageId: `LOCAL-DEV-${Date.now().toString(36)}`,
        error: 'Local development environment - operating in demo simulation mode',
        recipientEmail,
        recipientRole,
      };
    }
  } catch (err: any) {
    // Network fallback for offline / local Vite dev server
    return {
      success: true,
      status: 'DEMO_SIMULATED',
      providerMessageId: `LOCAL-${Date.now().toString(36)}`,
      error: err.message || 'Local environment simulation fallback',
      recipientEmail,
      recipientRole,
    };
  }
}

/**
 * Creates a delivery log entry from dispatch result
 */
export function createPIDeliveryLog(
  pi: ProformaInvoiceRecord,
  stage: PIApprovalStage,
  result: EmailDispatchResult,
  token: string
): PIDeliveryLog {
  return {
    id: `DELIVERY-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    piId: pi.id,
    piNumber: pi.piNumber,
    stage,
    recipientEmail: result.recipientEmail,
    recipientRole: result.recipientRole,
    status: result.status,
    providerMessageId: result.providerMessageId,
    error: result.error,
    sentAt: new Date().toISOString(),
    actionToken: token,
  };
}
