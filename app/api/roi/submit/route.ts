import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { discordWebhookNotifications, DiscordWebhookNotificationService } from "@/lib/services/discord-webhook-notifications";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, results, industry, employeesImpacted, selectedWorkflows, derivedPricing } = body;

    // Validate required fields
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Save to Supabase database
    // Note: results now includes correct roiPercent computed with derived pricing
    const supabase = await createClient();
    const { data: roiData, error: dbError } = await supabase.from("roi_assessments").insert({
      email,
      calculated_results: {
        ...results,
        // Include pricing info in the results for reference
        monthlyFee: derivedPricing?.monthlyFee,
        setupFee: derivedPricing?.setupFee,
        recommendedTier: derivedPricing?.recommendedTier,
      },
      industry: industry || null,
      employees_impacted: employeesImpacted || null,
      selected_workflows: selectedWorkflows || [],
      created_at: new Date().toISOString(),
    }).select().single();

    // Generate ROI score for notification
    const roiScore = DiscordWebhookNotificationService.calculateRoiScore(results);

    // Send instant Discord notification
    try {
      await discordWebhookNotifications.roiAssessment({
        id: roiData?.id?.toString() || `roi_${Date.now()}`,
        email,
        score: roiScore,
        company: industry,
        industry,
        netBenefit: results.netBenefitPerMonth,
        roi: results.roiPercent,
        paybackMonths: results.paybackMonths,
      });
    } catch (webhookError) {
      console.error("Discord notification failed:", webhookError);
      // Continue processing even if notification fails
    }

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB fails - we still want to send notification
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: "Novique.ai <notifications@novique.ai>",
        to: "mark@novique.ai",
        subject: "New ROI Calculator Lead",
        html: `
          <h2>New ROI Calculator Submission</h2>
          <p><strong>Email:</strong> ${email}</p>
          <h3>Calculated Results:</h3>
          <ul>
            <li><strong>Net Monthly Benefit:</strong> $${results.netBenefitPerMonth?.toLocaleString() || "N/A"}</li>
            <li><strong>ROI:</strong> ${results.roiPercent?.toLocaleString() || "N/A"}%</li>
            <li><strong>Payback Period:</strong> ${results.paybackMonths?.toFixed(1) || "N/A"} months</li>
            <li><strong>Hours Saved/Month:</strong> ${results.hoursSavedPerMonth?.toFixed(1) || "N/A"}</li>
            <li><strong>Labor Savings:</strong> $${results.laborSavingsPerMonth?.toLocaleString() || "N/A"}/mo</li>
            <li><strong>Error Savings:</strong> $${results.errorSavingsPerMonth?.toLocaleString() || "N/A"}/mo</li>
            <li><strong>Revenue Uplift:</strong> $${results.revenueUpliftPerMonth?.toLocaleString() || "N/A"}/mo</li>
          </ul>
          <p><em>Submitted: ${new Date().toLocaleString()}</em></p>
        `,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Continue even if email fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ROI submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
