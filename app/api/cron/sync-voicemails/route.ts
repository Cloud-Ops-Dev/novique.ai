import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Cron job to sync voicemails from Twilio
 *
 * Runs every 5 minutes via Vercel Cron
 * - Fetches recent recordings from Twilio API
 * - Imports any new ones not already in database
 * - Sends SMS notification for new voicemails
 */

interface TwilioRecording {
  sid: string;
  call_sid: string;
  duration: string;
  date_created: string;
  uri: string;
}

interface TwilioCall {
  sid: string;
  from: string;
  to: string;
  status: string;
  date_created: string;
}

async function twilioFetch(endpoint: string): Promise<unknown> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

  if (!accountSid) {
    throw new Error("TWILIO_ACCOUNT_SID not configured");
  }

  // Determine auth method
  let authUsername: string;
  let authPassword: string;

  if (apiKeySid && apiKeySecret) {
    authUsername = apiKeySid;
    authPassword = apiKeySecret;
  } else if (authToken) {
    authUsername = accountSid;
    authPassword = authToken;
  } else {
    throw new Error("Twilio credentials not configured");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}${endpoint}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${authUsername}:${authPassword}`).toString("base64")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Twilio API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function sendAdminNotification(params: {
  from: string;
  duration: number;
}) {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!adminPhone || !twilioPhone || !accountSid || !authToken) {
    console.log("[sync] SMS notification skipped - missing config");
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novique.ai";
  const message = `New voicemail from ${params.from}\nDuration: ${params.duration}s\nView: ${baseUrl}/admin/communications`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: adminPhone,
          From: twilioPhone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error("[sync] Failed to send admin notification");
    } else {
      console.log(`[sync] Admin notification sent to ${adminPhone}`);
    }
  } catch (error) {
    console.error("[sync] Error sending notification:", error);
  }
}

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting voicemail sync...`);

  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("[sync] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch recent recordings from Twilio (last 100)
    const recordingsResponse = (await twilioFetch("/Recordings.json?PageSize=100")) as {
      recordings: TwilioRecording[];
    };
    const recordings = recordingsResponse.recordings || [];

    console.log(`[sync] Found ${recordings.length} recordings in Twilio`);

    if (recordings.length === 0) {
      return NextResponse.json({ synced: 0, skipped: 0 });
    }

    const supabase = createAdminClient();
    let synced = 0;
    let skipped = 0;

    for (const recording of recordings) {
      // Check if already imported
      const { data: existing } = await supabase
        .from("communications")
        .select("id")
        .eq("twilio_recording_sid", recording.sid)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Get call details for from/to numbers
      const call = (await twilioFetch(`/Calls/${recording.call_sid}.json`)) as TwilioCall;

      // Build recording URL
      const recordingUrl = `https://api.twilio.com${recording.uri.replace(".json", "")}`;

      // Insert into database
      const { error } = await supabase.from("communications").insert({
        type: "voicemail",
        direction: "inbound",
        status: "unread",
        from_address: call.from,
        to_address: call.to,
        duration: parseInt(recording.duration) || 0,
        recording_url: recordingUrl,
        transcription_status: "pending",
        twilio_call_sid: recording.call_sid,
        twilio_recording_sid: recording.sid,
        created_at: new Date(recording.date_created).toISOString(),
      });

      if (error) {
        console.error(`[sync] Error importing ${recording.sid}:`, error.message);
      } else {
        console.log(`[sync] Imported voicemail from ${call.from} (${recording.duration}s)`);
        synced++;

        // Send SMS notification for new voicemail
        await sendAdminNotification({
          from: call.from,
          duration: parseInt(recording.duration) || 0,
        });
      }
    }

    console.log(`[sync] Complete: ${synced} synced, ${skipped} skipped`);

    return NextResponse.json({
      synced,
      skipped,
      timestamp,
    });
  } catch (error) {
    console.error("[sync] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
