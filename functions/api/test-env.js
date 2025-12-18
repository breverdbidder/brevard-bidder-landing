export async function onRequest(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    hasServiceKey: !!env.SUPABASE_SERVICE_KEY,
    hasUrl: !!env.SUPABASE_URL,
    url: env.SUPABASE_URL || 'not set',
    keyLength: env.SUPABASE_SERVICE_KEY ? env.SUPABASE_SERVICE_KEY.length : 0,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
