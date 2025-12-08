// BrevardBidderAI - Checkpoint API
// Manages session state persistence
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'check';
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (action === 'check') {
      // Get active checkpoints
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/session_checkpoints?status=eq.active&order=priority.desc,updated_at.desc&limit=5`,
        { headers }
      );
      const checkpoints = await response.json();
      
      return new Response(JSON.stringify({
        success: true,
        hasActive: checkpoints.length > 0,
        count: checkpoints.length,
        checkpoints
      }), { headers: corsHeaders });
    }
    
    if (action === 'save' && req.method === 'POST') {
      const body = await req.json();
      const { session_id, task_description, state_json, tool_calls_count, priority } = body;
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/session_checkpoints`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          session_id: session_id || `session_${Date.now()}`,
          task_description,
          state_json,
          tool_calls_count: tool_calls_count || 1,
          priority: priority || 'high',
          status: 'active',
          updated_at: new Date().toISOString()
        })
      });
      
      const result = await response.json();
      return new Response(JSON.stringify({ success: true, checkpoint: result }), { headers: corsHeaders });
    }
    
    if (action === 'complete') {
      const sessionId = url.searchParams.get('session_id');
      if (!sessionId) {
        return new Response(JSON.stringify({ error: 'session_id required' }), { status: 400, headers: corsHeaders });
      }
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/session_checkpoints?session_id=eq.${sessionId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
        }
      );
      
      return new Response(JSON.stringify({ success: true, completed: sessionId }), { headers: corsHeaders });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Invalid action',
      validActions: ['check', 'save', 'complete']
    }), { status: 400, headers: corsHeaders });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}
