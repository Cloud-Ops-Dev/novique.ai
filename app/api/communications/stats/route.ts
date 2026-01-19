import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminOrEditor } from "@/lib/auth/session";

// GET /api/communications/stats - Get communication counts for badges
export async function GET() {
  try {
    // Require admin or editor authentication
    await requireAdminOrEditor();

    const supabase = createAdminClient();

    // Get counts by type and status
    const [
      { count: totalUnread },
      { count: unreadVoicemail },
      { count: unreadSms },
      { count: unreadEmail },
      { count: todayCount },
    ] = await Promise.all([
      // Total unread
      supabase
        .from("communications")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread"),
      // Unread voicemails
      supabase
        .from("communications")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread")
        .eq("type", "voicemail"),
      // Unread SMS
      supabase
        .from("communications")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread")
        .eq("type", "sms"),
      // Unread emails
      supabase
        .from("communications")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread")
        .eq("type", "email"),
      // Today's count
      supabase
        .from("communications")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total_unread: totalUnread || 0,
        unread_voicemail: unreadVoicemail || 0,
        unread_sms: unreadSms || 0,
        unread_email: unreadEmail || 0,
        today_count: todayCount || 0,
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
