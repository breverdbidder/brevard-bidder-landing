// BrevardBidderAI - LangGraph Pipeline Status API
// Polls GitHub Actions workflow status and returns results when complete
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = {
  runtime: 'edge',
};

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'breverdbidder/brevard-bidder-scraper';
const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw';

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get run ID from query params or body
    let runId;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      runId = url.searchParams.get('runId');
    } else {
      const body = await req.json();
      runId = body.runId;
    }

    if (!runId) {
      return new Response(
        JSON.stringify({ error: 'runId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!GITHUB_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'GitHub token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get workflow run status
    const runResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${runId}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
        },
      }
    );

    if (!runResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to get run status', runId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const runData = await runResponse.json();

    // Build response based on status
    const response = {
      runId: runData.id,
      status: runData.status,
      conclusion: runData.conclusion,
      htmlUrl: runData.html_url,
      createdAt: runData.created_at,
      updatedAt: runData.updated_at,
      inProgress: runData.status !== 'completed',
    };

    // If completed, get job details and results
    if (runData.status === 'completed') {
      // Get jobs for step details
      const jobsResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${runId}/jobs`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
          },
        }
      );

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        const job = jobsData.jobs?.[0];
        
        if (job) {
          response.jobId = job.id;
          response.steps = job.steps?.map(s => ({
            name: s.name,
            status: s.status,
            conclusion: s.conclusion,
          }));

          // Try to get logs summary
          const logsResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/actions/jobs/${job.id}/logs`,
            {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
              },
            }
          );

          if (logsResponse.ok) {
            const logsText = await logsResponse.text();
            // Extract key results from logs
            response.logSummary = extractLogSummary(logsText);
          }
        }
      }

      // Fetch results from Supabase if successful
      if (runData.conclusion === 'success') {
        const results = await fetchResults();
        response.results = results;
      }
    }

    // Calculate elapsed time
    const startTime = new Date(runData.created_at);
    const endTime = runData.status === 'completed' 
      ? new Date(runData.updated_at) 
      : new Date();
    response.elapsedSeconds = Math.round((endTime - startTime) / 1000);

    // Estimate remaining time for in-progress runs
    if (response.inProgress) {
      response.estimatedRemainingSeconds = Math.max(0, 180 - response.elapsedSeconds);
      response.progressPercent = Math.min(95, Math.round((response.elapsedSeconds / 180) * 100));
    } else {
      response.progressPercent = 100;
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Pipeline status error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Extract key information from logs
function extractLogSummary(logsText) {
  const summary = {
    properties: 0,
    recommendations: { BID: 0, REVIEW: 0, SKIP: 0 },
    totalJudgment: 0,
    errors: [],
  };

  // Count recommendations
  const bidMatches = logsText.match(/BID/g);
  const reviewMatches = logsText.match(/REVIEW/g);
  const skipMatches = logsText.match(/SKIP/g);
  
  summary.recommendations.BID = bidMatches ? Math.floor(bidMatches.length / 2) : 0;
  summary.recommendations.REVIEW = reviewMatches ? Math.floor(reviewMatches.length / 2) : 0;
  summary.recommendations.SKIP = skipMatches ? Math.floor(skipMatches.length / 2) : 0;
  summary.properties = summary.recommendations.BID + summary.recommendations.REVIEW + summary.recommendations.SKIP;

  // Extract total judgment if present
  const judgmentMatch = logsText.match(/total[_\s]?judgment[:\s]+\$?([\d,]+)/i);
  if (judgmentMatch) {
    summary.totalJudgment = parseInt(judgmentMatch[1].replace(/,/g, ''));
  }

  // Extract errors
  const errorMatches = logsText.match(/error[:\s]+(.+)/gi);
  if (errorMatches) {
    summary.errors = errorMatches.slice(0, 5).map(e => e.substring(0, 100));
  }

  return summary;
}

// Fetch latest results from Supabase
async function fetchResults() {
  try {
    // Get recent auction_results
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/historical_auctions?order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    // Group by recommendation
    const grouped = {
      BID: data.filter(d => d.status === 'BID'),
      REVIEW: data.filter(d => d.status === 'REVIEW'),
      SKIP: data.filter(d => d.status === 'SKIP'),
    };

    return {
      total: data.length,
      grouped,
      properties: data.slice(0, 10).map(p => ({
        caseNumber: p.case_number,
        address: p.address,
        city: p.city,
        finalJudgment: p.final_judgment,
        maxBid: p.max_bid,
        recommendation: p.status,
        mlScore: p.ml_score,
      })),
    };
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }
}
