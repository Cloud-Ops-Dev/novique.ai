import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Twilio Transcription Webhook
 *
 * Configure via TwiML transcribeCallback attribute:
 * https://novique.ai/api/twilio/transcription
 *
 * Purpose:
 * - Receive transcription when Twilio finishes processing voicemail audio
 * - Update communications record with transcribed text
 */

export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body (Twilio format)
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const {
      TranscriptionSid,
      TranscriptionText,
      TranscriptionStatus,
      TranscriptionUrl,
      RecordingSid,
      RecordingUrl,
      CallSid,
      AccountSid,
      ErrorCode,
    } = params;

    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] Twilio Transcription: ${TranscriptionStatus} | RecordingSid: ${RecordingSid} | CallSid: ${CallSid}`
    );
    console.log(`  TranscriptionSid: ${TranscriptionSid}`);
    console.log(`  Text: "${TranscriptionText?.substring(0, 100)}${TranscriptionText?.length > 100 ? "..." : ""}"`);

    if (ErrorCode) {
      console.error(`  Transcription Error: ${ErrorCode}`);
    }

    const supabase = createAdminClient();

    // Determine transcription status for our database
    let dbStatus: "completed" | "failed";
    if (TranscriptionStatus === "completed" && TranscriptionText) {
      dbStatus = "completed";
    } else {
      dbStatus = "failed";
    }

    // Find the communication record by recording SID and update it
    const { data, error } = await supabase
      .from("communications")
      .update({
        body: TranscriptionText || null,
        transcription_status: dbStatus,
      })
      .eq("twilio_recording_sid", RecordingSid)
      .select()
      .single();

    if (error) {
      console.error("  Failed to update transcription:", error);

      // Try finding by call SID as fallback
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("communications")
        .update({
          body: TranscriptionText || null,
          transcription_status: dbStatus,
        })
        .eq("twilio_call_sid", CallSid)
        .eq("type", "voicemail")
        .select()
        .single();

      if (fallbackError) {
        console.error("  Fallback update also failed:", fallbackError);
      } else {
        console.log(`  Transcription updated (via CallSid) for ID: ${fallbackData.id}`);
      }
    } else {
      console.log(`  Transcription updated for ID: ${data.id}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Twilio transcription webhook error:", error);
    // Return 200 to prevent Twilio retries
    return new NextResponse(null, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Twilio Transcription Webhook",
    purpose: "Receive voicemail transcriptions and update records",
    status: "active",
  });
}
