/**
 * CORS Helper for API Routes
 * Provides consistent CORS headers for all API endpoints
 */

export function getCorsHeaders(origin?: string): Headers {
  const headers = new Headers();
  
  // In production, use specific domain; in development, allow all
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? 'https://hpsb.netlify.app'  // Your production Netlify domain
    : origin || '*';
    
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  headers.set('Access-Control-Allow-Credentials', 'true');
  
  return headers;
}

export function addCorsHeaders(response: Response, origin?: string): Response {
  const headers = getCorsHeaders(origin);
  
  // Copy existing headers
  response.headers.forEach((value, key) => {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  });
  
  // Set the CORS headers
  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export function createCorsResponse(data: any, options: { status?: number, origin?: string } = {}) {
  const { status = 200, origin } = options;
  const headers = getCorsHeaders(origin);
  headers.set('Content-Type', 'application/json');
  
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

export function createOptionsResponse(origin?: string) {
  const headers = getCorsHeaders(origin);
  
  return new Response(null, {
    status: 200,
    headers
  });
}