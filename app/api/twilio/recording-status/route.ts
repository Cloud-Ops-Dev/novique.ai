import { NextRequest, NextResponse } from "next/server";

/**
 * Twilio Recording Status Callback Webhook
 *
 * Configure in Twilio Console:
 * https://novique.ai/api/twilio/recording-status
 *
 * Purpose:
 * - Trigger transcription when recording is ready
 * - AI summarization of calls
 * - CRM logging with call details
 */

export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const {
      RecordingSid,
      RecordingUrl,
      RecordingStatus,
      RecordingDuration,
      RecordingChannels,
      RecordingSource,
      CallSid,
      AccountSid,
      ErrorCode,
    } = params;

    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] Twilio Recording Status: ${RecordingStatus} | RecordingSid: ${RecordingSid} | CallSid: ${CallSid} | Duration: ${RecordingDuration}s`
    );
    console.log(`  URL: ${RecordingUrl}`);
    console.log(`  Channels: ${RecordingChannels} | Source: ${RecordingSource}`);

    if (ErrorCode) {
      console.error(`  Error: ${ErrorCode}`);
    }

    // TODO: Store recording metadata in database
    // const supabase = createAdminClient();
    // await supabase.from('recordings').insert({
    //   recording_sid: RecordingSid,
    //   call_sid: CallSid,
    //   status: RecordingStatus,
    //   url: RecordingUrl,
    //   duration: parseInt(RecordingDuration) || 0,
    //   channels: parseInt(RecordingChannels) || 1,
    //   source: RecordingSource,
    //   error_code: ErrorCode,
    // });

    // Trigger AI processing when recording is complete
    if (RecordingStatus === "completed" && RecordingUrl) {
      console.log(`  Triggering AI processing for recording ${RecordingSid}`);

      // TODO: Trigger async transcription
      // await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/transcribe`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     recordingSid: RecordingSid,
      //     recordingUrl: RecordingUrl,
      //     callSid: CallSid,
      //   }),
      // });

      // TODO: After transcription, trigger summarization
      // await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/summarize-call`, {...});

      // TODO: Classify intent for CRM tagging
      // await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/classify-intent`, {...});
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Twilio recording status webhook error:", error);
    return new NextResponse(null, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Twilio Recording Status Callback",
    purpose: "Trigger transcription, AI summarization, CRM logging",
    status: "placeholder",
  });
}
