# Kumkang Project Monitoring System — Testing Guide

**Project:** Kumkang Live Project Monitoring System
**Local development:** `npm run dev` (Vite)
**Production preview:** https://kumkang-system.vercel.app/

This guide is for **authorized testers only**. It describes how each portal authenticates,
what test/demo access currently exists, expected permissions, and known limitations.
It does **not** publish real production passwords, API keys, or privileged credentials.

---

## 1. How authentication works in this app

- All authentication is **simulated / local** in the current codebase. Sessions are stored
  in browser `localStorage` and there is **no server-side credential verification** for staff,
  plant, or developer role logins.
- The authorization layer lives in:
  - `src/utils/securityServer.ts` — `verifyServerAuthorization(...)`
  - `src/context/ClientAccessContext.tsx` — `authorizeAction(...)` and credential mutations
- These checks run in the browser app layer. They are **not** a network boundary. This is
  acceptable for internal demos, but it is **not sufficient for a public production site with
  privileged functions.**

---

## 2. Portals, required fields, and current demo/test access

### 2.1 Internal Staff / Administrator

- **Where:** Landing page → `Staff` tab → `Sign In as Administrator`.
- **Required fields:**
  - Employee Number **or** Corporate Email Address (either one is accepted)
  - Staff Password
- **Current demo behavior:**
  - The form is a simulation. Submitting it always switches the session to the **Admin**
    role and records a success event under whatever identifier you typed. There is no
    backend password check for staff.
- **Expected access:**
  - Full internal ERP dashboard, financial approvals, project creation/editing, CRM client
    management, and the Developer-style credential management tool when reached through the
    Developer path.
- **How to verify login/logout:**
  - After login, the portal closes and the dashboard opens. Confirm the role banner shows
    `Admin`.
  - Logout via the topbar or by re-opening the portal and switching back.
- **Note:** No stored staff accounts exist by default. This is a simulated Admin login, not a
  pre-provisioned user.

### 2.2 Plant / Operations

- **Where:** Landing page → `Plant / Ops` tab → `Sign In to Plant Operations`.
- **Required fields:**
  - Site Supervisor / Plant ID **or** Operations Email Address
  - Authorization Password
- **Current demo behavior:**
  - This is also a simulation. On submit, the session becomes **ProjectManager** (the app maps
    plant operations to the Project Manager role) and records a `ProjectManager` success event.
- **Expected access:**
  - Operational features: production records, loading schedules, shell plan verification, and
    site erection checklists as implemented in the dashboard.
- **How to verify login/logout:**
  - Confirm the role banner shows `ProjectManager` after plant login.
  - Use logout to return to the portal.

### 2.3 Client

- **Where:** Landing page → `Client` tab → `Sign In to Portal`.
- **Required fields:**
  - Client ID (for example `KKI-CL-0001`)
  - Password
- **Current demo behavior:**
  - Client login is the only path that performs a real credential check in the app: it looks up
    a registered client by Client ID and verifies the password hash in `securityServer.ts`.
  - If no client is registered, login will fail with “Invalid Client ID / Username or Password.”
- **Expected access:**
  - Only assigned projects. Internal margins, financials, and other clients' records are
    isolated out.
- **How to verify login/logout:**
  - Register a client first through `CRM → + ADD CLIENT` (Admin or PM), or through the Developer
    credential tool.
  - Log in with the issued Client ID and password. Confirm you only see that client's assigned
    projects.
  - Logout returns to the portal.

### 2.4 Developer

- **Where:** Landing page → `Developer` button/header → `Developer Access` overlay.
- **Required fields:**
  - Developer Access Password
- **Current demo behavior:**
  - Developer login is password-protected with a SHA-256 hash configured via
    `VITE_DEVELOPER_PASSWORD_HASH`. It is **not** a simulated switch — the entered password is
    verified against the configured hash.
  - For the current testing setup, the authorized password is the numeric PIN `77`, and the
    hash is configured locally in `.env`. The plaintext PIN is **never** stored in source.
- **Expected access:**
  - Project Manager-style dashboard with the `Generate ID & Password` credential management
    tool and access to audit records.
- **How to verify login/logout:**
  - With `VITE_DEVELOPER_PASSWORD_HASH` configured and the correct password, the dashboard
    unlocks.
  - With it misconfigured or missing, login shows: “Developer access is not configured on this
    deployment.”
  - With the wrong password, login shows: “Invalid Developer password. Access denied.”
  - Logout returns to the portal.
- **Known limitation:**
  - This is still a frontend-only hash check. For a public site with privileged credential
    management, move Developer authentication and authorization to a real backend (serverless
    function, session store, and role/audit enforcement) before production use.

### 2.5 Project Manager (Plant Operations)

- **Where:** Same plant login path as 2.2, and also reachable through the CRM role switcher.
- **Required fields:**
  - Site Supervisor / Plant ID **or** Operations Email
  - Authorization Password
- **Current demo behavior:**
  - The plant login switches the session to `ProjectManager`.
  - PM can generate client credentials, create clients, assign projects, and reset passwords.
- **Expected access:**
  - Project and client management functions allowed to PMs.
- **Restrictions (enforced by the app layer):**
  - PM **cannot** access Developer-only audit records.
  - PM **cannot** change account status or other credential-admin actions.
- **How to verify:**
  - After plant/PM login, open `CRM`. The `+ ADD CLIENT` button should be available.
  - Try the credential modal in PM mode and confirm account-status controls and Access Records
    are not usable.

---

## 3. Admin Mode and PM Mode buttons

- These buttons are **evaluation shortcuts**. They are not real logins.
- They now require `VITE_DEMO_MODE=true` to function.
  - Local / authorized demo: set `VITE_DEMO_MODE=true`.
  - Public production: leave it unset or `false`. The buttons stay visible but show a disabled
    notice and never switch roles.
- They do **not** remove legitimate Admin or Project Manager login functionality.

---

## 4. Global Footprint map

- Leaflet-based with seven real corporate nodes and their coordinates.
- Initial view is now set to a slightly wider region and fits all nodes inside a bounding box so
  the Americas, Africa, and the Asian locations are visible together.
- Permanent labels are intentionally limited to the HQ node; other locations show on hover/click,
  which removes the East Africa / Southeast Asia label collision.
- Attribution, zoom controls, connection lines, selected-node details panel, and the “Verified
  Operational Node” indicator are preserved.

---

## 5. Role permission summary

| Role | Credential mechanism | Key allowed functions | Key restrictions |
|---|---|---|---|
| Admin | Simulated staff login | Full ERP, client management, dashboard | — |
| Plant / Ops | Simulated plant login → PM role | Operational views + PM-level credential management | Mapped to PM role; no Developer audit access |
| Project Manager | Simulated PM login / plant login | Client credential generation, project assignment, password reset | No account-status changes, no Developer audit records |
| Client | Real hash-verified login | Assigned projects only | No other clients, no internal notes, no admin/developer areas |
| Developer | Hash-verified password (frontend) | Credential management, audit records | Business data editing only with explicit permission |

---

## 6. How authorized testers obtain credentials

- **Staff / Plant / PM (demo):** use the demo shortcuts with `VITE_DEMO_MODE=true` for local
  testing. These create a session instantly; they do **not** represent real accounts.
- **Client:** register through `CRM → + ADD CLIENT` (Admin or PM) or via the Developer credential
  modal. Record the issued Client ID and password securely. The demo registration flow hashes the
  password; the plaintext password is shown once in the confirmation panel and is not stored.
- **Developer:** configure `VITE_DEVELOPER_PASSWORD_HASH` in the environment and use the authorized
  password for the current testing setup. The password itself is not published here.

---

## 7. Known limitations and required configuration

- No server-side session store. Sessions live in `localStorage`.
- Staff/Plant/Demo role switches are **not** real authentication.
- Developer password is hashed and checked in the browser only.
- Client isolation is enforced in the app layer by `verifyServerAuthorization`, not by a backend.
- To make this production-safe for privileged functions, add server-side auth, a real session
  store, and server-side authorization for credential-management actions.

---

## 8. Secrets and commits

- `.env`, passwords, API keys, and other secrets are gitignored and are **not** committed.
- This guide intentionally avoids publishing passwords or privileged credentials.
