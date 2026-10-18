/**
 * RUNTIME TEST CREDENTIAL STORE (hashes only)
 *
 * This is the only file that should ever contain test password hashes. It is
 * committed so fresh clones and the Vercel build resolve the static import, but
 * it contains ONLY salted SHA-256 hashes — never plaintext. If it is missing or
 * does not contain every test account, test login is disabled with a clear
 * "not configured" message.
 *
 * IMPORTANT:
 *  - This file contains ONLY password hashes. Never store plaintext passwords here.
 *  - Re-seed with `npx tsx scripts/seedTestCredentials.ts` (authorized setup only).
 *  - Authorized testers receive the actual passwords out-of-band. See TESTING_GUIDE.md.
 *
 * TEST ACCOUNT IDs (passwords are shared out-of-band and intentionally NOT stored here):
 *   TST-ADMIN-01          Administrator
 *   TST-PM-01             Project Manager
 *   TST-STAFF-01          Internal Staff
 *   TST-OPS-01            Plant / Operations
 *   TST-CLIENT-01         Client
 *   TST-DEV-01            Developer
 *   Developer (Dev tab)   uses VITE_DEVELOPER_PASSWORD_HASH from .env
 *
 * NOTE: In the current implementation the Staff and Plant/Ops login tabs are
 * simulated (no backend). Only the Admin Mode, PM Mode, Client, and Developer
 * tabs do real credential verification.
 */

// Stable test account identifiers. These are intentionally artificial and
// prefixed so they can never be confused with real staff/client IDs.
// NOTE: This constant is intentionally duplicated in testAuth.ts (same values)
// instead of being re-exported from there, so this store has zero imports and
// can be safely imported by testAuth without creating a circular dependency.
export const TEST_ACCOUNT_IDS = {
  admin: 'TST-ADMIN-01',
  projectManager: 'TST-PM-01',
  staff: 'TST-STAFF-01',
  plantOperations: 'TST-OPS-01',
  client: 'TST-CLIENT-01',
  developer: 'TST-DEV-01',
} as const;

export type TestAccountKind =
  | 'admin'
  | 'projectManager'
  | 'staff'
  | 'plantOperations'
  | 'client'
  | 'developer';

// SHA-256 hashes: SHA-256(password + "KKI_SECURE_SALT_2026_v1!")
// Generated 2026-10-18 — rotate with seedTestCredentials.ts when passwords change.
const TEST_PASSWORD_HASHES: Record<TestAccountKind, string> = {
  admin:           'f7d45819ab5b8f77218be2a12b6d2821348cfc455cc609f83658a607b6e1735a',
  projectManager:  'db097d2a310180cd5579d095abf442a46c2bb12c1bd5e8f13a44b9fe66164d94',
  staff:           'ac04bb0f4d9347430a13876c8c7e41ccbae5ff06685dfed9854a61047b795f1a',
  plantOperations: 'e6a0a0d724dd8f9e2971bf9370262513ec1181d03a9636c460c5385e16422415',
  client:          '793744bb429e87fb738d90a651d27c72f07703675b52c8cb159f9628538e6a1d',
  developer:       'e1db984d04c2bd3e2d55465cd3500e4f9033c82b8447148fef2af2349ef6f04a',
};

export default TEST_PASSWORD_HASHES;

// Named export for callers that prefer it
export { TEST_PASSWORD_HASHES };
