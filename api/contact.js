const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, company, phone, 'service-type': serviceType, message } = req.body;

    // Validate required fields
    if (!name || !email || !serviceType || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create transporter using Gmail SMTP (set environment variables in Vercel)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD // Your Gmail App Password
      }
    });

    // Email content
    const emailContent = `
    New Contact Form Submission - Accelerobotics Website

    ===== CONTACT DETAILS =====
    Name: ${name}
    Email: ${email}
    Company: ${company || 'Not provided'}
    Phone: ${phone || 'Not provided'}
    Service Type: ${serviceType}

    ===== MESSAGE =====
    ${message}

    ===== SUBMISSION DETAILS =====
    Date: ${new Date().toLocaleString()}
    IP: ${req.headers['x-forwarded-for'] || req.connection?.remoteAddress}
    User Agent: ${req.headers['user-agent']}
    `;

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'accelerorobotics@gmail.com',
      subject: `New ${serviceType} Inquiry from ${name} - Accelerobotics`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Service Type:</strong> <span style="background: #1e40af; color: white; padding: 4px 8px; border-radius: 4px;">${serviceType}</span></p>
          </div>
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; font-size: 12px; color: #6b7280;">
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From Website:</strong> Accelerobotics Contact Form</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${email}" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reply to ${name}
            </a>
          </div>
        </div>
      `
    };

    // Send email to your inbox
    await transporter.sendMail(mailOptions);

    // Send auto-reply to customer
    const autoReplyOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Accelerobotics!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Accelerobotics</h1>
            <p style="margin: 10px 0 0 0;">Making Robotics Accessible</p>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #1e40af;">Thank you for your inquiry, ${name}!</h2>
            <p>We've received your message about <strong>${serviceType}</strong> and our team will get back to you within 24 hours.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">What happens next?</h3>
              <ul style="color: #6b7280; line-height: 1.6;">
                <li>Our robotics specialists will review your requirements</li>
                <li>We'll prepare a customized solution proposal</li>
                <li>You'll receive a detailed response within 24 hours</li>
                <li>We can schedule a free consultation or live demo</li>
              </ul>
            </div>
            <p style="color: #6b7280;">In the meantime, feel free to explore our <a href="#" style="color: #1e40af;">robot catalog</a> or learn more about our <a href="#" style="color: #1e40af;">services</a>.</p>
            <div style="margin-top: 30px; padding: 20px; background: #1e40af; color: white; border-radius: 8px; text-align: center;">
              <p style="margin: 0;"><strong>Need immediate assistance?</strong></p>
              <p style="margin: 10px 0 0 0;">Email us directly at <a href="mailto:accelerorobotics@gmail.com" style="color: #60a5fa;">accelerorobotics@gmail.com</a></p>
            </div>
          </div>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">Let's build the future of smart business together.</p>
            <p style="margin: 10px 0 0 0;">&copy; 2025 Accelerobotics. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(autoReplyOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (err) {
  console.error('Nodemailer error:', err); // This will show details in Vercel logs
  return res.status(500).json({ success: false, message: 'Failed to send email' });
}

}

