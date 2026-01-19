import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminOrEditor } from "@/lib/auth/session";

// GET /api/communications/[id]/audio - Proxy voicemail audio from Twilio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[audio] Starting audio proxy request");

    // Require admin or editor authentication
    await requireAdminOrEditor();
    console.log("[audio] Auth passed");

    const { id } = await params;
    console.log("[audio] Communication ID:", id);

    const supabase = createAdminClient();

    // Get recording URL from database
    const { data: communication, error } = await supabase
      .from("communications")
      .select("recording_url, type")
      .eq("id", id)
      .single();

    if (error || !communication) {
      return NextResponse.json(
        { error: "Communication not found" },
        { status: 404 }
      );
    }

    if (communication.type !== "voicemail") {
      return NextResponse.json(
        { error: "Communication is not a voicemail" },
        { status: 400 }
      );
    }

    if (!communication.recording_url) {
      return NextResponse.json(
        { error: "No recording available" },
        { status: 404 }
      );
    }

    // Fetch audio from Twilio with authentication
    // Support both main credentials and API keys
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

    console.log("[audio] Env check - TWILIO_ACCOUNT_SID:", accountSid ? "set" : "NOT SET");
    console.log("[audio] Env check - TWILIO_AUTH_TOKEN:", authToken ? "set" : "NOT SET");
    console.log("[audio] Env check - TWILIO_API_KEY_SID:", apiKeySid ? "set" : "NOT SET");
    console.log("[audio] Env check - TWILIO_API_KEY_SECRET:", apiKeySecret ? "set" : "NOT SET");

    let authUsername: string;
    let authPassword: string;

    if (apiKeySid && apiKeySecret) {
      console.log("[audio] Using API key authentication");
      authUsername = apiKeySid;
      authPassword = apiKeySecret;
    } else if (accountSid && authToken) {
      console.log("[audio] Using account credentials authentication");
      authUsername = accountSid;
      authPassword = authToken;
    } else {
      console.error("[audio] No Twilio credentials configured!");
      return NextResponse.json(
        { error: "Twilio credentials not configured" },
        { status: 500 }
      );
    }

    // Twilio recording URLs need authentication and .mp3 extension
    const audioUrl = `${communication.recording_url}.mp3`;
    console.log("[audio] Fetching from Twilio URL:", audioUrl);

    const response = await fetch(audioUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${authUsername}:${authPassword}`).toString("base64")}`,
      },
    });

    console.log("[audio] Twilio response status:", response.status);

    if (!response.ok) {
      console.error("[audio] Failed to fetch audio from Twilio:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch audio" },
        { status: 502 }
      );
    }

    // Stream the audio back to the client
    const audioBuffer = await response.arrayBuffer();
    console.log("[audio] Audio buffer size:", audioBuffer.byteLength, "bytes");

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    if (error?.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
