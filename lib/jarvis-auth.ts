/**
 * Jarvis API Authentication
 *
 * Simple API key authentication for Jarvis desktop app to access
 * communications data.
 */

export function validateJarvisApiKey(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  const apiKey = process.env.JARVIS_API_KEY;

  if (!authHeader || !apiKey) {
    return false;
  }

  const providedKey = authHeader.replace('Bearer ', '');
  return providedKey === apiKey;
}

export function unauthorizedResponse() {
  return Response.json(
    { error: 'Unauthorized', message: 'Valid API key required' },
    { status: 401 }
  );
}
