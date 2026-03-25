# Changelog

All notable changes to **Sva-Rajya** are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- CI/CD pipeline with GitHub Actions (lint, type-check, build)
- PR template for structured code reviews
- CHANGELOG.md for tracking all changes
- `develop` branch for staging workflow
- Bank summary backend covering accounts, cash wallet, liquidity settings, and derived flow metrics
- Supabase-ready branded confirmation email template at `supabase-email-templates/confirm-signup.html`

### Changed
- Bank hub, add-account, cash, flow, and idle screens now use the backend summary API instead of local seeded bank state
- Dashboard bank guidance now reads real bank account counts from the API
- Prisma config now loads `.env.local` automatically for local CLI commands

### Fixed
- Duplicate `disabled` props removed from the bank add-account save button
- Bank account save button now exits early when saving is in progress or a duplicate warning is active

---

## [0.2.0] - 2026-03-17

### Added
- Cinematic 3-screen onboarding (`/intro`) with Arthashastra-inspired treasury motif
- Welcome-back screen for returning users with name and last login date
- "I already have a Rajya →" escape hatch on `/onboarding/name`
- AlertToast suppression on intro/start/onboarding screens

### Fixed
- Logout now properly clears Supabase session (hard redirect via `window.location.href`)
- AuthSync correctly fetches profile from DB API instead of empty in-memory store
- AuthSync redirect now works from `/dashboard` (removed incorrect pathname guard)
- Bottom nav logout wired to proper `supabase.auth.signOut()`

### Changed
- Root URL (`/`) redirects to `/intro` instead of `/start`
- GlobalTopRightMenu hidden on `/intro` and `/dashboard`
- BottomNav hidden on `/intro`
- Middleware updated: `/intro` added as public route

---

## [0.1.1] - 2026-03-09

### Added
- Supabase authentication setup (email/password + Google OAuth)
- Forgot password flow
- Global theme toggle (dark/light mode)

### Fixed
- Next.js 14 viewport/themeColor metadata warning
- Prisma `postinstall` script for Vercel builds
- Google Drive scope removed to fix 403 error

---

## [0.1.0] - 2026-02-20

### Added
- Core modules 1–5: Foundation, Identity Vault, Credentials, Kosh, Vyaya
- Bank Hub (Pravah Mandal) with balance audit trail
- Dashboard with Rajya Map, Health Score, and Mandal cards
- Bottom navigation with More menu
- Notification system with AlertToast
- Document validation layer for identity documents
- OPFS vault, cloud sync, and auth security (Phase 4)
- Prisma schema for all modules