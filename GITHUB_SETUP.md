# GitHub Repository Setup

Additional configuration to protect your production branch and enable better workflows.

---

## 1. Branch Protection Rules (Recommended)

Protect your `main` branch from accidental pushes.

### Steps:

1. Go to: https://github.com/Cloud-Ops-Dev/novique.ai/settings/branches

2. Click **"Add branch protection rule"**

3. Branch name pattern: `main`

4. Enable these settings:
   - ☑️ **Require a pull request before merging**
     - ☐ Require approvals (optional, useful if you have a team)
   - ☑️ **Require status checks to pass before merging**
     - Search and select: `Vercel` (if available)
   - ☑️ **Do not allow bypassing the above settings**
     - ☐ Uncheck "Allow administrators to bypass" (optional, but safer)

5. Click **"Create"**

### What This Does:

- ✅ Prevents accidental `git push origin main`
- ✅ Forces you to use pull requests
- ✅ Ensures Vercel preview builds successfully before merging
- ✅ Protects production from broken code

### Bypassing in Emergencies:

If branch protection is enabled and you need to push directly to main (emergency):

```bash
# You'll need to either:
# 1. Temporarily disable branch protection in GitHub settings, OR
# 2. Create a PR even for hotfixes (recommended)

# Emergency hotfix via PR:
git checkout -b hotfix/critical-fix
git add .
git commit -m "Emergency fix for X"
git push origin hotfix/critical-fix
# Create PR on GitHub, test preview, merge immediately
```

---

## 2. Vercel GitHub Integration (Already Set Up)

Your Vercel integration is already configured, but here's what it does:

### Automatic Deployments:

- **Every branch push** → Preview deployment
- **Push to `main`** → Production deployment
- **Pull request created** → Vercel comments with preview URL

### Preview URLs:

Pattern: `https://novique-ai-git-{branch-name}-mark-howells-projects.vercel.app`

Examples:
- `feature/user-comments` → `https://novique-ai-git-feature-user-comments-mark-howells-projects.vercel.app`
- `fix/login-bug` → `https://novique-ai-git-fix-login-bug-mark-howells-projects.vercel.app`

---

## 3. GitHub Actions (Optional)

The `.github/workflows/preview-comment.yml` file automatically:
- Comments on PRs with a testing checklist
- Reminds you to test before merging

This is already set up and will run automatically on your next PR.

---

## 4. Repository Settings Checklist

Verify these are configured:

### General Settings
- ✅ Default branch: `main`
- ✅ Allow merge commits: Enabled
- ✅ Allow squash merging: Enabled (optional)

### Branches
- ✅ Branch protection rule for `main`: Configured (see above)

### Collaborators
- Add team members if needed

---

## Quick Reference

### Creating a Pull Request

1. Push your feature branch:
   ```bash
   git push origin feature/your-feature
   ```

2. Go to: https://github.com/Cloud-Ops-Dev/novique.ai

3. Click **"Compare & pull request"** (GitHub shows this automatically)

4. Add description:
   ```
   ## What Changed
   - Added user comments feature
   - Updated database schema

   ## Testing
   - [x] Tested locally
   - [x] Tested preview deployment
   - [x] No console errors

   ## Preview URL
   Vercel will comment with the URL below
   ```

5. Click **"Create pull request"**

6. Wait for Vercel preview (1-2 minutes)

7. Test the preview URL

8. Click **"Merge pull request"**

9. Click **"Delete branch"** (cleanup)

---

## Benefits of This Setup

### Before (No Protection):
- ❌ Accidentally push broken code to production
- ❌ Production goes down
- ❌ No testing environment
- ❌ Difficult to rollback

### After (With Protection):
- ✅ Can't push directly to production
- ✅ Must test in preview first
- ✅ Pull requests track changes
- ✅ Easy rollback (redeploy previous PR)
- ✅ Professional workflow

---

## Team Workflow (If You Add Collaborators)

If you add other developers:

1. **They must work on feature branches**
2. **Create PR when ready**
3. **You review the PR**
4. **Test the preview URL**
5. **Merge if approved**

This ensures you control what goes to production.

---

## Summary

**Set up branch protection** (5 minutes):
- Go to GitHub repo → Settings → Branches
- Add protection rule for `main`
- Require pull requests

**Result:**
- Zero accidental production deployments
- Safe testing in preview
- Production always stable
- Professional development process

---

**Next Steps:**
1. Set up branch protection (see above)
2. Try creating your first feature branch
3. Use the workflow helper script: `./scripts/git-workflow.sh`
