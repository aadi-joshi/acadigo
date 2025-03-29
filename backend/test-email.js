require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

async function testEmailSystem() {
  console.log('Testing email system...');
  console.log('Using configuration:');
  console.log(`- EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log(`- FORCE_SEND_EMAILS: ${process.env.FORCE_SEND_EMAILS}`);
  
  // Set recipient (replace with your email for testing)
  const recipientEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
  
  if (recipientEmail.includes('example.com')) {
    console.error('\nERROR: Your test email is using example.com domain which cannot receive emails!');
    console.error('Please update TEST_EMAIL in your .env file to a real email address you can access.');
    return;
  }
  
  console.log(`\nIMPORTANT: Please check both inbox and spam folder of ${recipientEmail} for test emails.`);
  
  // Test a plain email
  try {
    console.log(`\nSending plain test email to ${recipientEmail}...`);
    const plainResult = await sendEmail(
      recipientEmail,
      'Test Email - Plain Text',
      'This is a test email to verify that the email system is working correctly.',
      null
    );
    console.log('Plain email result:', plainResult);
    
    if (plainResult.success) {
      console.log('\n✅ Plain email sent successfully!');
    } else {
      console.error('\n❌ Failed to send plain email:', plainResult.error);
    }
  } catch (error) {
    console.error('Plain email error:', error);
  }
  
  // Test a template email
  try {
    console.log(`\nSending template test email to ${recipientEmail}...`);
    const templateResult = await sendEmail(
      recipientEmail,
      'Test Email - Template',
      'This is a test email with template.',
      'newAssignment',
      { 
        assignment: {
          title: 'Test Assignment',
          description: 'This is a test assignment description',
          deadline: new Date(Date.now() + 7*24*60*60*1000)  // 1 week from now
        },
        batch: {
          name: 'Test Batch'
        }
      }
    );
    console.log('Template email result:', templateResult);
    
    if (templateResult.success) {
      console.log('\n✅ Template email sent successfully!');
    } else {
      console.error('\n❌ Failed to send template email:', templateResult.error);
    }
  } catch (error) {
    console.error('Template email error:', error);
  }
  
  console.log('\nEmail tests completed.');
  console.log('\nTROUBLESHOOTING:');
  console.log('1. Check both inbox and spam folders');
  console.log('2. If using Gmail, ensure "Less secure app access" is enabled or use an App Password');
  console.log('3. Wait a few minutes as email delivery can sometimes be delayed');
}

testEmailSystem();
