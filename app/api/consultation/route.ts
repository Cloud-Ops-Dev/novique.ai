import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      businessType,
      businessSize,
      preferredDate,
      preferredTime,
      meetingType,
      challenges,
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !challenges) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Novique.ai Consultation <onboarding@resend.dev>", // Will use Resend's test domain initially
      to: process.env.CONSULTATION_EMAIL || "your-email@example.com", // Your email address
      subject: `New Consultation Booking - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e40af 0%, #0891b2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #1e40af; display: block; margin-bottom: 5px; }
              .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
              .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">🗓️ New Consultation Request</h2>
              </div>

              <div class="content">
                <div class="field">
                  <span class="label">Name:</span>
                  <div class="value">${name}</div>
                </div>

                <div class="field">
                  <span class="label">Email:</span>
                  <div class="value"><a href="mailto:${email}">${email}</a></div>
                </div>

                <div class="field">
                  <span class="label">Phone:</span>
                  <div class="value"><a href="tel:${phone}">${phone}</a></div>
                </div>

                <div class="field">
                  <span class="label">Business Type:</span>
                  <div class="value">${businessType}</div>
                </div>

                <div class="field">
                  <span class="label">Business Size:</span>
                  <div class="value">${businessSize}</div>
                </div>

                <div class="field">
                  <span class="label">Preferred Date:</span>
                  <div class="value">${preferredDate}</div>
                </div>

                <div class="field">
                  <span class="label">Preferred Time:</span>
                  <div class="value">${preferredTime}</div>
                </div>

                <div class="field">
                  <span class="label">Meeting Type:</span>
                  <div class="value">${meetingType}</div>
                </div>

                <div class="field">
                  <span class="label">Challenges:</span>
                  <div class="value">${challenges}</div>
                </div>
              </div>

              <div class="footer">
                <p>Received from novique.ai consultation form</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, messageId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
