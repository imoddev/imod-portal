// Auth Configuration
// Admin can change these settings

export const authConfig = {
  // Set to true to allow anyone to sign up
  // Default: false (invite-only mode)
  allowPublicSignup: false,

  // Whitelisted domains (all emails from these domains can login)
  allowedDomains: [
    "modmedia.asia",
  ] as string[],
};

// Helper function to check if email is allowed
// This is used for static checks only (domains)
export function isEmailAllowedStatic(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  const domain = lowerEmail.split("@")[1];

  // If public signup is enabled, allow everyone
  if (authConfig.allowPublicSignup) {
    return true;
  }

  // Check if domain is in whitelist
  if (authConfig.allowedDomains.includes(domain)) {
    return true;
  }

  return false;
}
