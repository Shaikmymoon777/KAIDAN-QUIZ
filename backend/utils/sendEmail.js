const nodemailer = require('nodemailer');
const ErrorResponse = require('./errorResponse');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (HTML)
 * @param {string} [options.from] - Sender email (defaults to SMTP_USER)
 * @returns {Promise<Object>} - Result of the send operation
 */
const sendEmail = async ({ email, subject, message, from }) => {
  try {
    const mailOptions = {
      from: from || `"${process.env.EMAIL_FROM_NAME || 'Japanese Learning'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new ErrorResponse('Email could not be sent', 500);
  }
};

module.exports = sendEmail;
