import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://hpsb.netlify.app' : '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new Response(null, {
    status: 200,
    headers,
  });
}

export async function GET(request: Request) {
  // Extract origin from request for CORS
  const origin = request.headers.get('origin') || '';

  try {
    const content = await readFile('public/build-info.json', 'utf8');

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://hpsb.netlify.app' : origin || '*');
    headers.set('Content-Type', 'application/json');

    return new Response(content, {
      status: 200,
      headers
    });
  } catch (e) {
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://hpsb.netlify.app' : origin || '*');
    headers.set('Content-Type', 'application/json');

    return new Response(
      JSON.stringify({ error: 'build-info not found', details: String(e) }),
      { status: 404, headers }
    );
  }
}
