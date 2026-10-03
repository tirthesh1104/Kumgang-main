/**
 * Vercel Serverless Function: Send PI Approval Email via Resend API
 * Endpoint: POST /api/send-approval-email
 */

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      piNumber,
      projectName,
      clientName,
      stage,
      stageLabel,
      recipientEmail,
      recipientRole,
      actionToken,
      totalAmountUSD,
      currency = 'USD',
      baseUrl = 'https://kumgang-main.vercel.app',
      submittedBy = 'Project Manager',
    } = body || {};

    if (!recipientEmail || recipientEmail === 'Email Not Configured') {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        error: 'Recipient email is not configured for this stage',
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      // Safe fallback when RESEND_API_KEY is not configured
      return res.status(200).json({
        success: false,
        status: 'CONFIG_REQUIRED',
        simulated: true,
        message: 'RESEND_API_KEY is not configured in server environment variables. Operating in safe Local/Demo Simulation Mode.',
      });
    }

    const fromEmail = process.env.EMAIL_FROM || 'Kumgang Kind Approvals <onboarding@resend.dev>';
    const replyTo = process.env.EMAIL_REPLY_TO || undefined;

    // Direct Action Links
    const originUrl = baseUrl.replace(/\/+$/, '');
    const approveUrl = `${originUrl}/?piActionToken=${encodeURIComponent(actionToken)}&action=APPROVE`;
    const rejectUrl = `${originUrl}/?piActionToken=${encodeURIComponent(actionToken)}&action=REJECT`;
    const holdUrl = `${originUrl}/?piActionToken=${encodeURIComponent(actionToken)}&action=PUT_ON_HOLD`;
    const viewUrl = `${originUrl}/?piNumber=${encodeURIComponent(piNumber)}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Approval Request - ${piNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .header { background: #1e1b4b; padding: 24px 30px; border-bottom: 3px solid #6366f1; text-align: left; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: #a5b4fc; margin: 6px 0 0 0; font-size: 13px; }
    .body-content { padding: 30px; }
    .stage-badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px; }
    .info-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-val { color: #0f172a; font-weight: 700; }
    .amount-highlight { font-size: 18px; color: #4f46e5; }
    .actions-section { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; padding: 12px 22px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px; margin: 6px 4px; }
    .btn-approve { background: #10b981; color: #ffffff !important; }
    .btn-hold { background: #f59e0b; color: #ffffff !important; }
    .btn-reject { background: #ef4444; color: #ffffff !important; }
    .btn-view { background: #6366f1; color: #ffffff !important; }
    .token-note { font-size: 11px; color: #94a3b8; margin-top: 20px; line-height: 1.5; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .footer { background: #f1f5f9; padding: 18px 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KUMKANG KIND CO., LTD.</h1>
      <p>Proforma Invoice Approval Request · Multi-Level Workflow</p>
    </div>
    <div class="body-content">
      <div class="stage-badge">${stageLabel || stage}</div>
      <p style="font-size: 15px; margin: 0 0 16px 0; line-height: 1.5;">
        Dear <strong>${recipientRole}</strong>,<br>
        A Proforma Invoice has been submitted and requires your stage authorization.
      </p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">PI Number:</span>
          <span class="info-val">${piNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Project:</span>
          <span class="info-val">${projectName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Client:</span>
          <span class="info-val">${clientName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Amount:</span>
          <span class="info-val amount-highlight">${currency} ${Number(totalAmountUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Submitted By:</span>
          <span class="info-val">${submittedBy}</span>
        </div>
      </div>

      <div class="actions-section">
        <p style="font-size: 13px; color: #475569; margin-bottom: 14px; font-weight: 600;">
          Select your review decision below:
        </p>
        <a href="${approveUrl}" class="btn btn-approve">✓ APPROVE</a>
        <a href="${holdUrl}" class="btn btn-hold">⏸ PUT ON HOLD</a>
        <a href="${rejectUrl}" class="btn btn-reject">✕ REJECT</a>
        <div style="margin-top: 12px;">
          <a href="${viewUrl}" class="btn btn-view" style="font-size: 12px; padding: 8px 16px;">View Full Digital Document</a>
        </div>
        <div class="token-note">
          <strong>Security Action Token:</strong><br>
          <code style="word-break: break-all; color: #475569;">${actionToken}</code><br>
          <em>This link is cryptographically tied to PI ${piNumber} and stage ${stage}.</em>
        </div>
      </div>
    </div>
    <div class="footer">
      This is an automated operational notification from Kumgang Live Project Monitoring System.<br>
      © ${new Date().getFullYear()} Kumgang Kind Co., Ltd. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        reply_to: replyTo,
        subject: `[Action Required] PI Approval Request: ${piNumber} - ${projectName}`,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({
        success: false,
        status: 'FAILED',
        error: resendData.message || 'Failed to dispatch email via Resend API',
        details: resendData,
      });
    }

    return res.status(200).json({
      success: true,
      status: 'SENT',
      messageId: resendData.id,
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      error: error.message || 'Internal server error while dispatching email',
    });
  }
}
