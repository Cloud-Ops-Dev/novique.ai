# Jarvis API - Customer Communications Integration

This document explains how to configure Jarvis (desktop assistant) to query customer communications from Novique.ai.

## Overview

The Jarvis API provides authenticated endpoints for querying:
- **Voicemails** - Phone messages with transcriptions
- **SMS** - Text messages (pending Twilio toll-free verification)
- **Consultation Requests** - Form submissions from the contact page
- **ROI Assessments** - Submissions from the ROI calculator

## Authentication

All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JARVIS_API_KEY>
```

### API Key

**Local Development:** Already configured in `.env.local`

**Production:** Must be added to Vercel environment variables:
- URL: https://vercel.com/mark-howells-projects/novique-ai/settings/environment-variables
- Name: `JARVIS_API_KEY`
- Value: `B8GsbCypamdcfMlt4mFN6Ktc2rL5IPdkolvipIiqxcE=`
- Environments: ☑️ Production

## Endpoints

### Base URL
- **Local:** `http://localhost:3000`
- **Production:** `https://novique.ai`

---

### GET /api/jarvis/communications

**Dashboard summary** - Returns counts and recent items for all communication types.

```bash
curl -H "Authorization: Bearer $JARVIS_API_KEY" \
  https://novique.ai/api/jarvis/communications
```

**Response:**
```json
{
  "voicemails": {
    "total": 3,
    "unread": 1,
    "recent": [...]
  },
  "sms": {
    "total": 1,
    "unread": 0,
    "recent": [...]
  },
  "consultations": {
    "total": 2,
    "pending": 1,
    "recent": [...]
  },
  "roi_assessments": {
    "total": 1,
    "unconverted": 0,
    "recent": [...]
  },
  "summary": {
    "total_action_items": 2,
    "last_updated": "2026-01-28T17:00:00.000Z"
  }
}
```

The `total_action_items` field is the sum of all items needing attention.

---

### GET /api/jarvis/voicemails

**List voicemails** with optional filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max items to return (default 10, max 50) |
| `unread_only` | boolean | Only return unread voicemails |
| `since` | ISO date | Filter items after this date |

```bash
# Get 5 most recent unread voicemails
curl -H "Authorization: Bearer $JARVIS_API_KEY" \
  "https://novique.ai/api/jarvis/voicemails?limit=5&unread_only=true"
```

**Response:**
```json
{
  "voicemails": [
    {
      "id": "uuid",
      "from_address": "+12145551234",
      "from_name": null,
      "body": "Transcribed voicemail text...",
      "status": "unread",
      "direction": "inbound",
      "duration": 15,
      "recording_url": "https://api.twilio.com/...",
      "created_at": "2026-01-28T12:00:00Z",
      "customer": { "id": "uuid", "name": "John Doe" }
    }
  ],
  "total": 3,
  "unread_count": 1
}
```

---

### GET /api/jarvis/sms

**List SMS messages** with optional filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max items to return (default 10, max 50) |
| `unread_only` | boolean | Only return unread messages |
| `since` | ISO date | Filter items after this date |

```bash
curl -H "Authorization: Bearer $JARVIS_API_KEY" \
  "https://novique.ai/api/jarvis/sms?limit=10"
```

---

### GET /api/jarvis/consultations

**List consultation requests** with optional filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max items to return (default 10, max 50) |
| `pending_only` | boolean | Exclude converted consultations |
| `since` | ISO date | Filter items after this date |

```bash
# Get pending consultation requests
curl -H "Authorization: Bearer $JARVIS_API_KEY" \
  "https://novique.ai/api/jarvis/consultations?pending_only=true"
```

**Response:**
```json
{
  "consultations": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@company.com",
      "company": "Acme Corp",
      "phone": "555-1234",
      "message": "Interested in AI automation...",
      "status": "pending",
      "created_at": "2026-01-28T10:00:00Z"
    }
  ],
  "total": 2,
  "pending_count": 1
}
```

---

### GET /api/jarvis/roi-assessments

**List ROI assessment submissions** with optional filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max items to return (default 10, max 50) |
| `unconverted_only` | boolean | Exclude converted assessments |
| `since` | ISO date | Filter items after this date |

```bash
# Get unconverted ROI assessments
curl -H "Authorization: Bearer $JARVIS_API_KEY" \
  "https://novique.ai/api/jarvis/roi-assessments?unconverted_only=true"
```

**Response:**
```json
{
  "roi_assessments": [
    {
      "id": "uuid",
      "email": "prospect@company.com",
      "segment": "manufacturing",
      "plan_id": "scale",
      "annual_savings": 380000,
      "contacted": false,
      "converted": false,
      "created_at": "2026-01-28T09:00:00Z"
    }
  ],
  "total": 1,
  "unconverted_count": 1
}
```

---

### POST /api/jarvis/mark-read

**Batch mark communications as read.**

```bash
curl -X POST \
  -H "Authorization: Bearer $JARVIS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["uuid1", "uuid2"], "type": "voicemail"}' \
  https://novique.ai/api/jarvis/mark-read
```

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `ids` | string[] | Array of communication IDs (max 100) |
| `type` | string | Optional: "voicemail", "sms", or "all" |

**Response:**
```json
{
  "success": true,
  "updated_count": 2
}
```

---

## Jarvis Integration Example (Python)

```python
import os
import httpx

JARVIS_API_KEY = os.environ.get("JARVIS_API_KEY")
BASE_URL = "https://novique.ai"

async def get_communications_summary():
    """Get summary of all communications needing attention."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/api/jarvis/communications",
            headers={"Authorization": f"Bearer {JARVIS_API_KEY}"}
        )
        return response.json()

async def check_for_new_leads():
    """Check for any new leads requiring follow-up."""
    data = await get_communications_summary()

    action_items = data["summary"]["total_action_items"]

    if action_items > 0:
        messages = []

        if data["voicemails"]["unread"] > 0:
            messages.append(f"{data['voicemails']['unread']} unread voicemails")

        if data["sms"]["unread"] > 0:
            messages.append(f"{data['sms']['unread']} unread SMS")

        if data["consultations"]["pending"] > 0:
            messages.append(f"{data['consultations']['pending']} pending consultations")

        if data["roi_assessments"]["unconverted"] > 0:
            messages.append(f"{data['roi_assessments']['unconverted']} unconverted ROI assessments")

        return f"You have: {', '.join(messages)}"

    return None
```

---

## Environment Variable for Workstation

Add to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export JARVIS_API_KEY="B8GsbCypamdcfMlt4mFN6Ktc2rL5IPdkolvipIiqxcE="
```

Or add to Jarvis environment config.

---

## File Structure

```
app/api/jarvis/
├── communications/route.ts  # Dashboard summary
├── voicemails/route.ts      # Voicemail list
├── sms/route.ts             # SMS list
├── consultations/route.ts   # Consultation requests
├── roi-assessments/route.ts # ROI assessments
└── mark-read/route.ts       # Batch mark as read

lib/
└── jarvis-auth.ts           # API key validation
```

---

## Notes

- **SMS messaging** is pending Twilio toll-free verification
- All endpoints return `401 Unauthorized` without valid API key
- Timestamps are in ISO 8601 format (UTC)
- Customer data is auto-matched by phone number when available
