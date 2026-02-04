import { NextRequest, NextResponse } from 'next/server'
import { webhookNotifications } from '@/lib/services/webhook-notifications'

export async function GET() {
  try {
    // Test webhook connectivity
    const result = await webhookNotifications.test()
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? '✅ Webhook test successful! Check your Discord/Desktop/Laptop for test notification.' 
        : '❌ Webhook test failed. Check webhook server status.',
      error: result.error,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      webhookUrl: process.env.WEBHOOK_URL || 'http://127.0.0.1:3001'
    })
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '❌ Webhook test failed with exception',
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    let result
    switch (type) {
      case 'consultation':
        result = await webhookNotifications.consultationRequest({
          id: `test-consultation-${Date.now()}`,
          name: data.name || 'Test User',
          email: data.email || 'test@example.com',
          company: data.company || 'Test Company',
          phone: data.phone || '+1-555-0123',
          businessType: data.businessType || 'Technology',
          businessSize: data.businessSize || '10-50 employees',
          meetingType: data.meetingType || 'video',
          challenges: data.challenges || 'Testing webhook integration'
        })
        break

      case 'roi':
        result = await webhookNotifications.roiAssessment({
          id: `test-roi-${Date.now()}`,
          email: data.email || 'test@example.com',
          score: data.score || 85,
          company: data.company || 'Test Company',
          industry: data.industry || 'Technology',
          netBenefit: data.netBenefit || 5000,
          roi: data.roi || 250,
          paybackMonths: data.paybackMonths || 4.2
        })
        break

      case 'email':
        result = await webhookNotifications.emailNotification({
          id: `test-email-${Date.now()}`,
          from: data.from || 'test@example.com',
          subject: data.subject || 'Test Email Notification',
          mailbox: data.mailbox || 'test'
        })
        break

      case 'sms':
        result = await webhookNotifications.smsNotification({
          id: `test-sms-${Date.now()}`,
          from: data.from || '+1-555-CUSTOMER',
          body: data.body || 'This is a test SMS message from the webhook integration.'
        })
        break

      case 'voicemail':
        result = await webhookNotifications.voicemailNotification({
          id: `test-voicemail-${Date.now()}`,
          from: data.from || '+1-555-CUSTOMER',
          duration: data.duration || 45
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid test type. Use: consultation, roi, email, sms, or voicemail' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `✅ ${type} webhook test successful!` 
        : `❌ ${type} webhook test failed`,
      error: result.error,
      type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}