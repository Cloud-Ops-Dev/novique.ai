import { NextRequest, NextResponse } from "next/server";

/**
 * Twilio Voice Webhook - Incoming Call Handler
 *
 * Configure in Twilio Console:
 * Phone Number > Voice Configuration > A Call Comes In
 * URL: https://novique.ai/api/twilio/voice
 * HTTP Method: POST
 *
 * Flow:
 * 1. Caller dials toll-free number
 * 2. This webhook returns TwiML to play greeting and record voicemail
 * 3. Recording completion triggers /api/twilio/recording-complete
 * 4. Transcription completion triggers /api/twilio/transcription
 */

// Get base URL for callbacks
function getBaseUrl(request: NextRequest): string {
  // Use VERCEL_URL in production, or construct from request headers
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // For local development with ngrok
  if (process.env.NGROK_URL) {
    return process.env.NGROK_URL;
  }

  // Fallback: construct from request
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body (Twilio sends this format)
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const { CallSid, From, To, CallStatus } = params;

    console.log(
      `[Twilio Voice] Incoming call: ${CallSid} | From: ${From} | To: ${To} | Status: ${CallStatus}`
    );

    const baseUrl = getBaseUrl(request);

    // Build callback URLs
    const recordingStatusCallback = `${baseUrl}/api/twilio/recording-complete`;
    const transcribeCallback = `${baseUrl}/api/twilio/transcription`;

    // TwiML response with voicemail recording
    // Note: The greeting message is configured here. Update as needed.
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy">
    Thank you for calling Novique AI.
    We're sorry we can't take your call right now.
    Please leave a message after the tone, and we'll get back to you as soon as possible.
  </Say>
  <Record
    maxLength="180"
    transcribe="true"
    transcribeCallback="${transcribeCallback}"
    recordingStatusCallback="${recordingStatusCallback}"
    recordingStatusCallbackEvent="completed"
    playBeep="true"
    timeout="10"
    finishOnKey="#"
  />
  <Say voice="Polly.Amy">
    We did not receive your message. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Twilio voice webhook error:", error);

    // Return error TwiML - still try to record
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy">We're experiencing technical difficulties. Please leave a message after the tone.</Say>
  <Record maxLength="120" playBeep="true" />
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
    endpoint: "Twilio Voice Webhook",
    purpose: "Incoming call handler - plays greeting and records voicemail",
    status: "active",
    callbacks: {
      recordingComplete: "/api/twilio/recording-complete",
      transcription: "/api/twilio/transcription",
    },
  });
}
