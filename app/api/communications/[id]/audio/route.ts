import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminOrEditor } from "@/lib/auth/session";

// GET /api/communications/[id]/audio - Proxy voicemail audio from Twilio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin or editor authentication
    await requireAdminOrEditor();

    const { id } = await params;
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

    let authUsername: string;
    let authPassword: string;

    if (apiKeySid && apiKeySecret) {
      authUsername = apiKeySid;
      authPassword = apiKeySecret;
    } else if (accountSid && authToken) {
      authUsername = accountSid;
      authPassword = authToken;
    } else {
      return NextResponse.json(
        { error: "Twilio credentials not configured" },
        { status: 500 }
      );
    }

    // Twilio recording URLs need authentication and .mp3 extension
    const audioUrl = `${communication.recording_url}.mp3`;

    const response = await fetch(audioUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${authUsername}:${authPassword}`).toString("base64")}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch audio from Twilio:", response.status);
      return NextResponse.json(
        { error: "Failed to fetch audio" },
        { status: 502 }
      );
    }

    // Stream the audio back to the client
    const audioBuffer = await response.arrayBuffer();

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
