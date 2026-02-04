import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { discordWebhookNotifications } from "@/lib/services/discord-webhook-notifications";

/**
 * Twilio Recording Complete Webhook
 *
 * Configure in Twilio Console (or via TwiML recordingStatusCallback):
 * https://novique.ai/api/twilio/recording-complete
 *
 * Purpose:
 * - Receive notification when voicemail recording is complete
 * - Store voicemail metadata in communications table
 * - Match caller to CRM customer
 * - Trigger SMS notification to admin
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
      RecordingSid,
      RecordingUrl,
      RecordingStatus,
      RecordingDuration,
      CallSid,
      AccountSid,
      ErrorCode,
    } = params;

    // Also extract caller info that Twilio passes
    const From = params.From || params.Caller || "";
    const To = params.To || params.Called || "";

    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] Twilio Recording Complete: ${RecordingStatus} | RecordingSid: ${RecordingSid} | CallSid: ${CallSid}`
    );
    console.log(`  From: ${From} | To: ${To} | Duration: ${RecordingDuration}s`);
    console.log(`  URL: ${RecordingUrl}`);

    if (ErrorCode) {
      console.error(`  Recording Error: ${ErrorCode}`);
      // Still return 200 to acknowledge receipt
      return new NextResponse(null, { status: 200 });
    }

    // Only process completed recordings
    if (RecordingStatus !== "completed") {
      console.log(`  Skipping - status is ${RecordingStatus}, not completed`);
      return new NextResponse(null, { status: 200 });
    }

    // Store voicemail in database
    const supabase = createAdminClient();

    // The database trigger will auto-match customer by phone number
    const { data, error } = await supabase
      .from("communications")
      .insert({
        type: "voicemail",
        direction: "inbound",
        status: "unread",
        from_address: From,
        to_address: To,
        duration: parseInt(RecordingDuration) || 0,
        recording_url: RecordingUrl,
        transcription_status: "pending",
        twilio_call_sid: CallSid,
        twilio_recording_sid: RecordingSid,
      })
      .select()
      .single();

    if (error) {
      console.error("  Failed to store voicemail:", error);
      // Still return 200 to Twilio so it doesn't retry
      return new NextResponse(null, { status: 200 });
    }

    console.log(`  Voicemail stored with ID: ${data.id}`);

    // Send instant Discord notification
    try {
      await discordWebhookNotifications.voicemailNotification({
        id: data.id.toString(),
        from: From,
        duration: parseInt(RecordingDuration) || 0,
      });
    } catch (webhookError) {
      console.error("  Discord notification failed:", webhookError);
      // Continue processing even if notification fails
    }

    // Send SMS notification to admin if configured (legacy method - can remove this later)
    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
    if (adminPhone) {
      await sendAdminNotification({
        type: "voicemail",
        from: From,
        duration: parseInt(RecordingDuration) || 0,
        communicationId: data.id,
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Twilio recording-complete webhook error:", error);
    // Return 200 to prevent Twilio retries
    return new NextResponse(null, { status: 200 });
  }
}

/**
 * Send SMS notification to admin about new communication
 */
async function sendAdminNotification(params: {
  type: "voicemail" | "sms";
  from: string;
  duration?: number;
  preview?: string;
  communicationId: string;
}) {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!adminPhone || !twilioPhone || !accountSid || !authToken) {
    console.log("  SMS notification skipped - missing Twilio config");
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novique.ai";

  let message: string;
  if (params.type === "voicemail") {
    message = `New voicemail from ${params.from}\nDuration: ${params.duration}s\nView: ${baseUrl}/admin/communications`;
  } else {
    const preview = params.preview
      ? params.preview.substring(0, 50) + (params.preview.length > 50 ? "..." : "")
      : "";
    message = `New SMS from ${params.from}\n"${preview}"\nView: ${baseUrl}/admin/communications`;
  }

  try {
    // Send SMS via Twilio REST API
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
      const error = await response.text();
      console.error("  Failed to send admin notification:", error);
    } else {
      console.log(`  Admin notification sent to ${adminPhone}`);
    }
  } catch (error) {
    console.error("  Error sending admin notification:", error);
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Twilio Recording Complete Webhook",
    purpose: "Store voicemail recordings and notify admin",
    status: "active",
  });
}
