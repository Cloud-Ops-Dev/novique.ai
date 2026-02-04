import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';
import OpenAI from 'openai';

/**
 * POST /api/jarvis/voicemails/[id]/transcribe
 * 
 * Transcribe a voicemail using OpenAI Whisper (Jarvis API version)
 * 
 * This endpoint provides the same functionality as the admin panel transcription
 * but uses Jarvis API key authentication instead of session authentication.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate Jarvis API key
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get communication details
    const { data: communication, error } = await supabase
      .from('communications')
      .select('recording_url, type, transcription_status, body')
      .eq('id', id)
      .single();

    if (error || !communication) {
      return NextResponse.json(
        { error: 'Communication not found' },
        { status: 404 }
      );
    }

    if (communication.type !== 'voicemail') {
      return NextResponse.json(
        { error: 'Can only transcribe voicemails' },
        { status: 400 }
      );
    }

    if (!communication.recording_url) {
      return NextResponse.json(
        { error: 'No recording available' },
        { status: 404 }
      );
    }

    // Check if already transcribed
    if (communication.body && communication.transcription_status === 'completed') {
      return NextResponse.json({
        success: true,
        transcription: communication.body,
        already_transcribed: true,
      });
    }

    // Mark as in_progress
    await supabase
      .from('communications')
      .update({ transcription_status: 'in_progress' })
      .eq('id', id);

    // Get Twilio credentials for fetching audio
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
      await supabase
        .from('communications')
        .update({ transcription_status: 'failed' })
        .eq('id', id);
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }

    // Fetch audio from Twilio
    const audioUrl = `${communication.recording_url}.mp3`;
    const audioResponse = await fetch(audioUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${authUsername}:${authPassword}`).toString('base64')}`,
      },
    });

    if (!audioResponse.ok) {
      await supabase
        .from('communications')
        .update({ transcription_status: 'failed' })
        .eq('id', id);
      return NextResponse.json(
        { error: 'Failed to fetch audio from Twilio' },
        { status: 502 }
      );
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      await supabase
        .from('communications')
        .update({ transcription_status: 'failed' })
        .eq('id', id);
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Convert audio to File for OpenAI
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioFile = new File([audioBuffer], 'voicemail.mp3', {
      type: 'audio/mpeg',
    });

    // Transcribe with OpenAI Whisper
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    // Update database with transcription
    const { error: updateError } = await supabase
      .from('communications')
      .update({
        body: transcription.text,
        transcription_status: 'completed',
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to save transcription:', updateError);
      return NextResponse.json(
        { error: 'Failed to save transcription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      already_transcribed: false,
    });

  } catch (error: any) {
    console.error('Jarvis transcription error:', error);

    // Try to mark as failed
    try {
      const { id } = await params;
      const supabase = createAdminClient();
      await supabase
        .from('communications')
        .update({ transcription_status: 'failed' })
        .eq('id', id);
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}