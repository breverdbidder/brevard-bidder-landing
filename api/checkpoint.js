// BidDeed.AI - Checkpoint API
// Manages session state for seamless resume across conversations
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw';

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'list';
  
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // GET: List active checkpoints
    if (req.method === 'GET') {
      if (action === 'list' || action === 'check') {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/session_checkpoints?status=eq.active&order=updated_at.desc&limit=5`,
          { headers }
        );
        const data = await response.json();
        
        return new Response(JSON.stringify({
          success: true,
          count: data.length,
          checkpoints: data,
          message: data.length > 0 ? 'Active checkpoints found - resume available' : 'No active checkpoints'
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }
    
    // POST: Save checkpoint
    if (req.method === 'POST') {
      const body = await req.json();
      const { session_id, task_description, state_json, tool_calls_count, priority } = body;
      
      if (!session_id || !task_description) {
        return new Response(JSON.stringify({ error: 'session_id and task_description required' }), { status: 400 });
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/session_checkpoints`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          session_id,
          task_description,
          state_json: state_json || {},
          tool_calls_count: tool_calls_count || 0,
          priority: priority || 'medium',
          status: 'active',
          updated_at: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Checkpoint saved',
        checkpoint: data
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // PATCH: Complete/update checkpoint
    if (req.method === 'PATCH') {
      const body = await req.json();
      const { session_id, status } = body;
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/session_checkpoints?session_id=eq.${session_id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: status || 'completed',
            completed_at: new Date().toISOString()
          })
        }
      );
      
      return new Response(JSON.stringify({
        success: true,
        message: `Checkpoint ${session_id} marked as ${status || 'completed'}`
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
