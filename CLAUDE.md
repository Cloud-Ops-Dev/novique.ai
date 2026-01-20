# Claude Code Instructions for Novique.AI Project

This file contains permanent instructions for Claude Code when working on this project.

---

## ⚠️ CRITICAL: Development Workflow

**NEVER push directly to the `main` branch!**

### Standard Development Process

All feature development, bug fixes, and changes MUST follow this workflow:

1. **Create a feature branch**
2. **Develop and test locally**
3. **Push to feature branch** (creates Vercel preview deployment)
4. **Test preview deployment thoroughly**
5. **Merge to main ONLY after preview is verified**

### Why This Matters

- The production site (`novique.ai`) deploys automatically from the `main` branch
- Pushing broken code to `main` causes production downtime
- Preview deployments allow safe testing before production
- This prevents customer-facing outages

---

## 🚀 Preferred Workflow Commands

### Using the Helper Script (Recommended)

```bash
cd /home/clay/IDE/business/novique.ai

# Start new feature
./scripts/git-workflow.sh new-feature <feature-name>

# Save work
./scripts/git-workflow.sh save "Commit message"

# Push to GitHub (creates preview)
./scripts/git-workflow.sh push

# After testing preview, merge to production
./scripts/git-workflow.sh merge
```

### Manual Git Commands (Alternative)

```bash
# Start feature
git checkout main && git pull
git checkout -b feature/<name>

# Make changes, then commit
git add .
git commit -m "Description"

# Push to create preview
git push origin feature/<name>

# Test preview URL from Vercel

# Merge to production (only after testing!)
git checkout main
git merge feature/<name>
git push origin main
```

---

## 📦 Vercel Preview Deployments

### How They Work

- **Every branch push** → Automatic preview deployment
- **Preview URL pattern:** `https://novique-ai-git-{branch-name}-mark-howells-projects.vercel.app`
- **Production URL:** `https://novique.ai` (only from `main` branch)

### Environment Variables

All environment variables are configured at the **project level** in Vercel:
- Location: https://vercel.com/mark-howells-projects/novique-ai/settings/environment-variables
- Preview deployments use variables marked with ☑️ Preview
- Production uses variables marked with ☑️ Production

**IMPORTANT:** Never add environment variables at the team/account level - they won't work!

---

## 🛡️ Branch Protection

The `main` branch may have protection rules enabled:
- Requires pull requests for merging
- Prevents accidental direct pushes
- Ensures preview builds succeed before merge

If you encounter "protected branch" errors, this is intentional - use the feature branch workflow.

---

## 📂 Project Structure

**Location:** `/home/clay/IDE/business/novique.ai/`

This is the git repository that gets pushed to GitHub and deployed to Vercel.

```
/home/clay/IDE/business/novique.ai/
├── .planning/              # Planning files (git-ignored, local only)
│   ├── plans/             # Claude Code session plans (EnterPlanMode)
│   ├── design/            # Design documents
│   ├── status/            # Session status files
│   └── notes/             # Planning notes and ideas
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility libraries
│   └── supabase/          # Supabase client configurations
├── scripts/               # Helper scripts
│   └── git-workflow.sh    # Git workflow automation
├── .github/workflows/     # GitHub Actions
├── DEVELOPMENT_WORKFLOW.md # Detailed workflow guide
├── GITHUB_SETUP.md        # Branch protection setup
├── CLAUDE.md              # This file
└── BLOG_UPDATE_WORKFLOW.md
```

**What gets committed to GitHub:**
- ✅ Source code (app, components, lib, etc.)
- ✅ Public documentation (README, workflow guides)
- ✅ Scripts and automation
- ✅ Configuration files

**What stays local (in `.planning/`, git-ignored):**
- ✅ Claude Code session plans (from EnterPlanMode tool)
- ✅ Design documents and mockups
- ✅ Planning files and brainstorming
- ✅ **Session notes** (`.planning/status/SESSION_NOTES.md`)
- ✅ Session status files (for resuming work)
- ✅ Private notes and ideas
- ❌ NEVER commit to GitHub

### Working Directory

**All work happens in:**
```bash
cd /home/clay/IDE/business/novique.ai
```

**Planning files are saved to:**
- `.planning/` directory within the project (automatically git-ignored)

---

## 🔐 Environment Variables

### Local Development (.env.local)
All environment variables are stored in `.env.local` for local development.

### Production (Vercel)
Must be configured at: https://vercel.com/mark-howells-projects/novique-ai/settings/environment-variables

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `BRAVE_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `CONSULTATION_EMAIL`

---

## 🎯 When Working on Features

### Before Starting ANY Work

1. **Always check current branch:**
   ```bash
   git branch --show-current
   ```

2. **If on `main`, create a feature branch:**
   ```bash
   ./scripts/git-workflow.sh new-feature <name>
   ```

3. **Never commit directly to `main`** unless it's an emergency hotfix

### Testing Requirements

Before merging to `main`:
- ✅ Test locally with `npm run dev`
- ✅ Test in Vercel preview deployment
- ✅ Verify authentication works
- ✅ Check browser console for errors
- ✅ Test on mobile (responsive design)
- ✅ Verify environment variables are working

### Committing Code

When creating commits for the user:
- Follow existing commit message conventions
- Include the Claude Code signature:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  ```

---

## 🚨 Emergency Hotfix Process

If production is broken and needs immediate fix:

```bash
# Create hotfix branch
git checkout main
git pull
git checkout -b hotfix/<issue-name>

# Make the fix
# Test locally
git add .
git commit -m "Emergency fix for <issue>"

# Push to create preview
git push origin hotfix/<issue-name>

# Test preview quickly
# If working, merge immediately
git checkout main
git merge hotfix/<issue-name>
git push origin main
```

---

## 📚 Documentation Files

- **DEVELOPMENT_WORKFLOW.md** - Complete workflow guide for user
- **GITHUB_SETUP.md** - Instructions for branch protection setup
- **BLOG_UPDATE_WORKFLOW.md** - Blog-specific workflows
- **DEPLOYMENT.md** - Deployment procedures
- **`.planning/status/SESSION_NOTES.md`** - Session-by-session development notes (local only, git-ignored)

---

## 🔄 Session Continuity

### Session Notes Location
**IMPORTANT:** Session notes are stored in `.planning/status/SESSION_NOTES.md` (git-ignored, local only).

This prevents documentation updates from triggering unnecessary Vercel production builds.

At the start of each session:
1. Read `.planning/status/SESSION_NOTES.md` for recent session history
2. Check the "Next Steps" section of the most recent session
3. Run `git log --oneline -10` to see recent commits

Update the session notes at the end of each major session with:
- What was accomplished
- Current status
- Next steps
- Any blockers or issues

### Todo Lists
Use the TodoWrite tool to track multi-step tasks:
- Break complex tasks into smaller steps
- Mark steps as completed as you go
- Keep user informed of progress

---

## ⚡️ Common Tasks Reference

### Start Development Server
```bash
cd /home/clay/IDE/business/novique.ai
npm run dev
```

### Run Production Build (Test Before Deploy)
```bash
npm run build
npm start
```

### Check Git Status
```bash
./scripts/git-workflow.sh status
```

### View Vercel Deployments
https://vercel.com/mark-howells-projects/novique-ai/deployments

### Access Supabase Dashboard
https://supabase.com/dashboard/project/weubuiuqgwaviwfqljwh

---

## 🎨 Code Standards

### File Creation
- ALWAYS prefer editing existing files over creating new ones
- Only create new files when explicitly required
- Use existing patterns and conventions
- Don't create documentation files unless requested

### TypeScript
- Maintain strict type checking
- Use existing type patterns
- Fix type errors before committing

### React Components
- Follow existing component structure
- Use TypeScript for all components
- Maintain consistent styling approach

---

## 🔒 Security Notes

### Supabase
- RLS policies are enforced
- Use `createClient()` for most operations (respects RLS)
- Only use `createAdminClient()` when absolutely necessary (bypasses RLS)

### Authentication
- Admin user: admin@novique.ai
- Public signups are disabled
- Only existing users can log in

### API Keys
- Never commit API keys to git
- All secrets in `.env.local` (gitignored)
- Vercel environment variables for production

---

## ✅ Deployment Checklist

Before merging to `main`:

1. [ ] Feature branch created
2. [ ] Code tested locally
3. [ ] Changes committed to feature branch
4. [ ] Pushed to GitHub
5. [ ] Preview deployment created
6. [ ] Preview deployment tested thoroughly
7. [ ] No errors in Vercel logs
8. [ ] Authentication working (if applicable)
9. [ ] Mobile responsive (if UI changes)
10. [ ] Ready to merge to main

---

## 💡 Tips for Claude Code

- **Always use the git workflow script** when possible
- **Read DEVELOPMENT_WORKFLOW.md** if unsure about process
- **Check current branch** before making commits
- **Create feature branches** for all work
- **Test previews** before merging to main
- **Update `.planning/status/SESSION_NOTES.md`** after major work
- **Use TodoWrite** for multi-step tasks
- **Never skip preview testing** - production downtime is unacceptable

---

## 📞 Getting Help

- Git workflow questions → See DEVELOPMENT_WORKFLOW.md
- GitHub setup → See GITHUB_SETUP.md
- Session history → See `.planning/status/SESSION_NOTES.md`
- Blog workflows → See BLOG_UPDATE_WORKFLOW.md

---

## 📱 Twilio / Communications Notes

### Toll-Free Verification Status
**SMS messaging is NOT functional** until toll-free verification is complete.
- Status: Verification in progress (as of January 2025)
- Impact: Cannot receive inbound SMS messages
- Voicemail webhook working ✅

### Current Communications Implementation
- **Voicemails**: Working via real-time Twilio Studio Flow webhook to `/api/twilio/recording-complete`
  - Important: Use `www.novique.ai` URL (non-www 307 redirects break POST requests)
- **SMS Inbound**: Blocked until toll-free verification completes
- **SMS Outbound** (admin notifications): May also be affected by verification

Once toll-free verification is approved, update this note and test SMS functionality.

### Future Work: Communications Hub Enhancements
The admin Communications page (`/admin/communications`) will be expanded to include:

1. **SMS Integration** (pending Twilio toll-free verification)
   - Inbound SMS display in unified inbox
   - SMS reply functionality from admin panel

2. **Email Integration** (larger project)
   - May require migrating current email hosting (Protonmail has no API)
   - Inbox notifications for business email
   - Consider: Resend, SendGrid, or hosted email solution with API access

---

**Last Updated:** January 19, 2026

**This file should be read at the start of each Claude Code session.**
