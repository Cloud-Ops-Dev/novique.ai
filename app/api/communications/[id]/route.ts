import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminOrEditor, getCurrentUser } from "@/lib/auth/session";

// GET /api/communications/[id] - Get single communication
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin or editor authentication
    await requireAdminOrEditor();

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: communication, error } = await supabase
      .from("communications")
      .select("*, customer:customers!customer_id(id, name, email, phone)")
      .eq("id", id)
      .single();

    if (error || !communication) {
      return NextResponse.json(
        { error: "Communication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: communication,
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

// PATCH /api/communications/[id] - Update communication status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ["status", "customer_id"];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: communication, error } = await supabase
      .from("communications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update communication" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: communication });
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

// DELETE /api/communications/[id] - Delete communication
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Get communication first to check for Twilio resources
    const { data: communication } = await supabase
      .from("communications")
      .select("twilio_recording_sid")
      .eq("id", id)
      .single();

    // Delete from database
    const { error } = await supabase
      .from("communications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete communication" },
        { status: 500 }
      );
    }

    // Optionally delete Twilio recording
    if (communication?.twilio_recording_sid) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (accountSid && authToken) {
        try {
          await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${communication.twilio_recording_sid}.json`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
              },
            }
          );
          console.log(`Deleted Twilio recording: ${communication.twilio_recording_sid}`);
        } catch (twilioError) {
          console.error("Failed to delete Twilio recording:", twilioError);
          // Don't fail the request if Twilio deletion fails
        }
      }
    }

    return NextResponse.json({ success: true });
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
