import { NextRequest, NextResponse } from "next/server";

/**
 * Twilio Voice Fallback Webhook
 *
 * Configure in Twilio Console:
 * https://novique.ai/api/twilio/voice-fallback
 *
 * Purpose:
 * - Error handling if main voice handler fails
 * - Provides graceful degradation for callers
 */

export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const { CallSid, From, To, ErrorCode, ErrorUrl } = params;

    console.error(
      `[Twilio Voice Fallback] Call failed: ${CallSid} | From: ${From} | To: ${To} | Error: ${ErrorCode} | URL: ${ErrorUrl}`
    );

    // TODO: Log error to monitoring system
    // TODO: Send alert notification

    // Fallback TwiML - apologize and provide alternative
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy">We apologize, but we're experiencing technical difficulties. Please visit novique.ai or send an email to contact us. Thank you for your patience.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Twilio voice fallback error:", error);

    // Last resort TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We are sorry. Goodbye.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Twilio Voice Fallback Webhook",
    purpose: "Error handling if main voice handler fails",
    status: "placeholder",
  });
}
