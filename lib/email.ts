import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#fffff0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffff0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0A2647;padding:32px 32px 24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#d4af35;">The Biryani Canteen</p>
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Your Login Code</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;">
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                Use the code below to sign in to your account. It expires in <strong>10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:#0A2647;border-radius:16px;padding:28px 20px;margin-bottom:28px;display:inline-block;width:100%;box-sizing:border-box;">
                <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#d4af35;">One-Time Password</p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;color:#ffffff;">${otp}</p>
              </div>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                If you didn't request this, you can safely ignore this email.<br/>Never share this code with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; 2024 The Biryani Canteen &nbsp;·&nbsp; Royal Indian Cuisine
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"The Biryani Canteen" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `${otp} is your login code – The Biryani Canteen`,
    html,
  });
}

export async function sendRefundFailureEmail(
  to: string,
  details: {
    orderId: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    amount: number;
    customerName: string;
    customerPhone: string;
    errorReason?: string;
  }
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#fffff0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffff0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.08);border:2px solid #ef4444;">
          <!-- Header -->
          <tr>
            <td style="background:#ef4444;padding:32px 32px 24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#ffffff;">The Biryani Canteen</p>
              <h1 style="margin:0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">🚨 Refund Action Required</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">
                An automatic refund request has <strong>FAILED</strong>. Please log in to the Razorpay dashboard to process this refund manually.
              </p>
              
              <!-- Details Table -->
              <table width="100%" cellpadding="8" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:28px;border:1px solid #e2e8f0;font-size:14px;color:#475569;">
                <tr>
                  <td width="40%" style="font-weight:bold;border-bottom:1px solid #e2e8f0;">Order ID</td>
                  <td style="border-bottom:1px solid #e2e8f0;"><code>${details.orderId}</code></td>
                </tr>
                <tr>
                  <td style="font-weight:bold;border-bottom:1px solid #e2e8f0;">Razorpay Order ID</td>
                  <td style="border-bottom:1px solid #e2e8f0;"><code>${details.razorpayOrderId ?? 'N/A'}</code></td>
                </tr>
                <tr>
                  <td style="font-weight:bold;border-bottom:1px solid #e2e8f0;">Razorpay Payment ID</td>
                  <td style="border-bottom:1px solid #e2e8f0;"><code>${details.razorpayPaymentId ?? 'N/A'}</code></td>
                </tr>
                <tr>
                  <td style="font-weight:bold;border-bottom:1px solid #e2e8f0;">Refund Amount</td>
                  <td style="border-bottom:1px solid #e2e8f0;color:#b91c1c;font-weight:bold;">₹${details.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;border-bottom:1px solid #e2e8f0;">Customer Name</td>
                  <td style="border-bottom:1px solid #e2e8f0;">${details.customerName}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;border-bottom:1px solid #e2e8f0;">Customer Phone</td>
                  <td style="border-bottom:1px solid #e2e8f0;">${details.customerPhone}</td>
                </tr>
                ${details.errorReason ? `
                <tr>
                  <td style="font-weight:bold;color:#b91c1c;">Failure Reason</td>
                  <td style="color:#b91c1c;font-weight:bold;">${details.errorReason}</td>
                </tr>` : ''}
              </table>

              <div style="text-align:center;">
                <a href="https://dashboard.razorpay.com" target="_blank" style="background:#0A2647;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 12px rgba(10,38,71,0.25);">Open Razorpay Dashboard</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; 2024 The Biryani Canteen &nbsp;·&nbsp; Urgent Operations Alert
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"Canteen Operations" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `🚨 FAILED REFUND: Action Required for Order ${details.orderId}`,
    html,
  });
}
