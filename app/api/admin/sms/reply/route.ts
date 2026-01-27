import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Send SMS Reply from Admin Panel
 *
 * POST /api/admin/sms/reply
 * Body: { communicationId: string, message: string }
 *
 * Sends an outbound SMS via Twilio and stores it in communications table.
 */

export async function POST(request: NextRequest) {
  try {
    const { communicationId, message } = await request.json();

    if (!communicationId || !message?.trim()) {
      return NextResponse.json(
        { error: "communicationId and message are required" },
        { status: 400 }
      );
    }

    // Support both naming conventions for Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.Twilio_Account_SID;
    const apiKeySid = process.env.Twilio_API_key_SID;
    const apiKeySecret = process.env.Twilio_API_Key_Secret;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    // Can authenticate with either Auth Token or API Key
    const authUsername = apiKeySid || accountSid;
    const authPassword = apiKeySecret || authToken;

    if (!accountSid || !authUsername || !authPassword || !twilioPhone) {
      console.error("Missing Twilio configuration");
      return NextResponse.json(
        { error: "SMS service not configured" },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();

    // Get the original communication to find the recipient
    const { data: original, error: fetchError } = await supabase
      .from("communications")
      .select("id, from_address, to_address, type")
      .eq("id", communicationId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Original communication not found" },
        { status: 404 }
      );
    }

    if (original.type !== "sms") {
      return NextResponse.json(
        { error: "Can only reply to SMS communications" },
        { status: 400 }
      );
    }

    // The recipient is the original sender (from_address)
    const recipientPhone = original.from_address;

    // Send SMS via Twilio REST API
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${authUsername}:${authPassword}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: recipientPhone,
          From: twilioPhone,
          Body: message.trim(),
        }),
      }
    );

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      console.error("Twilio send failed:", errorText);
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: 500 }
      );
    }

    const twilioResult = await twilioResponse.json();

    // Store the outbound message in communications table
    const { data: reply, error: insertError } = await supabase
      .from("communications")
      .insert({
        type: "sms",
        direction: "outbound",
        status: "read", // Outbound messages are already "read"
        from_address: twilioPhone,
        to_address: recipientPhone,
        body: message.trim(),
        twilio_message_sid: twilioResult.sid,
        reply_to_id: communicationId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store outbound SMS:", insertError);
      // SMS was sent, but storage failed - still return success
    }

    // Update original message status to "replied"
    await supabase
      .from("communications")
      .update({ status: "replied" })
      .eq("id", communicationId);

    return NextResponse.json({
      success: true,
      messageSid: twilioResult.sid,
      replyId: reply?.id,
    });
  } catch (error) {
    console.error("SMS reply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
