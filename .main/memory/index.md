# Memory: index.md
Updated: now

Supabase self-hosted URL: https://lbxjyxovbcprhatsbvkp.supabase.co
App name: FitCoach Pro
Auth: Supabase auth with email/password, roles via profiles.role (single source of truth)
Design system: blue/green/orange fitness palette, Plus Jakarta Sans display, Inter body
Sidebar navigation with dark theme, DashboardLayout wrapper
All protected routes require authentication

## Multi-Tenant Architecture (v2)
- Roles: super_admin, admin, coach, client
- Gyms table = tenants, isolated by gym_id on profiles
- TenantContext provides gym/role/status to all components
- GymStatusBanner shows paused/suspended warnings
- ProtectedRoute supports allowedRoles prop
- RoleDashboardRouter renders SuperAdminDashboard or Dashboard based on role
- SQL: src/sql/auth_complete_setup.sql must be run after setup.sql
- Gym statuses: active, paused, suspended
- User statuses: active, paused, suspended

## RLS-First Frontend
- RLS is active on profiles and all data tables
- Frontend NEVER filters by role manually — trusts Supabase-returned data
- Queries that return empty due to RLS are valid (not errors)
- Errors from RLS-blocked queries → console.warn + return empty, never throw

## Database Work Rule
- NEVER execute DB changes directly
- ALWAYS provide: 1) exact SQL, 2) brief explanation, 3) verification query
- User executes all SQL manually in Supabase SQL Editor
- No user_roles table — profiles.role is the only source of truth

## Merged Features from elevate-gym-management (Phase 2)
- CreateCoachDialog / CreateClientDialog — auto gym_id assignment
- Diets page with meal management (requires diets + diet_meals tables)
- Exercise Catalog — static catalog with 30+ exercises, muscle filter, category filter
- Google Auth already existed in Login/Register
- Sidebar updated with Diets + Ejercicios links for all roles
- Routes: /diets, /exercises added
