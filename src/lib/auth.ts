/**
 * Auth wrapper module for backward compatibility
 * Re-exports auth-comfilar functions and provides auth object for better-auth compatibility
 */

// Re-export auth-comfilar functions
export {
  hashPassword,
  verifyPassword,
  getUserByEmail,
  getUserById,
  createUser,
  loginUser,
  getAllUsers,
  deleteUser,
  updateUserType,
  validateToken,
  getTokenFromHeader,
} from "./auth-comfilar";

// For files that import { auth } from ~/lib/auth
// This is a stub since we're using custom token-based auth, not better-auth
export const auth = {
  // Stub auth object for compatibility
  api: {
    getSession: async () => null,
  },
};

// Get current user from token (for server-side)
export async function getCurrentUser() {
  // This would normally be implemented to get user from request context
  // For now, returns null - actual implementation depends on how you handle sessions
  return null;
}

// Get current user or redirect (for server-side)
export async function getCurrentUserOrRedirect(
  forbiddenUrl?: string,
  okUrl?: string,
  redirectIfLoggedIn?: boolean,
) {
  // Placeholder: integrate with your auth/session system.
  // Accepts optional params to match existing call sites.
  // Currently a no-op.
  return;
}
