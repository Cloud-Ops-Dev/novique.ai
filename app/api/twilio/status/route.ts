import { NextRequest, NextResponse } from "next/server";

/**
 * Twilio SMS Status Callback Webhook
 *
 * Configure in Twilio Console:
 * https://novique.ai/api/twilio/status
 *
 * Purpose:
 * - Track SMS delivery status (delivered, failed, etc.)
 * - Log carrier errors
 * - Analytics and reporting
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
      MessageSid,
      MessageStatus,
      SmsStatus,
      From,
      To,
      ErrorCode,
      ErrorMessage,
    } = params;

    const status = MessageStatus || SmsStatus;
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] Twilio SMS Status: ${status} | MessageSid: ${MessageSid} | From: ${From} | To: ${To}`
    );

    if (ErrorCode) {
      console.error(`  Error: ${ErrorCode} - ${ErrorMessage}`);
    }

    // TODO: Update message status in database
    // const supabase = createAdminClient();
    // await supabase
    //   .from('sms_logs')
    //   .update({
    //     status: status,
    //     error_code: ErrorCode,
    //     error_message: ErrorMessage,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq('message_sid', MessageSid);

    // TODO: Track analytics
    // - Delivery rate
    // - Failed message patterns
    // - Carrier-specific issues

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Twilio SMS status webhook error:", error);
    return new NextResponse(null, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Twilio SMS Status Callback",
    purpose: "Delivery status tracking, carrier errors, analytics",
    status: "placeholder",
  });
}
