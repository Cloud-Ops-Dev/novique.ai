# Development Workflow Guide

This guide ensures **zero production downtime** by using feature branches and Vercel preview deployments.

---

## The Golden Rule

**NEVER commit directly to `main` branch!**

Always work on feature branches, test in preview environments, then merge to production.

---

## Branching Strategy

### Branch Types

| Branch | Purpose | Auto-deploys to |
|--------|---------|-----------------|
| `main` | Production code only | `novique.ai` (Production) |
| `feature/*` | New features | Preview URL (automatic) |
| `fix/*` | Bug fixes | Preview URL (automatic) |
| `hotfix/*` | Urgent production fixes | Preview URL (automatic) |

---

## Standard Workflow

### 1. Starting a New Feature

```bash
# Make sure you're on main and it's up to date
cd /home/clay/Documents/GitHub/novique.ai
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name

# Examples:
# git checkout -b feature/ai-blog-generator
# git checkout -b feature/user-comments
# git checkout -b fix/login-redirect-issue
```

### 2. Develop and Test Locally

```bash
# Make your changes
# Test locally
npm run dev

# Commit your changes frequently
git add .
git commit -m "Add feature X"

# Push to GitHub (creates preview deployment)
git push origin feature/your-feature-name
```

**Vercel automatically creates a preview URL:**
- `https://novique-ai-git-feature-your-feature-name-mark-howells-projects.vercel.app`
- Check Vercel dashboard or GitHub PR for the exact URL

### 3. Test in Preview Environment

- Visit your preview URL
- Test all functionality
- Verify environment variables are working
- Check for any errors in Vercel logs
- **Preview is identical to production** (except URL)

### 4. Merge to Production (Only When Ready!)

```bash
# Switch back to main
git checkout main

# Merge your tested feature
git merge feature/your-feature-name

# Push to production
git push origin main

# Delete the feature branch (cleanup)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

**Production deploys automatically** when you push to `main`.

---

## Using Pull Requests (Recommended)

For better tracking and code review:

### 1. Push Feature Branch
```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request on GitHub
- Go to: https://github.com/Cloud-Ops-Dev/novique.ai
- Click "Compare & pull request"
- Add description of changes
- **Preview URL appears automatically in PR comments**

### 3. Test Preview
- Click the Vercel preview link in the PR
- Test thoroughly

### 4. Merge PR
- Click "Merge pull request" on GitHub
- Production deploys automatically

---

## Environment Variables in Preview

Vercel automatically uses the correct environment variables:

- **Preview branches** use variables marked with ☑️ Preview
- **Production (`main`)** uses variables marked with ☑️ Production

### Adding Preview-Specific Variables

Sometimes you want different values in preview (like a test Stripe key):

1. Go to: Vercel → Project Settings → Environment Variables
2. Add variable with **Preview** checked (Production unchecked)
3. Preview deployments use test values
4. Production uses real values

---

## Quick Commands Reference

### Create New Feature
```bash
git checkout main
git pull
git checkout -b feature/feature-name
```

### Save Your Work
```bash
git add .
git commit -m "Description of changes"
git push origin feature/feature-name
```

### Merge to Production (after testing in preview)
```bash
git checkout main
git merge feature/feature-name
git push origin main
```

### Emergency Hotfix
```bash
# If production is broken and you need to fix it NOW
git checkout main
git pull
git checkout -b hotfix/critical-bug-fix

# Make the fix
# Test locally
git add .
git commit -m "Fix critical bug"
git push origin hotfix/critical-bug-fix

# Test in preview, then merge
git checkout main
git merge hotfix/critical-bug-fix
git push origin main
```

---

## Vercel Dashboard

**Preview Deployments:**
- https://vercel.com/mark-howells-projects/novique-ai/deployments
- Every branch push creates a new deployment
- Each deployment has its own URL and logs

**Production Deployments:**
- Only deployments from `main` branch
- These go to `novique.ai`

---

## Best Practices

### ✅ DO
- Always work on feature branches
- Test in preview before merging to main
- Use descriptive branch names: `feature/add-user-comments`
- Commit frequently with clear messages
- Delete branches after merging

### ❌ DON'T
- Never push directly to `main` (except emergencies)
- Don't skip testing in preview
- Don't merge broken code to main
- Don't leave stale branches around

---

## Example: Adding a New Feature

Let's say you want to add a "User Comments" feature:

```bash
# Step 1: Create feature branch
git checkout main
git pull
git checkout -b feature/user-comments

# Step 2: Build the feature
# ... make your code changes ...
npm run dev  # test locally

# Step 3: Push to preview
git add .
git commit -m "Add user comments system"
git push origin feature/user-comments

# Step 4: Get preview URL
# Check Vercel dashboard or run:
# Vercel shows: https://novique-ai-git-feature-user-comments.vercel.app

# Step 5: Test preview thoroughly
# - Create comments
# - Edit comments
# - Delete comments
# - Test authentication
# - Check mobile view

# Step 6: Merge to production (only if preview works!)
git checkout main
git merge feature/user-comments
git push origin main

# Step 7: Cleanup
git branch -d feature/user-comments
git push origin --delete feature/user-comments
```

**Production was never at risk!** All testing happened in preview.

---

## Rollback if Something Goes Wrong

If you merge to production and something breaks:

```bash
# Option 1: Revert the last commit
git revert HEAD
git push origin main

# Option 2: Redeploy a previous working deployment
# Go to Vercel → Deployments
# Find the last working deployment
# Click "..." → "Redeploy"
```

---

## Summary

**Your new workflow:**
1. Create feature branch
2. Develop locally
3. Push to feature branch (auto-creates preview)
4. Test preview thoroughly
5. Merge to main only when preview works
6. Production deploys automatically

**Benefits:**
- ✅ Zero production downtime
- ✅ Safe testing environment
- ✅ Easy rollback if needed
- ✅ Production always stable
- ✅ Professional development process

---

**Need help?** Reference this guide anytime you start a new feature!
