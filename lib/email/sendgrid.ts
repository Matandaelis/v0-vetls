import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Live Shopping Platform'

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailTemplate) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email would have been sent to:', to)
    return { success: false, error: 'SendGrid not configured' }
  }

  try {
    await sgMail.send({
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error }
  }
}

export async function sendOrderConfirmation(to: string, orderDetails: {
  orderId: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  shippingAddress: string
}) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `,
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Thank you for your purchase! Your order has been confirmed.</p>
    
    <h2 style="color: #667eea;">Order Details</h2>
    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f8f9fa;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Item</th>
          <th style="padding: 12px; text-align: center; border-bottom: 2px solid #667eea;">Qty</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #667eea;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; color: #667eea;">$${orderDetails.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    
    <h3>Shipping Address</h3>
    <p style="background: #f8f9fa; padding: 15px; border-radius: 4px;">${orderDetails.shippingAddress}</p>
    
    <p style="margin-top: 30px;">We'll send you another email once your order ships.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>Questions? Contact us at support@liveshopping.com</p>
    <p>&copy; ${new Date().getFullYear()} Live Shopping Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Order Confirmation #${orderDetails.orderId}`,
    html,
  })
}

export async function sendShowNotification(to: string, showDetails: {
  title: string
  hostName: string
  startTime: string
  showUrl: string
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">🎥 Show Starting Soon!</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #667eea;">${showDetails.title}</h2>
    <p><strong>Host:</strong> ${showDetails.hostName}</p>
    <p><strong>Starting at:</strong> ${new Date(showDetails.startTime).toLocaleString()}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${showDetails.showUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px; font-weight: bold;">Watch Live</a>
    </div>
    
    <p>Don't miss out on exclusive deals and live interactions!</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Live Shopping Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `${showDetails.title} is starting soon!`,
    html,
  })
}

export async function sendVerificationEmail(to: string, verificationLink: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
    
    <p style="color: #666; font-size: 12px; margin-top: 30px;">Or copy and paste this link into your browser:<br>${verificationLink}</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Live Shopping Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: 'Verify your email address',
    html,
  })
}

export async function sendPayoutNotification(to: string, payoutDetails: {
  amount: number
  currency: string
  payoutId: string
  status: string
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">💰 Payout ${payoutDetails.status === 'completed' ? 'Completed' : 'Processing'}</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <p>${payoutDetails.status === 'completed' ? 'Your payout has been processed successfully!' : 'Your payout is being processed.'}</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>Amount:</strong> ${payoutDetails.currency} ${payoutDetails.amount.toFixed(2)}</p>
      <p style="margin: 10px 0;"><strong>Payout ID:</strong> ${payoutDetails.payoutId}</p>
      <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #10b981; text-transform: capitalize;">${payoutDetails.status}</span></p>
    </div>
    
    <p>The funds should appear in your account within 2-5 business days.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Live Shopping Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Payout ${payoutDetails.status === 'completed' ? 'Completed' : 'Processing'} - ${payoutDetails.currency} ${payoutDetails.amount.toFixed(2)}`,
    html,
  })
}
