# Changelog

All notable changes to **Sva-Rajya** are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- CI/CD pipeline with GitHub Actions (lint, type-check, build)
- PR template for structured code reviews
- CHANGELOG.md for tracking all changes
- `develop` branch for staging workflow

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



$envFile = ".\sva-rajya-main\.env.local"; $resendKey = (Get-Content $envFile | Where-Object { $_ -match '^RESEND_API_KEY=' } | Select-Object -First 1).Split('=',2)[1]; if (-not $resendKey) { throw 'RESEND_API_KEY not found in .env.local' }; $headers = @{ Authorization = "Bearer $resendKey"; 'Content-Type' = 'application/json' }; $payload = @{ from = 'onboarding@svarajya.com'; to = @('praveen94h@gmail.com'); subject = 'Svarajya Resend Test'; text = 'This is a test email sent from the Svarajya setup using Resend. If you received this, outbound email delivery is working.' } | ConvertTo-Json -Depth 5; try { $response = Invoke-RestMethod -Method Post -Uri 
'https://api.resend.com/emails' -Headers $headers -Body $payload; $response | ConvertTo-Json -Depth 6 } catch { if ($_.Exception.Response) { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $body = $reader.ReadToEnd(); Write-Output $body } else { throw } }