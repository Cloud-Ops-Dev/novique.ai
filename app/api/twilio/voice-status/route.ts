import { NextRequest, NextResponse } from "next/server";

/**
 * Twilio Voice Status Callback Webhook
 *
 * Configure in Twilio Console:
 * https://novique.ai/api/twilio/voice-status
 *
 * Purpose:
 * - Track call completion status
 * - Log call duration
 * - Capture Recording SID
 * - Trigger AI post-processing
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
      CallSid,
      CallStatus,
      CallDuration,
      From,
      To,
      Direction,
      RecordingSid,
      RecordingUrl,
      RecordingDuration,
      ErrorCode,
      ErrorMessage,
    } = params;

    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] Twilio Voice Status: ${CallStatus} | CallSid: ${CallSid} | Duration: ${CallDuration}s | From: ${From} | To: ${To} | Direction: ${Direction}`
    );

    if (RecordingSid) {
      console.log(
        `  Recording: ${RecordingSid} | Duration: ${RecordingDuration}s | URL: ${RecordingUrl}`
      );
    }

    if (ErrorCode) {
      console.error(`  Error: ${ErrorCode} - ${ErrorMessage}`);
    }

    // TODO: Store call log in database
    // const supabase = createAdminClient();
    // await supabase.from('call_logs').insert({
    //   call_sid: CallSid,
    //   status: CallStatus,
    //   duration: parseInt(CallDuration) || 0,
    //   from_number: From,
    //   to_number: To,
    //   direction: Direction,
    //   recording_sid: RecordingSid,
    //   recording_url: RecordingUrl,
    //   recording_duration: parseInt(RecordingDuration) || null,
    //   error_code: ErrorCode,
    //   error_message: ErrorMessage,
    // });

    // TODO: Trigger AI post-processing for completed calls
    // if (CallStatus === 'completed' && RecordingSid) {
    //   await triggerTranscription(RecordingSid);
    // }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Twilio voice status webhook error:", error);
    return new NextResponse(null, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Twilio Voice Status Callback",
    purpose: "Call completed/failed, duration, recording SID, AI trigger",
    status: "placeholder",
  });
}
