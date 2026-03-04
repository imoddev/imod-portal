// Auth Configuration
// Admin can change these settings

export const authConfig = {
  // Set to true to allow anyone to sign up
  // Default: false (invite-only mode)
  allowPublicSignup: false,

  // Whitelisted emails that can login (when allowPublicSignup is false)
  // Admin can add emails here or manage via admin panel later
  allowedEmails: [
    // Add allowed emails here
    // "user@gmail.com",
  ] as string[],

  // Whitelisted domains (all emails from these domains can login)
  allowedDomains: [
    "modmedia.asia",
  ] as string[],
};

// Helper function to check if email is allowed
export function isEmailAllowed(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  const domain = lowerEmail.split("@")[1];

  // If public signup is enabled, allow everyone
  if (authConfig.allowPublicSignup) {
    return true;
  }

  // Check if email is in whitelist
  if (authConfig.allowedEmails.includes(lowerEmail)) {
    return true;
  }

  // Check if domain is in whitelist
  if (authConfig.allowedDomains.includes(domain)) {
    return true;
  }

  return false;
}
