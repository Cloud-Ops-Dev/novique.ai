import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Twilio SMS Webhook - Incoming Message Handler
 *
 * Configure in Twilio Console:
 * https://novique.ai/api/twilio/sms
 *
 * Purpose:
 * - Handle inbound SMS messages
 * - Store messages in communications table
 * - Auto-reply functionality
 * - Opt-out handling (STOP, UNSUBSCRIBE, etc.)
 * - Send admin notifications
 */

// Standard opt-out keywords
const OPT_OUT_KEYWORDS = ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
const OPT_IN_KEYWORDS = ["START", "SUBSCRIBE", "YES"];

export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const { MessageSid, From, To, Body, NumMedia } = params;

    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] Twilio SMS Received: ${MessageSid} | From: ${From} | To: ${To} | Body: "${Body}" | Media: ${NumMedia || 0}`
    );

    const supabase = createAdminClient();
    const messageBody = (Body || "").trim();
    const messageUpper = messageBody.toUpperCase();

    // Handle opt-out
    if (OPT_OUT_KEYWORDS.includes(messageUpper)) {
      console.log(`  Opt-out request from ${From}`);

      // Update consent status
      await supabase.from("sms_consent").upsert(
        {
          phone_number: From,
          consented: false,
          opt_out_date: new Date().toISOString(),
        },
        { onConflict: "phone_number" }
      );

      // Store the opt-out message
      await storeMessage(supabase, {
        from: From,
        to: To,
        body: messageBody,
        messageSid: MessageSid,
        smsConsent: false,
      });

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been unsubscribed and will not receive further messages. Reply START to resubscribe.</Message>
</Response>`;

      return new NextResponse(twiml, {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Handle opt-in
    if (OPT_IN_KEYWORDS.includes(messageUpper)) {
      console.log(`  Opt-in request from ${From}`);

      // Update consent status
      await supabase.from("sms_consent").upsert(
        {
          phone_number: From,
          consented: true,
          consent_date: new Date().toISOString(),
          consent_source: "sms_keyword",
        },
        { onConflict: "phone_number" }
      );

      // Store the opt-in message
      await storeMessage(supabase, {
        from: From,
        to: To,
        body: messageBody,
        messageSid: MessageSid,
        smsConsent: true,
      });

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Welcome back! You are now subscribed to messages from Novique AI.</Message>
</Response>`;

      return new NextResponse(twiml, {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Store the message in database
    const communication = await storeMessage(supabase, {
      from: From,
      to: To,
      body: messageBody,
      messageSid: MessageSid,
    });

    // Send admin notification
    if (communication) {
      await sendAdminNotification({
        from: From,
        preview: messageBody,
        communicationId: communication.id,
      });
    }

    // Auto-reply
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message! We've received it and will get back to you soon. Visit novique.ai for more information.</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Twilio SMS webhook error:", error);

    // Return empty response on error (no reply)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response/>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

/**
 * Store SMS message in communications table
 */
async function storeMessage(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    from: string;
    to: string;
    body: string;
    messageSid: string;
    smsConsent?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("communications")
    .insert({
      type: "sms",
      direction: "inbound",
      status: "unread",
      from_address: params.from,
      to_address: params.to,
      body: params.body,
      twilio_message_sid: params.messageSid,
      sms_consent: params.smsConsent,
    })
    .select()
    .single();

  if (error) {
    console.error("  Failed to store SMS:", error);
    return null;
  }

  console.log(`  SMS stored with ID: ${data.id}`);
  return data;
}

/**
 * Send SMS notification to admin about new message
 */
async function sendAdminNotification(params: {
  from: string;
  preview: string;
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
  const preview = params.preview
    ? params.preview.substring(0, 50) + (params.preview.length > 50 ? "..." : "")
    : "";

  const message = `New SMS from ${params.from}\n"${preview}"\nView: ${baseUrl}/admin/communications`;

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
    endpoint: "Twilio SMS Webhook",
    purpose: "Incoming SMS handler with database storage and notifications",
    status: "active",
  });
}
