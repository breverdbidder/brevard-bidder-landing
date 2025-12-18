// BidDeed.AI - Supabase Proxy Function for Cloudflare Pages
// This function securely proxies requests to Supabase using server-side secrets
// Path: /api/supabase/[...path]

export async function onRequest(context) {
  const { request, env } = context;
  
  // Get Supabase credentials from environment
  const SUPABASE_URL = env.SUPABASE_URL || 'https://mocerqjnksmhcjzxrewo.supabase.co';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY || '';
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
  // Get the path after /api/supabase/
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/supabase', '');
  
  // Build Supabase URL
  const supabaseUrl = `${SUPABASE_URL}/rest/v1${path}${url.search}`;
  
  try {
    // Forward the request to Supabase
    const response = await fetch(supabaseUrl, {
      method: request.method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Data-Source': 'supabase-live',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Supabase connection failed',
      message: error.message,
      fallback: true,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Data-Source': 'error',
      },
    });
  }
}
