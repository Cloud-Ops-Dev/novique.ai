# 🚀 Discord Webhook Integration for Real-Time Notifications

## Overview

This integration sends instant Discord notifications when customers interact with your Novique.ai platform. No local servers, no tunneling, no complexity - just dead simple Discord webhooks that are 100% reliable.

## 🎯 Benefits

### Before (Scheduled Polling)
- ❌ **30-minute delays** for customer notifications
- ❌ **Constant API calls** even when nothing happens
- ❌ **Missed opportunities** during polling downtime
- ❌ **Complex infrastructure** (local servers, tunneling)

### After (Discord Webhooks)
- ✅ **Instant notifications** (within seconds)
- ✅ **Zero infrastructure** - Discord handles everything
- ✅ **100% reliable** - Discord's uptime, not yours
- ✅ **Rich formatting** - Beautiful embeds with colors and fields
- ✅ **Dead simple** - Just POST to a URL

## 📋 Integration Points

### 1. Consultation Requests (`/api/consultation`)
- **Trigger**: Customer submits consultation booking form
- **Data**: Name, email, company, phone, business details, meeting preferences
- **Notification**: Rich Discord embed with contact info and business details

### 2. ROI Assessments (`/api/roi/submit`)
- **Trigger**: Customer completes ROI calculator
- **Data**: Email, calculated ROI score, industry, financial projections
- **Notification**: Colored embed with score badge and financial metrics

### 3. SMS Messages (`/api/twilio/sms`)
- **Trigger**: Customer sends SMS to your Twilio number
- **Data**: Phone number, message content
- **Notification**: Green embed with message preview

### 4. Voicemails (`/api/twilio/recording-complete`)
- **Trigger**: Customer leaves voicemail on your Twilio number
- **Data**: Phone number, duration, recording URL
- **Notification**: Purple embed with caller info and duration

## ⚙️ Setup Instructions

### Step 1: Create Discord Webhook

1. **Go to your Discord server** (or create a private one for notifications)
2. **Create a private channel** (e.g., `#novique-alerts`)
3. **Right-click the channel** → Settings → Integrations
4. **Click "Create Webhook"**
5. **Set a name** (e.g., "Novique Notifications")
6. **Copy the Webhook URL** - this is what you'll need!

### Step 2: Set Environment Variable

Add to your Vercel environment variables:
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

⚠️ **Security**: Treat this URL like a password! Don't put it in client-side code or public repositories.

### Step 3: Deploy & Test

1. **Deploy your changes**
2. **Test using**: `/api/test/webhook`
3. **Submit real forms** to verify integration

## 🎨 Notification Examples

### Consultation Request
```
🚨 **New consultation request from John Smith**

🤝 New Consultation Request
👤 Contact: John Smith
📧 john@company.com
📞 +1-555-1234

🏢 Business
Type: Technology
Size: 10-50 employees

📅 Meeting Preference: video

💼 Challenges: Looking to automate customer support...

ID: abc123... • novique.ai
```

### ROI Assessment 🔥
```
🚨 **New ROI assessment from jane@company.com** 🔥

📊 New ROI Assessment 🔥
👤 Contact: Jane
📧 jane@company.com
🏢 Company: Technology

📈 ROI Score: 92/100 🚀

💰 Projections
ROI: 350%
Net Benefit: $8,500/mo
Payback: 3.2 months

ID: def456... • novique.ai
```

### SMS Message
```
🚨 **New SMS from +1-555-1234**

💬 New SMS Message
📱 From: +1-555-1234
💬 Message: "Hi, I'm interested in your AI automation services..."

ID: ghi789... • novique.ai
```

### Voicemail
```
🚨 **New voicemail from +1-555-1234**

📞 New Voicemail  
📱 From: +1-555-1234
⏱️ Duration: 45 seconds

ID: jkl012... • novique.ai
```

## 🧪 Testing

### Quick Test (GET Request)
Visit: `/api/test/webhook`

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Discord webhook test successful! Check your Discord channel for test notification."
}
```

### Specific Notification Tests (POST)

**Test Consultation:**
```bash
curl -X POST https://your-site.vercel.app/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "consultation",
    "name": "Test Customer",
    "email": "test@example.com",
    "company": "Test Company"
  }'
```

**Test ROI Assessment:**
```bash
curl -X POST https://your-site.vercel.app/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "roi",
    "email": "test@example.com",
    "score": 95,
    "roi": 300
  }'
```

**Test SMS:**
```bash
curl -X POST https://your-site.vercel.app/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sms",
    "from": "+1-555-TEST",
    "body": "Testing Discord webhook integration"
  }'
```

**Test Voicemail:**
```bash
curl -X POST https://your-site.vercel.app/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "voicemail",
    "from": "+1-555-TEST",
    "duration": 30
  }'
```

## 📊 ROI Score Calculation

Notifications automatically calculate a quality score (0-100) for ROI assessments:

- **ROI Percentage (40% weight)**
  - 300%+ = 40 points 🚀
  - 200-299% = 30 points 🔥
  - 100-199% = 20 points ⭐
  - 50-99% = 10 points 👍

- **Payback Period (30% weight)**
  - ≤3 months = 30 points
  - 4-6 months = 25 points
  - 7-12 months = 20 points
  - 13-24 months = 10 points

- **Net Monthly Benefit (30% weight)**
  - $10,000+ = 30 points
  - $5,000-$9,999 = 25 points
  - $2,500-$4,999 = 20 points
  - $1,000-$2,499 = 15 points
  - $500-$999 = 10 points

**High-value leads (80+ score) get fire emojis and can be prioritized for immediate follow-up.**

## 🔧 Technical Implementation

### Files Added/Modified

**New Files:**
- `lib/services/discord-webhook-notifications.ts` - Core Discord webhook service
- `DISCORD_WEBHOOK_INTEGRATION.md` - This documentation

**Modified Files:**
- `app/api/consultation/route.ts` - Added Discord notification
- `app/api/roi/submit/route.ts` - Added Discord notification with scoring
- `app/api/twilio/sms/route.ts` - Added Discord notification
- `app/api/twilio/recording-complete/route.ts` - Added Discord notification
- `app/api/test/webhook/route.ts` - Updated for Discord testing
- `.env.example` - Added Discord webhook configuration

### Error Handling
- **Graceful failures**: Form submissions work even if Discord is down
- **Timeout protection**: 10-second timeout prevents hanging requests
- **Rich logging**: All Discord webhook attempts logged for debugging
- **No user impact**: Discord failures are transparent to customers

## 🚀 Deployment

### Development (Vercel Preview)
1. **Create Discord webhook** in your server
2. **Set DISCORD_WEBHOOK_URL** in Vercel environment variables
3. **Deploy feature branch**
4. **Test with** `/api/test/webhook`
5. **Submit test forms** to verify end-to-end

### Production
1. **Merge to main** after testing
2. **Set production environment variables**
3. **Monitor Discord channel** for notifications
4. **Enjoy instant customer alerts!**

## 🔍 Monitoring & Troubleshooting

### Discord Webhook Health
- Visit `/api/test/webhook` to test connectivity
- Check Vercel function logs for Discord API responses
- Verify webhook URL is correctly formatted

### Common Issues
1. **No notifications**: Check DISCORD_WEBHOOK_URL is set correctly
2. **Format issues**: Discord webhook URLs must be exact
3. **Permissions**: Ensure webhook has permission to post in channel
4. **Rate limits**: Discord webhooks have generous limits, rarely an issue

## 📈 Expected Results

Once deployed, you'll get:

1. **Immediate awareness** of new leads (consultations, ROI assessments)
2. **Instant customer communication alerts** (SMS, voicemails)
3. **Beautiful formatted notifications** with colors and structure
4. **Zero maintenance** - Discord handles all the reliability
5. **Perfect uptime** - No servers to crash or maintain

**Bottom line: Know about ALL customer interactions instantly with zero infrastructure!** 🎉

## 🔐 Security Notes

- **Webhook URL is sensitive**: Treat like a password
- **Server-side only**: Never expose webhook URL to client-side code
- **Private channels**: Use private Discord channels for business notifications
- **Access control**: Only give Discord channel access to authorized team members

---

## Why This Approach Rocks

✅ **Dead Simple** - No servers, tunnels, or complex setup  
✅ **100% Reliable** - Discord's infrastructure, not yours  
✅ **Beautiful** - Rich embeds with colors, emojis, and structure  
✅ **Instant** - Notifications arrive in seconds  
✅ **Free** - No additional costs or subscriptions  
✅ **Scalable** - Handles any volume without performance impact  
✅ **Mobile** - Get notifications on Discord mobile app anywhere  

Perfect for busy entrepreneurs who need to know about opportunities the moment they happen! 🚀Discord webhook configured for channel #1468438971293106186
Ready for testing with DISCORD_WEBHOOK_URL environment variable set
