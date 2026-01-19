import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminOrEditor } from "@/lib/auth/session";

// GET /api/communications - List communications with filtering
export async function GET(request: NextRequest) {
  try {
    // Require admin or editor authentication
    await requireAdminOrEditor();

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const type = searchParams.get("type"); // voicemail, sms, email, call
    const status = searchParams.get("status"); // unread, read, archived, replied
    const direction = searchParams.get("direction"); // inbound, outbound
    const customerId = searchParams.get("customer_id");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("communications")
      .select(
        "*, customer:customers!customer_id(id, name, email, phone)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (direction && direction !== "all") {
      query = query.eq("direction", direction);
    }

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    if (search) {
      query = query.or(
        `from_address.ilike.%${search}%,from_name.ilike.%${search}%,body.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch communications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
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
