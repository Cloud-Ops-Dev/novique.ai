# 🚀 Webhook Integration for Real-Time Notifications

## Overview

This integration replaces the 30-minute scheduled email polling system with instant webhook notifications. When customers submit consultation requests or ROI assessments, you'll receive immediate alerts via Discord, desktop notifications, and laptop notifications instead of waiting for the next polling cycle.

## 🎯 Benefits

### Before (Scheduled Polling)
- ❌ **30-minute delays** for customer notifications
- ❌ **Constant API calls** even when nothing happens
- ❌ **Missed opportunities** during polling downtime
- ❌ **Higher server load** from continuous checking

### After (Real-Time Webhooks)
- ✅ **Instant notifications** (within seconds)
- ✅ **Zero resource usage** when no events occur  
- ✅ **100% reliable** event-driven notifications
- ✅ **Scalable** performance regardless of volume

## 📋 Integration Points

### 1. Consultation Requests (`/api/consultation`)
- **Trigger**: Customer submits consultation booking form
- **Data**: Name, email, company, phone, business details, meeting preferences
- **Notification**: "🤝 New consultation request: [Name] ([Email]) from [Company]"

### 2. ROI Assessments (`/api/roi/submit`)
- **Trigger**: Customer completes ROI calculator
- **Data**: Email, calculated ROI score, industry, financial projections
- **Notification**: "📊 New ROI assessment: [Email] (Score: [X])"

### 3. Future Extensions
- Contact form submissions
- Newsletter signups
- Admin panel events
- Customer support inquiries

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Webhook Configuration
WEBHOOK_URL=http://127.0.0.1:3001           # Local webhook server
WEBHOOK_API_KEY=your-secure-api-key         # Optional but recommended
WEBHOOK_TIMEOUT=10000                       # 10 second timeout
```

### Webhook Server Setup
The webhook server must be running to receive notifications:

```bash
# On your workstation (claymore)
cd /home/clayton/IDE/workstation/openclaw/push_notifications
npm start
```

Server will run on `http://127.0.0.1:3001` with endpoints:
- `POST /webhook/consultation` - Consultation requests
- `POST /webhook/roi-assessment` - ROI assessments  
- `POST /webhook/email` - Email notifications
- `GET /health` - Health check

## 🧪 Testing

### 1. Quick Test (GET Request)
Visit in browser or curl:
```bash
curl https://your-vercel-app.vercel.app/api/test/webhook
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Webhook test successful! Check your Discord/Desktop/Laptop for test notification.",
  "timestamp": "2026-02-03T19:30:00.000Z"
}
```

### 2. Specific Webhook Tests (POST Requests)

**Test Consultation Webhook:**
```bash
curl -X POST https://your-vercel-app.vercel.app/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "consultation",
    "name": "John Smith",
    "email": "john@example.com",
    "company": "Smith Industries"
  }'
```

**Test ROI Assessment Webhook:**
```bash
curl -X POST https://your-vercel-app.vercel.app/api/test/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "roi",
    "email": "jane@example.com", 
    "score": 92,
    "roi": 350,
    "netBenefit": 8500
  }'
```

### 3. Real Form Testing
- Submit actual consultation request on your website
- Complete ROI calculator
- Check for instant notifications vs waiting 30 minutes

## 📊 ROI Score Calculation

The system automatically calculates a quality score (0-100) for ROI assessments based on:

- **ROI Percentage (40% weight)**
  - 300%+ ROI = 40 points
  - 200-299% = 30 points  
  - 100-199% = 20 points
  - 50-99% = 10 points

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

**High-value leads (80+ score) can be prioritized for immediate follow-up.**

## 🔧 Technical Implementation

### Files Added/Modified

**New Files:**
- `lib/services/webhook-notifications.ts` - Core webhook service
- `app/api/test/webhook/route.ts` - Testing endpoints
- `WEBHOOK_INTEGRATION.md` - This documentation

**Modified Files:**
- `app/api/consultation/route.ts` - Added webhook notification
- `app/api/roi/submit/route.ts` - Added webhook notification with scoring
- `.env.example` - Added webhook configuration variables

### Error Handling
- **Graceful failures**: Form submissions work even if webhook fails
- **Timeout protection**: 10-second timeout prevents hanging requests
- **Logging**: All webhook attempts logged for debugging
- **No user impact**: Webhook failures are transparent to customers

## 🚀 Deployment

### Development (Vercel Preview)
1. **Push feature branch** to GitHub
2. **Review in Vercel preview** environment  
3. **Test webhook endpoints** using `/api/test/webhook`
4. **Submit test forms** to verify integration

### Production
1. **Merge feature branch** to main after testing
2. **Deploy to production** via Vercel
3. **Update environment variables** with production webhook URL
4. **Configure API key** for security
5. **Monitor webhook health** via logs and notifications

## 🔍 Monitoring & Troubleshooting

### Webhook Server Health
```bash
# Check if webhook server is running
curl http://127.0.0.1:3001/health

# Expected response:
{"status":"ok","timestamp":"...","uptime":123.45}
```

### Notification Channels
- **Discord**: Check #internal-development channel
- **Desktop**: System notifications on workstation
- **Laptop**: System notifications on laptop

### Common Issues
1. **Webhook timeouts**: Check network connectivity, increase timeout
2. **Authentication errors**: Verify API key configuration
3. **No notifications**: Confirm webhook server is running
4. **Partial failures**: Check individual channel logs

### Logs
- **Next.js**: Vercel function logs
- **Webhook server**: `/home/clayton/IDE/workstation/openclaw/push_notifications/server.log`
- **OpenClaw**: `openclaw logs --follow`

## 📈 Expected Results

Once deployed, you should see:

1. **Immediate awareness** of new leads
2. **Faster response times** to customer inquiries  
3. **Higher conversion rates** from rapid follow-up
4. **Reduced missed opportunities**
5. **Better customer experience** through responsiveness

**Bottom line: Know about new business opportunities in seconds, not minutes!** 🎉

---

## Support

For issues or questions:
1. Check webhook server status and logs
2. Test with `/api/test/webhook` endpoints
3. Verify environment variable configuration
4. Review Vercel deployment logs