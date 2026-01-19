/**
 * Import existing Twilio voicemails into the communications database
 *
 * Run with: npx tsx scripts/import-twilio-voicemails.ts
 *
 * Requires environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

// Support both main credentials and API keys
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Determine auth method
let authUsername: string
let authPassword: string

if (TWILIO_API_KEY_SID && TWILIO_API_KEY_SECRET && TWILIO_ACCOUNT_SID) {
  // Use API key auth
  authUsername = TWILIO_API_KEY_SID
  authPassword = TWILIO_API_KEY_SECRET
  console.log('Using Twilio API key authentication')
} else if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  // Use main account auth
  authUsername = TWILIO_ACCOUNT_SID
  authPassword = TWILIO_AUTH_TOKEN
  console.log('Using Twilio account credentials')
} else {
  console.error('Missing Twilio credentials. Need either:')
  console.error('  - TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN, or')
  console.error('  - TWILIO_ACCOUNT_SID + TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in environment')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Twilio API base URL
const TWILIO_API_BASE = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`

async function twilioFetch(endpoint: string) {
  const response = await fetch(`${TWILIO_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${authUsername}:${authPassword}`).toString('base64')}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Twilio API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

interface TwilioRecording {
  sid: string
  call_sid: string
  duration: string
  date_created: string
  uri: string
}

interface TwilioCall {
  sid: string
  from: string
  to: string
  status: string
  date_created: string
}

async function importVoicemails() {
  console.log('Fetching recordings from Twilio...')

  // Get all recordings
  const recordingsResponse = await twilioFetch('/Recordings.json')
  const recordings: TwilioRecording[] = recordingsResponse.recordings || []

  console.log(`Found ${recordings.length} recordings in Twilio`)

  if (recordings.length === 0) {
    console.log('No recordings to import')
    return
  }

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const recording of recordings) {
    try {
      // Check if already imported
      const { data: existing } = await supabase
        .from('communications')
        .select('id')
        .eq('twilio_recording_sid', recording.sid)
        .single()

      if (existing) {
        console.log(`Skipping ${recording.sid} - already imported`)
        skipped++
        continue
      }

      // Get call details for from/to numbers
      const call: TwilioCall = await twilioFetch(`/Calls/${recording.call_sid}.json`)

      // Build recording URL (without .mp3 extension - we add that in the audio proxy)
      const recordingUrl = `https://api.twilio.com${recording.uri.replace('.json', '')}`

      // Try to get transcription if available
      let transcriptionText: string | null = null
      let transcriptionStatus: 'pending' | 'completed' | 'failed' = 'pending'

      try {
        const transcriptionsResponse = await twilioFetch(`/Recordings/${recording.sid}/Transcriptions.json`)
        const transcriptions = transcriptionsResponse.transcriptions || []

        if (transcriptions.length > 0) {
          const transcription = transcriptions[0]
          if (transcription.status === 'completed') {
            // Fetch full transcription text
            const fullTranscription = await twilioFetch(`/Transcriptions/${transcription.sid}.json`)
            transcriptionText = fullTranscription.transcription_text
            transcriptionStatus = 'completed'
          } else if (transcription.status === 'failed') {
            transcriptionStatus = 'failed'
          }
        }
      } catch (e) {
        // No transcription available
        console.log(`  No transcription for ${recording.sid}`)
      }

      // Insert into database
      const { error } = await supabase
        .from('communications')
        .insert({
          type: 'voicemail',
          direction: 'inbound',
          status: 'unread',
          from_address: call.from,
          to_address: call.to,
          body: transcriptionText,
          duration: parseInt(recording.duration) || 0,
          recording_url: recordingUrl,
          transcription_status: transcriptionStatus,
          twilio_call_sid: recording.call_sid,
          twilio_recording_sid: recording.sid,
          created_at: new Date(recording.date_created).toISOString(),
        })

      if (error) {
        console.error(`Error importing ${recording.sid}:`, error.message)
        errors++
      } else {
        console.log(`Imported voicemail from ${call.from} (${recording.duration}s)`)
        imported++
      }

    } catch (e) {
      console.error(`Error processing ${recording.sid}:`, e)
      errors++
    }
  }

  console.log('\n=== Import Complete ===')
  console.log(`Imported: ${imported}`)
  console.log(`Skipped (already exists): ${skipped}`)
  console.log(`Errors: ${errors}`)
}

// Run the import
importVoicemails()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
