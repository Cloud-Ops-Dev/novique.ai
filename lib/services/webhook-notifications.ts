/**
 * Webhook notification service for real-time Jarvis alerts
 * Sends instant notifications to Discord, Desktop, and Laptop when customers interact with forms
 */

interface WebhookResponse {
  success: boolean;
  error?: string;
}

interface ConsultationWebhookData {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  businessType?: string;
  businessSize?: string;
  meetingType?: string;
  challenges?: string;
}

interface RoiAssessmentWebhookData {
  id: string;
  name?: string;
  email: string;
  score?: number;
  company?: string;
  industry?: string;
  netBenefit?: number;
  roi?: number;
  paybackMonths?: number;
}

interface EmailWebhookData {
  id: string;
  from: string;
  subject: string;
  mailbox?: string;
}

interface SmsWebhookData {
  id: string;
  from: string;
  body: string;
}

interface VoicemailWebhookData {
  id: string;
  from: string;
  duration?: number;
}

class WebhookNotificationService {
  private webhookUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor() {
    this.webhookUrl = process.env.WEBHOOK_URL || 'http://127.0.0.1:3001';
    this.apiKey = process.env.WEBHOOK_API_KEY;
    this.timeout = parseInt(process.env.WEBHOOK_TIMEOUT || '10000');
  }

  /**
   * Send consultation request notification
   */
  async consultationRequest(data: ConsultationWebhookData): Promise<WebhookResponse> {
    const webhookData = {
      id: data.id,
      name: data.name,
      email: data.email,
      company: data.company || data.businessType, // Use businessType as company if no specific company
      phone: data.phone,
      meeting_type: data.meetingType,
      challenges: data.challenges,
    };

    return this.sendWebhook('/webhook/consultation', webhookData);
  }

  /**
   * Send ROI assessment notification with calculated score
   */
  async roiAssessment(data: RoiAssessmentWebhookData): Promise<WebhookResponse> {
    const webhookData = {
      id: data.id,
      name: data.name || data.email.split('@')[0], // Use email username if no name provided
      email: data.email,
      score: data.score,
      company: data.company || data.industry,
      net_benefit: data.netBenefit,
      roi_percent: data.roi,
      payback_months: data.paybackMonths,
    };

    return this.sendWebhook('/webhook/roi-assessment', webhookData);
  }

  /**
   * Send email notification
   */
  async emailNotification(data: EmailWebhookData): Promise<WebhookResponse> {
    const webhookData = {
      id: data.id,
      from: data.from,
      subject: data.subject,
      mailbox: data.mailbox,
    };

    return this.sendWebhook('/webhook/email', webhookData);
  }

  /**
   * Send SMS notification
   */
  async smsNotification(data: { id: string; from: string; body: string }): Promise<WebhookResponse> {
    const webhookData = {
      id: data.id,
      from: data.from,
      body: data.body,
    };

    return this.sendWebhook('/webhook/sms', webhookData);
  }

  /**
   * Send voicemail notification
   */
  async voicemailNotification(data: { id: string; from: string; duration?: number }): Promise<WebhookResponse> {
    const webhookData = {
      id: data.id,
      from: data.from,
      duration: data.duration,
    };

    return this.sendWebhook('/webhook/voicemail', webhookData);
  }

  /**
   * Test webhook connectivity
   */
  async test(): Promise<WebhookResponse> {
    const testData = {
      test: 'Next.js integration test',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    return this.sendWebhook('/webhook/test', testData);
  }

  /**
   * Send webhook request
   */
  private async sendWebhook(endpoint: string, data: Record<string, any>): Promise<WebhookResponse> {
    try {
      const url = this.webhookUrl + endpoint;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key if configured
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      console.log('📡 Sending Jarvis webhook:', { endpoint, data: { ...data, email: data.email ? '[REDACTED]' : undefined } });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Jarvis webhook sent successfully:', { endpoint, response: responseData });
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('❌ Jarvis webhook failed:', { 
          endpoint, 
          status: response.status, 
          statusText: response.statusText,
          error: errorText 
        });
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}` 
        };
      }

    } catch (error: any) {
      // Don't log full error details to avoid exposing sensitive information
      const errorMessage = error.name === 'AbortError' 
        ? 'Webhook timeout' 
        : 'Network error';

      console.error('⚠️ Jarvis webhook exception:', { 
        endpoint, 
        error: errorMessage,
        type: error.name 
      });

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * Calculate ROI score for webhook notification
   * This is a simplified scoring algorithm based on calculated ROI metrics
   */
  static calculateRoiScore(results: any): number {
    try {
      const { roiPercent, paybackMonths, netBenefitPerMonth } = results;
      
      let score = 0;

      // ROI Percentage (40% of score)
      if (roiPercent >= 300) score += 40;
      else if (roiPercent >= 200) score += 30;
      else if (roiPercent >= 100) score += 20;
      else if (roiPercent >= 50) score += 10;

      // Payback Period (30% of score) - shorter is better
      if (paybackMonths <= 3) score += 30;
      else if (paybackMonths <= 6) score += 25;
      else if (paybackMonths <= 12) score += 20;
      else if (paybackMonths <= 24) score += 10;

      // Net Monthly Benefit (30% of score)
      if (netBenefitPerMonth >= 10000) score += 30;
      else if (netBenefitPerMonth >= 5000) score += 25;
      else if (netBenefitPerMonth >= 2500) score += 20;
      else if (netBenefitPerMonth >= 1000) score += 15;
      else if (netBenefitPerMonth >= 500) score += 10;

      return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
    } catch (error) {
      console.error('Error calculating ROI score:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const webhookNotifications = new WebhookNotificationService();

// Export class for testing
export { WebhookNotificationService };

export type { 
  ConsultationWebhookData, 
  RoiAssessmentWebhookData, 
  EmailWebhookData,
  SmsWebhookData,
  VoicemailWebhookData, 
  WebhookResponse 
};