const nodemailer = require('nodemailer');

// Create transporter
let transporter;

// Allow forcing email sending in development with an environment variable
const shouldSendRealEmails = process.env.NODE_ENV === 'production' || process.env.FORCE_SEND_EMAILS === 'true';

if (shouldSendRealEmails) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  // For development, log emails to console
  transporter = {
    sendMail: (mailOptions) => {
      console.log('Email would be sent in production:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Text:', mailOptions.text);
      return Promise.resolve();
    }
  };
}

// Send email
const sendEmail = async (to, subject, text, template, data = {}) => {
  try {
    let html = text;
    
    // Generate HTML from template if provided
    if (template && templates[template]) {
      html = templates[template](data);
    }
    
    const message = {
      from: `Acadigo <${process.env.EMAIL_FROM || 'noreply@acadigo.com'}>`,
      to,
      subject,
      text,
      html,
    };
    
    // Add debugging info
    console.log(`Attempting to send email to: ${to}`);
    
    const info = await transporter.sendMail(message);
    console.log(`Email ${shouldSendRealEmails ? 'sent' : 'would be sent'} with ID: ${info?.messageId || 'N/A'}`);
    return { success: true, info };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const templates = {
  newPPT: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #0ea5e9;">New PPT Available</h2>
      <p>A new PPT has been uploaded to your batch.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.ppt?.title || 'New PPT'}</h3>
        <p>${data.ppt?.description || 'No description provided.'}</p>
      </div>
      <p>You can view this PPT by logging into your account.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/ppts" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View PPT</a>
    </div>
  `,
  
  newAssignment: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #0ea5e9;">New Assignment</h2>
      <p>A new assignment has been posted to your batch.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.assignment?.title || 'New Assignment'}</h3>
        <p>${data.assignment?.description || 'No description provided.'}</p>
        <p><strong>Deadline:</strong> ${new Date(data.assignment?.deadline).toLocaleString()}</p>
      </div>
      <p>Please submit your work before the deadline.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/assignments" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Assignment</a>
    </div>
  `,
  
  submissionNotification: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #0ea5e9;">Assignment Submission</h2>
      <p>${data.student?.name || 'A student'} has submitted an assignment.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Assignment: ${data.assignment?.title || 'Assignment'}</h3>
        <p><strong>Student:</strong> ${data.student?.name || 'Unknown'}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>You can review and grade this submission from your dashboard.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/trainer/assignments" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Submissions</a>
    </div>
  `,
  
  assignmentGraded: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #0ea5e9;">Assignment Graded</h2>
      <p>Your assignment submission has been graded.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Assignment: ${data.submission?.assignment?.title || 'Assignment'}</h3>
        <p><strong>Score:</strong> ${data.submission?.marks || '0'}/${data.submission?.assignment?.maxMarks || '100'}</p>
        ${data.submission?.feedback ? `<p><strong>Feedback:</strong> ${data.submission.feedback}</p>` : ''}
      </div>
      <p>You can view the details from your dashboard.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/assignments" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Assignment</a>
    </div>
  `,
};

module.exports = {
  sendEmail,
  templates
};
