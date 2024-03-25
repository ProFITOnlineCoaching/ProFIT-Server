// emailTemplates.js

export const confirmEmailTemplate = (fullName, OTP) => {
  return `
    <div style="font-family: 'Arial', sans-serif; color: #333; text-align: center; padding: 20px;">
      <img src="https://img.hotimg.com/Picture15602ed0c19339773.png" alt="Welcome to Our Fitness Platform" style="max-width: 100%; height: auto; margin-bottom: 20px;">
      <h2>Welcome, ${fullName}!</h2>
      <p style="font-size: 16px;">Thank you for joining our Fitness Platform. We're excited to have you on board!</p>
      <p style="font-size: 16px;">Your OTP for email verification is: <strong>${OTP}</strong></p>
      <p style="font-size: 16px;">Please enter this OTP in the provided field to complete your registration.</p>
      <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
};


export const resetPasswordTemplate = (fullName, otpCode) => {
  return `
    <div style="font-family: 'Arial', sans-serif; color: #333; text-align: center; padding: 20px;">
      <img src="https://img.hotimg.com/Picture15602ed0c19339773.png" alt="Password Reset" style="max-width: 100%; height: auto; margin-bottom: 20px;">
      <h2>Welcome, ${fullName}!</h2>
      <p style="font-size: 16px;">We received a request to reset your password. To complete the process, please use the following OTP code:</p>
      <p style="font-size: 24px; font-weight: bold;">${otpCode}</p>
      <p style="font-size: 16px;">Please enter this OTP in the provided field to continue.</p>
      <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
};


export const acceptanceEmailTemplate = (fullName, signInLink) => {
  return `
    <div style="font-family: 'Arial', sans-serif; color: #333; text-align: center; padding: 20px;">
      <img src="https://img.hotimg.com/Picture15602ed0c19339773.png" alt="Congratulations from Our Fitness Platform" style="max-width: 100%; height: auto; margin-bottom: 20px;">
      <h2>Congratulations, ${fullName}!</h2>
      <p style="font-size: 16px;">We are pleased to inform you that your application has been reviewed and you have been accepted to be a trainer on our Fitness Platform.</p>
      <p>To get started, please click the button below to sign in:</p>
      <a href="${signInLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;">Sign In</a>
    </div>
  `;
};


export const refusedEmailTemplate = (fullName) => {
  return `
    <div style="font-family: 'Arial', sans-serif; color: #333333; text-align: center; padding: 20px;">
      <img src="https://img.hotimg.com/Picture15602ed0c19339773.png" alt="Application Update from Our Fitness Platform" style="max-width: 100%; height: auto; margin-bottom: 20px;">
      <h2>Dear ${fullName},</h2>
      <p style="font-size: 16px;">After careful consideration, we regret to inform you that we are unable to accept your application to become a trainer on our Fitness Platform at this time.</p>
      <p style="font-size: 16px;">We appreciate the effort and time you invested in your application. We have a high standard for trainers and a limited number of slots available. This decision does not reflect the quality of your work or your potential as a trainer.</p>
      <p style="font-size: 16px;">We encourage you to apply again in the future and wish you the best in your professional endeavors.</p>
      <p style="font-size: 16px; margin-top: 30px;">Thank you for your interest in joining our platform.</p>
      <p style="font-size: 14px; color: #777777;">If you have any questions or need further clarification, please do not hesitate to contact us.</p>
    </div>
  `;
};