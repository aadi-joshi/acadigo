const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email
exports.sendEmail = async (options) => {
  const message = {
    from: `PPT Access Control System <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(message);
};

// Email templates
exports.templates = {
  // New PPT uploaded
  newPPT: (ppt, batch) => ({
    subject: `New PPT Available: ${ppt.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #0ea5e9;">New PPT Available</h2>
        <p>A new PPT has been uploaded to your batch.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${ppt.title}</h3>
          <p>${ppt.description || 'No description provided.'}</p>
        </div>
        <p>You can view this PPT by logging into your account.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/ppts" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View PPT</a>
      </div>
    `
  }),

  // New assignment uploaded
  newAssignment: (assignment, batch) => ({
    subject: `New Assignment: ${assignment.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #0ea5e9;">New Assignment</h2>
        <p>A new assignment has been posted to your batch.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${assignment.title}</h3>
          <p>${assignment.description || 'No description provided.'}</p>
          <p><strong>Deadline:</strong> ${new Date(assignment.deadline).toLocaleString()}</p>
        </div>
        <p>Please submit your work before the deadline.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/assignments" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Assignment</a>
      </div>
    `
  }),

  // Assignment deadline reminder
  deadlineReminder: (assignments) => ({
    subject: `Upcoming Assignment Deadlines`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #0ea5e9;">Upcoming Assignment Deadlines</h2>
        <p>This is a reminder about your upcoming assignment deadlines:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${assignments.map(a => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
              <h3 style="margin-top: 0;">${a.title}</h3>
              <p><strong>Deadline:</strong> ${new Date(a.deadline).toLocaleString()}</p>
            </div>
          `).join('')}
        </div>
        <p>Please make sure to submit your work on time.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/assignments" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Assignments</a>
      </div>
    `
  }),

  // Assignment graded
  assignmentGraded: (submission, assignment) => ({
    subject: `Your Assignment "${assignment.title}" Has Been Graded`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #0ea5e9;">Assignment Graded</h2>
        <p>Your submission for the assignment "${assignment.title}" has been graded.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Score:</strong> ${submission.score}/${assignment.maxScore}</p>
          ${submission.feedback ? `<p><strong>Feedback:</strong> ${submission.feedback}</p>` : ''}
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/assignments" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Details</a>
      </div>
    `
  })
};
