const nodemailer = require('nodemailer');

// Create reusable transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Send batch notification
const sendBatchNotification = async (batch, subject, text, html) => {
  try {
    const users = await require('../models/User').find({ batch: batch._id, role: 'student' });
    
    if (users.length === 0) {
      console.log('No students found in batch to send notifications');
      return;
    }
    
    // Extract email addresses
    const emails = users.map(user => user.email);
    
    // Send group email with BCC
    await sendEmail({
      to: process.env.EMAIL_FROM_ADDRESS, // Send to self
      bcc: emails,
      subject,
      text,
      html
    });
    
    return { count: emails.length };
  } catch (error) {
    console.error('Batch notification error:', error);
    throw new Error('Failed to send batch notification');
  }
};

// Send new PPT notification
const sendNewPPTNotification = async (ppt, batch) => {
  const subject = `New PPT Available: ${ppt.title}`;
  const text = `A new PPT "${ppt.title}" has been uploaded to your batch. You can access it from your dashboard.`;
  const html = `
    <h1>New PPT Available</h1>
    <p>A new PPT has been uploaded to your batch:</p>
    <ul>
      <li><strong>Title:</strong> ${ppt.title}</li>
      <li><strong>Batch:</strong> ${batch.name}</li>
    </ul>
    <p>You can access it from your <a href="${process.env.FRONTEND_URL}/ppts">dashboard</a>.</p>
  `;
  
  return sendBatchNotification(batch, subject, text, html);
};

// Send new assignment notification
const sendNewAssignmentNotification = async (assignment, batch) => {
  const deadline = new Date(assignment.deadline).toLocaleString();
  
  const subject = `New Assignment: ${assignment.title}`;
  const text = `A new assignment "${assignment.title}" has been assigned to your batch. Deadline: ${deadline}. You can access it from your dashboard.`;
  const html = `
    <h1>New Assignment</h1>
    <p>A new assignment has been assigned to your batch:</p>
    <ul>
      <li><strong>Title:</strong> ${assignment.title}</li>
      <li><strong>Batch:</strong> ${batch.name}</li>
      <li><strong>Deadline:</strong> ${deadline}</li>
    </ul>
    <p>You can access it from your <a href="${process.env.FRONTEND_URL}/assignments">dashboard</a>.</p>
  `;
  
  return sendBatchNotification(batch, subject, text, html);
};

// Send deadline reminder notification
const sendDeadlineReminderNotification = async (assignment, batch) => {
  const deadline = new Date(assignment.deadline).toLocaleString();
  
  const subject = `Deadline Reminder: ${assignment.title}`;
  const text = `Reminder: The deadline for assignment "${assignment.title}" is approaching. Deadline: ${deadline}. Please submit your work on time.`;
  const html = `
    <h1>Deadline Reminder</h1>
    <p>The deadline for an assignment is approaching:</p>
    <ul>
      <li><strong>Title:</strong> ${assignment.title}</li>
      <li><strong>Batch:</strong> ${batch.name}</li>
      <li><strong>Deadline:</strong> ${deadline}</li>
    </ul>
    <p>Please submit your work before the deadline. You can access the assignment from your <a href="${process.env.FRONTEND_URL}/assignments/${assignment._id}">dashboard</a>.</p>
  `;
  
  return sendBatchNotification(batch, subject, text, html);
};

// Send graded assignment notification
const sendGradedAssignmentNotification = async (submission) => {
  try {
    const assignment = await require('../models/Assignment').findById(submission.assignment);
    const student = await require('../models/User').findById(submission.student);
    
    if (!assignment || !student) {
      console.error('Assignment or student not found');
      return;
    }
    
    const subject = `Assignment Graded: ${assignment.title}`;
    const text = `Your submission for assignment "${assignment.title}" has been graded. Grade: ${submission.marks}/${assignment.maxMarks}.`;
    const html = `
      <h1>Assignment Graded</h1>
      <p>Your submission for the following assignment has been graded:</p>
      <ul>
        <li><strong>Title:</strong> ${assignment.title}</li>
        <li><strong>Grade:</strong> ${submission.marks}/${assignment.maxMarks}</li>
      </ul>
      <p>${submission.feedback ? `<strong>Feedback:</strong> ${submission.feedback}` : ''}</p>
      <p>You can view the details from your <a href="${process.env.FRONTEND_URL}/assignments/${assignment._id}">dashboard</a>.</p>
    `;
    
    await sendEmail({
      to: student.email,
      subject,
      text,
      html
    });
    
    return { success: true };
  } catch (error) {
    console.error('Graded notification error:', error);
    throw new Error('Failed to send graded notification');
  }
};

module.exports = {
  sendEmail,
  sendBatchNotification,
  sendNewPPTNotification,
  sendNewAssignmentNotification,
  sendDeadlineReminderNotification,
  sendGradedAssignmentNotification
};
