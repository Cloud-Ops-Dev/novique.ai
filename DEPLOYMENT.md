# Novique.ai Deployment Guide

This guide will help you deploy the Novique.ai website to Vercel.

## Prerequisites

Before deploying, ensure you have:
- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git installed on your computer
- The project has been pushed to a GitHub repository

## Step 1: Push to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Navigate to your project directory
cd /home/clay/Documents/GitHub/novique.ai

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Novique.ai website"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/novique.ai.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel (Web Dashboard)

### Method 1: Import from GitHub (Recommended)

1. **Visit Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Log In" (use GitHub for easier integration)

2. **Create New Project**
   - Click "Add New..." → "Project"
   - You'll see a list of your GitHub repositories

3. **Import Repository**
   - Find and select `novique.ai` repository
   - Click "Import"

4. **Configure Project**
   - Vercel will auto-detect Next.js
   - Project Name: `novique-ai` (or your preference)
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
   - Install Command: `npm install` (auto-filled)

5. **Environment Variables** (Optional for now)
   - Click "Environment Variables" if you need to add any
   - Example: Email service API keys (when you set them up)
   - Skip this for now if you don't have any

6. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for deployment to complete
   - You'll see a success screen with your live URL!

7. **Visit Your Site**
   - Click the generated URL (e.g., `novique-ai.vercel.app`)
   - Your site is now live!

### Method 2: Vercel CLI

Alternatively, use the Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd /home/clay/Documents/GitHub/novique.ai

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Step 3: Configure Custom Domain (Optional)

Once you have a custom domain (e.g., novique.ai from Namecheap):

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"
   - Click "Add"
   - Enter your domain: `novique.ai`
   - Click "Add"

2. **Configure DNS (in Namecheap)**
   - Vercel will show you DNS records to add
   - Log in to your Namecheap account
   - Go to Domain List → Manage → Advanced DNS
   - Add the records Vercel provides:
     - Type: `A Record`, Host: `@`, Value: Vercel's IP
     - Type: `CNAME`, Host: `www`, Value: `cname.vercel-dns.com`

3. **Wait for DNS Propagation**
   - This can take 5 minutes to 48 hours
   - Usually completes within 1-2 hours

4. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Your site will be accessible via `https://`

## Step 4: Automatic Deployments

With GitHub integration:
- Every push to `main` branch → automatic production deployment
- Pull requests → automatic preview deployments
- Rollback to any previous deployment with one click

## Step 5: Post-Deployment Checklist

- [ ] Test all pages on the live site
- [ ] Verify forms work (though they need email integration)
- [ ] Check mobile responsiveness
- [ ] Test navigation and all links
- [ ] Verify images load correctly
- [ ] Check browser console for errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)

## Environment Variables (When Ready)

When you set up email integration (EmailJS or custom API):

1. **Local Development** (`.env.local`):
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

2. **Vercel** (Project Settings → Environment Variables):
   - Add the same variables
   - They'll be available in your deployed application

## Monitoring & Analytics

Consider adding:

1. **Vercel Analytics** (Built-in)
   - Enable in Project Settings → Analytics
   - Free tier available

2. **Google Analytics** (Optional)
   - Add tracking code to `app/layout.tsx`
   - Use `next/script` for proper loading

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Run `npm run build` locally to test
4. Check for TypeScript/ESLint errors

### Images Not Loading

1. Verify image URLs are accessible
2. Check `next.config.ts` for image domain configuration
3. Unsplash images should work by default

### Forms Not Working

- Forms are set up but need email integration
- See README.md for EmailJS setup instructions
- Or create API routes for custom backend

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Project Issues**: Check GitHub Issues or contact the development team

---

## Quick Reference

**Live Site URL** (after deployment):
- Preview: `novique-ai.vercel.app`
- Production: `novique.ai` (after custom domain setup)

**Deployment Commands**:
```bash
vercel          # Deploy preview
vercel --prod   # Deploy production
```

**View Deployments**:
```bash
vercel ls       # List deployments
vercel inspect  # Inspect latest deployment
```

---

**Congratulations! Your Novique.ai website is now live! 🎉**
