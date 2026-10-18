import { generateTestCredentials, TEST_ACCOUNT_IDS } from '../src/testAuth';
import { writeFileSync } from 'fs';

const { passwordHashes, generatedPasswords } = await generateTestCredentials();

// generateTestCredentials() keys passwordHashes/generatedPasswords by account
// kind ('admin', 'staff', ...) so they line up 1:1 with the TestAccountKind
// keys in TEST_PASSWORD_HASHES. Do NOT re-key by TST-* display ID — the store
// and isTestEnvironmentEnabled() both expect kind keys. The display map below
// is only for the one-time console output to authorized testers.

const idByKind: Record<string, string> = TEST_ACCOUNT_IDS as unknown as Record<string, string>;
const nonDevPasswords: Record<string, string> = {};
for (const key of Object.keys(generatedPasswords) as (keyof typeof generatedPasswords)[]) {
  if (key === 'developer') continue;
  const displayId = idByKind[key as string] ?? (key as string);
  nonDevPasswords[displayId] = generatedPasswords[key];
}

const storePath = 'src/testCredentialsStore.ts';
const hashesJson = JSON.stringify(passwordHashes, null, 2);
const lines = [
  '/**',
  ' * RUNTIME TEST CREDENTIAL STORE (hashes only)',
  ' *',
  ' * This is the only file that should ever contain test password hashes. It is',
  ' * committed so fresh clones and the Vercel build resolve the static import, but',
  ' * it contains ONLY salted SHA-256 hashes - never plaintext. If it is missing or',
  ' * does not contain every test account, test login is disabled with a clear',
  ' * "not configured" message.',
  ' *',
  ' * IMPORTANT:',
  ' *  - This file contains ONLY password hashes. Never store plaintext passwords here.',
  ' *  - Re-seed with npx tsx scripts/seedTestCredentials.ts (authorized setup only).',
  ' *  - Authorized testers receive the actual passwords out-of-band. See TESTING_GUIDE.md.',
  ' *',
  ' * TEST ACCOUNT IDs (passwords are shared out-of-band and intentionally NOT stored here):',
  ' *   TST-ADMIN-01          Administrator',
  ' *   TST-PM-01             Project Manager',
  ' *   TST-STAFF-01          Internal Staff',
  ' *   TST-OPS-01            Plant / Operations',
  ' *   TST-CLIENT-01         Client',
  ' *   TST-DEV-01            Developer',
  ' *   Developer (Dev tab)   uses VITE_DEVELOPER_PASSWORD_HASH from .env',
  ' */',
  '',
  '// Stable test account identifiers, duplicated here (same values as testAuth.ts)',
  '// so this store has zero imports and cannot create a circular dependency.',
  '// Do NOT import them from testAuth - that cycle breaks the browser bundle.',
  'export const TEST_ACCOUNT_IDS = {',
  "  admin: 'TST-ADMIN-01',",
  "  projectManager: 'TST-PM-01',",
  "  staff: 'TST-STAFF-01',",
  "  plantOperations: 'TST-OPS-01',",
  "  client: 'TST-CLIENT-01',",
  "  developer: 'TST-DEV-01',",
  '} as const;',
  '',
  'export type TestAccountKind =',
  "  | 'admin'",
  "  | 'projectManager'",
  "  | 'staff'",
  "  | 'plantOperations'",
  "  | 'client'",
  "  | 'developer';",
  '',
  '// SHA-256 hashes: SHA-256(password + KKI salt). Rotate when passwords change.',
  'const TEST_PASSWORD_HASHES: Record<TestAccountKind, string> = ' + hashesJson + ';',
  '',
  'export default TEST_PASSWORD_HASHES;',
  '',
  '// Named export for callers that prefer it',
  'export { TEST_PASSWORD_HASHES };',
  '',
];
writeFileSync(storePath, lines.join('\n'), 'utf8');
console.log('Wrote', storePath);
console.log('SHOW_THESE_ONCE_TO_AUTHORIZED_TESTERS_THEN_ERASE_OR_SECURELY_STORE_OUT_OF_BAND:');
console.log(JSON.stringify(nonDevPasswords, null, 2));
