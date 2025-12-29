# Novique.AI Session Notes

This file tracks session-by-session development progress for the Novique.AI project.

## 🔄 SESSION CONTINUITY GUIDE

**For Claude Code: How to Start Each Session Correctly**

1. **Read this file first** - Check the most recent session to see what was last worked on
2. **Check git log** - Run `git log --oneline -10` to see recent commits
3. **Check current branch** - Run `git branch --show-current` to see if on feature branch
4. **Review "Next Steps"** - Look at the "Next Steps" section of the most recent session
5. **Don't assume** - If unclear what state the code is in, read key files before suggesting work
6. **Ask user** - If there's ambiguity, ask the user where they want to pick up from

**Common Mistakes to Avoid:**
- ❌ Starting work that's already been completed
- ❌ Not checking if code has been modified since summary was written
- ❌ Assuming files are in an old state without verification
- ✅ Always verify current state before proposing changes

---

## Session: December 28, 2025

### Summary
Implemented CRM system with user management, customer tracking, and role-based access control. Fixed editor role permissions to allow read-only access to all customer and consultation data.

### Major Accomplishments

1. **User Management System** (`feature/crm-improvements`)
   - Created `/admin/users` page for admin-only user management
   - Added ability to create new users with roles: admin, editor, viewer
   - Built user listing with role badges and status indicators
   - Implemented API endpoints: `/api/admin/users` and `/api/admin/users/create`
   - Only admins can access user management

2. **Customer Management Enhancements** (`feature/crm-improvements`)
   - Added "Assigned to" dropdown field on customer detail pages
   - Allows assigning customers to admin users
   - Field populates with all admin users from profiles table
   - Updated customer detail page UI

3. **Dashboard Improvements** (`feature/crm-improvements`)
   - Fixed dashboard stats to use admin client (bypasses RLS)
   - Displays revenue, customer counts, and activity metrics
   - Works for both admin and editor roles

4. **Editor Role Access Fix** ⭐ (`feature/crm-improvements`)
   - **Problem**: Editor users could access admin panel but couldn't see any customer or consultation data
   - **Root Cause**: Pages were using client-side Supabase queries that respected RLS policies
   - **Solution**:
     - Created `requireAdminOrEditor()` function in `lib/auth/session.ts`
     - Updated all admin API routes to use `createAdminClient()` (bypasses RLS)
     - Updated admin layout to allow editors
     - Updated customer and consultation pages to fetch data from API endpoints instead of direct DB queries
     - Updated navigation to show all tabs for editors
   - **Result**: Editors now have full read-only access to all customer and consultation data

5. **User Management Scripts** (`feature/crm-improvements`)
   - Created utility scripts for database administration:
     - `scripts/reset-user-password.ts` - Reset user passwords
     - `scripts/update-user-email.ts` - Update user email addresses
     - `scripts/list-users.ts` - List all users and profiles
     - `scripts/delete-customer.ts` - Delete customers by name
   - All scripts use service role key for admin operations

6. **Database Cleanup**
   - Deleted 2 test customers (both named "test2")
   - Fixed duplicate avatar migration issue with SQL script

7. **User Account Management**
   - Corrected admin user email from `mark@how3l.net` to `mark@how3ll.net`
   - Reset password for admin user

### Technical Details

**Files Modified:**
- `lib/auth/session.ts` - Added `requireAdminOrEditor()` function
- `lib/auth/roles.ts` - Updated editor permissions documentation
- `app/(protected)/admin/layout.tsx` - Allow editors to access /admin routes
- `components/admin/AdminNav.tsx` - Show Consultations and Customers tabs for editors
- `components/auth/UserMenu.tsx` - Show Admin Dashboard option for editors
- `app/api/dashboard/stats/route.ts` - Use admin client, allow editors
- `app/api/consultations/route.ts` - Use admin client, allow editors
- `app/api/customers/route.ts` - Use admin client, allow editors
- `app/api/customers/[id]/route.ts` - Use admin client, allow editors
- `app/(protected)/admin/consultations/page.tsx` - Fetch from API instead of direct DB query
- `app/(protected)/admin/customers/page.tsx` - Fetch from API instead of direct DB query
- `app/(protected)/admin/customers/[id]/page.tsx` - Added "Assigned to" field
- `app/(protected)/admin/dashboard/page.tsx` - Dashboard improvements
- `hooks/useCustomerEditor.ts` - Added customer editor hook

**Files Created:**
- `app/(protected)/admin/users/page.tsx` - User management UI
- `app/api/admin/users/route.ts` - List users API
- `app/api/admin/users/create/route.ts` - Create user API
- `scripts/reset-user-password.ts` - Password reset utility
- `scripts/update-user-email.ts` - Email update utility
- `scripts/list-users.ts` - User listing utility
- `scripts/delete-customer.ts` - Customer deletion utility
- `lib/supabase/migrations/004_fix_duplicate_avatars.sql` - Avatar migration fix

### Role-Based Access Control

**Admin Role:**
- Full access to all features
- Can create/edit/delete users, customers, consultations
- Can access user management page
- Can modify all data

**Editor Role:**
- Read-only access to customers and consultations
- Full read/write access to blog posts
- Cannot access user management
- Cannot modify customer data

**Viewer Role:**
- Read-only access to blog posts
- No access to admin panel

### Current Users

1. **admin@novique.ai** - Novique Admin (admin role)
2. **mark@how3ll.net** - Mark Howell (admin role) - Password: J0hn$partan1434
3. **mhow3ll@gmail.com** - Mark gmail (editor role)

### Deployment Status

**Production Deployment:**
- Branch: `feature/crm-improvements` merged to `main` ✅
- Production URL: https://novique.ai
- All CRM features live
- Editor role access working correctly

**Current Branch:** `feature/crm-improvements` (local)
**Main Branch:** Up to date with all changes ✅

### Next Steps

**🚨 CRITICAL FOR NEXT SESSION:**

1. **Fix Duplicate People Images**
   - Issue: Same person images appearing in multiple sections across the website
   - Need to review and update images in different sections to show variety
   - Likely affected pages: home page sections, about page, etc.

**Future Enhancements:**
- Add email notifications for customer status changes
- Implement customer activity timeline
- Add file attachments to customer interactions
- Create customer reports and analytics
- Add bulk actions for customer management

### Notes

- All customer and consultation data now accessible via API endpoints for proper RLS handling
- Editor users can view all data but cannot modify customers or consultations
- User management system complete with role-based permissions
- Password reset and user management scripts available for admin use
- Production deployment successful with no downtime

---

## Session: December 24, 2025

### Summary
Completed MDX blog migration to database/WYSIWYG system and various blog improvements.

### Major Accomplishments

1. **VSCode Workspace Configuration**
   - Fixed workspace folders not showing in VSCode Explorer
   - Changed from relative to absolute paths in workspace files
   - Updated `/home/clay/IDE/.vscode/active-projects.code-workspace`
   - Updated `/home/clay/IDE/.vscode/business-focus.code-workspace`

2. **Documentation Updates**
   - Updated `CLAUDE.md` to reflect new IDE directory structure
   - Changed all paths from `/home/clay/Documents/GitHub/` to `/home/clay/IDE/business/`
   - Committed and merged to main

3. **Port Management System** (Critical Fix)
   - Discovered multiple stale dev servers running from old directory structure
   - Created comprehensive port management system:
     - `scripts/check-port.sh` - Port conflict detection and resolution
     - `scripts/dev-with-port-check.sh` - Safe dev server wrapper
     - `/home/clay/IDE/scripts/port-manager.sh` - Global port manager
     - `/home/clay/IDE/PORT_MANAGEMENT.md` - Complete documentation
   - Added `npm run dev:safe` command
   - Ensures dev servers always use correct ports from registry

4. **Blog Image Display Fixes** (`feature/blog-images-contacts-https`)
   - Fixed header image cropping on individual blog post pages
   - Changed from `object-cover` to `object-contain object-center` in `app/blog/[slug]/page.tsx`
   - Fixed blog card images on listing page
   - Changed from `object-cover` to `object-contain` with `bg-gray-50` background in `app/blog/page.tsx`
   - Tested locally and in preview deployment
   - Merged to production ✅

5. **Contact Page Updates** (`feature/blog-images-contacts-https`)
   - Changed email from `hello@novique.ai` to `sales@novique.ai`
   - Removed phone number section
   - Removed social media links section
   - Merged to production ✅

6. **Blog Post Sorting Fix** (`feature/blog-images-contacts-https`)
   - Implemented two-tier sorting: featured posts first (by date), then non-featured (by date)
   - Updated `lib/blog.ts` `getAllPosts()` function
   - Tested in preview deployment
   - Merged to production ✅

7. **MDX Blog Migration** (`feature/migrate-mdx-to-database`) ⭐
   - Created batch migration script: `scripts/migrate-all-mdx.ts`
   - Successfully migrated all 5 MDX blog posts to Supabase database:
     1. accelerating-symphony-ai-autonomous-vehicles-robotics
     2. how-ai-improving-soc-operations
     3. how-ai-revolutionize-business-processes
     4. introducing-novique
     5. localized-ai-docker-n8n
   - Removed all .mdx files from `content/blog/` directory
   - Added `npm run migrate:mdx` command for future use
   - Tested locally and in preview deployment
   - Merged to production ✅

### Technical Details

**Files Modified:**
- `/home/clay/IDE/.vscode/active-projects.code-workspace` - Absolute paths
- `/home/clay/IDE/.vscode/business-focus.code-workspace` - Absolute paths
- `CLAUDE.md` - Updated directory references
- `app/blog/[slug]/page.tsx` - Image display fix (object-contain)
- `app/blog/page.tsx` - Card image fix (object-contain + bg-gray-50)
- `app/contact/page.tsx` - Email change, removed phone/social
- `lib/blog.ts` - Featured-first sorting
- `package.json` - Added `dev:safe` and `migrate:mdx` scripts

**Files Created:**
- `scripts/check-port.sh` - Port management script
- `scripts/dev-with-port-check.sh` - Dev server wrapper
- `/home/clay/IDE/scripts/port-manager.sh` - Global port manager
- `/home/clay/IDE/PORT_MANAGEMENT.md` - Port system documentation
- `scripts/migrate-all-mdx.ts` - MDX batch migration script

**Files Deleted:**
- `content/blog/accelerating-symphony-ai-autonomous-vehicles-robotics.mdx`
- `content/blog/how-ai-improving-soc-operations.mdx`
- `content/blog/how-ai-revolutionize-business-processes.mdx`
- `content/blog/introducing-novique.mdx`
- `content/blog/localized-ai-docker-n8n.mdx`

### Deployment Status

**Production Deployments:**
1. `feature/blog-images-contacts-https` - Merged ✅
   - Blog image fixes
   - Contact page updates
   - Blog sorting fix

2. `feature/migrate-mdx-to-database` - Merged ✅
   - All MDX posts migrated to database
   - WYSIWYG system now active for all blog content
   - Legacy .mdx files removed

**Current Branch:** `main`

### Vercel Environment
- Production: https://novique.ai ✅
- All environment variables configured at project level
- HTTPS working correctly via Vercel

### Next Steps

**Potential Future Enhancements:**
- Add social media links back to contact page (when ready)
- Add phone number back to contact page (when ready)
- Consider creating more blog posts using the WYSIWYG editor
- Test AI blog generator functionality
- Implement comment system for blog posts (potential feature)

### Notes

- All blog content is now in the database and editable via WYSIWYG editor at `/admin/blog`
- The hybrid blog system (database + MDX fallback) is still in place via `lib/blog.ts`
- Port management system prevents conflicts across all IDE projects
- Feature branch workflow successfully prevented any production downtime

---

**Session Duration:** Full session
**Context Usage:** Started at 66% before compact, ended at ~21% after compact
**Status:** Complete - All features deployed to production ✅
