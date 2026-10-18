/**
 * Test-account auth helpers (frontend-only demo auth).
 *
 * This module re-exports the stable test account IDs from the hash store and
 * provides thin wrappers around the salted SHA-256 helpers in
 * utils/securityServer.ts. The store itself has zero imports so importing it
 * here cannot create a circular dependency.
 */
import {
  TEST_ACCOUNT_IDS,
  TEST_PASSWORD_HASHES,
  type TestAccountKind,
} from './testCredentialsStore';
import {
  hashPassword,
  verifyPassword,
  generateSecurePassword,
} from './utils/securityServer';
import type { UserRole } from './types/clientAccess';

export { TEST_ACCOUNT_IDS, TEST_PASSWORD_HASHES };
export type { TestAccountKind };

export const TEST_PREFIX = 'TST-';

export interface TestAccountRecord {
  kind: TestAccountKind;
  testId: string;
  role: UserRole;
  displayName: string;
  assignedProjects: string[];
  createdAt: string;
}

export const TEST_ACCOUNT_DISPLAY_NAMES: Record<TestAccountKind, string> = {
  admin: 'TEST Admin',
  projectManager: 'TEST Project Manager',
  staff: 'TEST Internal Staff',
  plantOperations: 'TEST Plant / Operations',
  client: 'TEST Client',
  developer: 'TEST Developer',
};

export const TEST_CLIENT_PROJECT_ID = `${TEST_PREFIX}PROJECT-01`;

export function isTestEnvironmentEnabled(): boolean {
  try {
    const h = TEST_PASSWORD_HASHES as unknown as Record<string, unknown>;
    const values = [h.admin, h.projectManager, h.staff, h.plantOperations, h.client, h.developer];
    return values.every((v) => typeof v === 'string' && v.length > 0);
  } catch {
    return false;
  }
}

export const TEST_ENVIRONMENT = isTestEnvironmentEnabled();

export function describeTestAccount(kind: TestAccountKind): TestAccountRecord {
  return {
    kind,
    testId: TEST_ACCOUNT_IDS[kind],
    role:
      kind === 'admin'
        ? 'Admin'
        : kind === 'projectManager' || kind === 'plantOperations'
          ? 'ProjectManager'
          : kind === 'developer'
            ? 'Developer'
            : kind === 'client'
              ? 'Client'
              : 'Admin',
    displayName: TEST_ACCOUNT_DISPLAY_NAMES[kind],
    assignedProjects: kind === 'client' ? [TEST_CLIENT_PROJECT_ID] : [],
    createdAt: new Date().toISOString(),
  };
}

export function listTestAccounts(): TestAccountRecord[] {
  return (Object.keys(TEST_ACCOUNT_IDS) as TestAccountKind[]).map(describeTestAccount);
}

export function generateTestPassword(): string {
  return generateSecurePassword();
}

export async function hashTestPassword(password: string): Promise<string> {
  return hashPassword(password);
}

export async function verifyTestPassword(password: string, storedHash: string): Promise<boolean> {
  return verifyPassword(password, storedHash);
}

export async function generateTestCredentials(): Promise<{
  accounts: TestAccountRecord[];
  passwordHashes: Record<string, string>;
  generatedPasswords: Record<string, string>;
}> {
  const accounts = listTestAccounts();
  const passwordHashes: Record<string, string> = {};
  const generatedPasswords: Record<string, string> = {};
  for (const account of accounts) {
    const password = generateTestPassword();
    const hash = await hashTestPassword(password);
    passwordHashes[account.kind] = hash;
    generatedPasswords[account.kind] = password;
  }
  return { accounts, passwordHashes, generatedPasswords };
}

export function testRoleForAccount(kind: TestAccountKind): UserRole {
  return describeTestAccount(kind).role;
}

export function isTestClientReadOnly(kind: TestAccountKind): boolean {
  return kind === 'client';
}
