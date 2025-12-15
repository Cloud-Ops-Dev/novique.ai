# Resend Email Integration Setup

This guide explains how to set up the consultation form email notifications using Resend.

## What Changed

- ✅ Added Resend package for email delivery
- ✅ Created API route `/api/consultation` to handle form submissions
- ✅ Updated ConsultationForm to send data to API
- ✅ Added environment variables for configuration

## Quick Setup (5 minutes)

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (it's free!)
2. Verify your email
3. Go to **API Keys** in the dashboard
4. Click **Create API Key**
5. Give it a name like "Novique Consultation Form"
6. Copy the API key (starts with `re_...`)

### Step 2: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace `your_key_here` with your actual Resend API key
3. Replace `your-email@example.com` with your email address

```env
RESEND_API_KEY=re_abc123xyz...
CONSULTATION_EMAIL=mark@novique.ai
```

### Step 3: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000/consultation and submit the form. You should receive an email!

### Step 4: Deploy to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add two variables:
   - `RESEND_API_KEY` = your Resend API key
   - `CONSULTATION_EMAIL` = your email address
4. Redeploy your site

Done! Your consultation form now sends real emails.

## Email Details

**From:** Novique.ai Consultation <onboarding@resend.dev>
**To:** Your configured email address
**Subject:** New Consultation Booking - [Customer Name]

The email includes:
- Customer contact information
- Business details
- Preferred meeting date/time
- Meeting type preference (virtual/in-person)
- Challenges they're facing

## Using Your Own Domain (Optional)

Right now emails come from `onboarding@resend.dev`. To use your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `novique.ai`
4. Add the DNS records shown (in Namecheap)
5. Wait for verification (~10 minutes)
6. Update the API route to use `consultations@novique.ai` instead

## Pricing

Resend free tier includes:
- **100 emails per day**
- **3,000 emails per month**

This is more than enough for a new business!

## Troubleshooting

### Email not arriving?

1. Check spam folder
2. Verify API key is correct in `.env.local`
3. Check browser console for errors
4. Ensure environment variables are set in Vercel

### Form shows error?

1. Check if `npm run dev` is running
2. Open browser DevTools → Console for error messages
3. Verify `.env.local` file exists and has correct values

## Updating Your Email Address

Just change `CONSULTATION_EMAIL` in:
- `.env.local` (for local testing)
- Vercel environment variables (for production)

No code changes needed!

## Repository Structure

```
app/
  api/
    consultation/
      route.ts          # Email sending logic
components/
  ConsultationForm.tsx  # Updated form with API integration
.env.local              # Your local config (not committed to git)
.env.example            # Template for required variables
```
