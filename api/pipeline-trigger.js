// BrevardBidderAI - LangGraph Pipeline Trigger API
// Triggers GitHub Actions workflow and returns job ID for polling
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = {
  runtime: 'edge',
};

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'breverdbidder/brevard-bidder-scraper';
const WORKFLOW_FILE = 'langgraph_orchestrator.yml';

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { address, city, caseNumber, auctionDate, action = 'single' } = body;

    // Validate inputs
    if (action === 'single' && !address) {
      return new Response(
        JSON.stringify({ error: 'Address required for single property analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'batch' && !auctionDate) {
      return new Response(
        JSON.stringify({ error: 'Auction date required for batch analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!GITHUB_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'GitHub token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build workflow inputs based on action type
    let workflowInputs;
    if (action === 'batch') {
      workflowInputs = {
        action: 'batch',
        auction_date: auctionDate,
        is_auction_day: isAuctionDay(auctionDate).toString(),
      };
    } else {
      workflowInputs = {
        action: 'single',
        address: address,
        city: city || 'Melbourne',
        case_number: caseNumber || '',
        auction_date: auctionDate || getNextAuctionDate(),
        is_auction_day: 'false',
      };
    }

    // Trigger GitHub Actions workflow
    const triggerResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: workflowInputs,
        }),
      }
    );

    if (!triggerResponse.ok && triggerResponse.status !== 204) {
      const error = await triggerResponse.text();
      console.error('GitHub workflow trigger failed:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to trigger pipeline', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Wait a moment for the run to be created
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the run ID of the just-triggered workflow
    const runsResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
        },
      }
    );

    if (!runsResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Pipeline triggered but could not get run ID',
          triggered: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const runsData = await runsResponse.json();
    const latestRun = runsData.workflow_runs?.[0];

    if (!latestRun) {
      return new Response(
        JSON.stringify({ 
          error: 'Pipeline triggered but run not found yet',
          triggered: true,
          retry: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        runId: latestRun.id,
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        htmlUrl: latestRun.html_url,
        createdAt: latestRun.created_at,
        action: action,
        inputs: workflowInputs,
        message: `Pipeline ${action === 'batch' ? 'batch analysis' : 'single property analysis'} triggered successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Pipeline trigger error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper: Check if date is auction day
function isAuctionDay(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

// Helper: Get next auction date
function getNextAuctionDate() {
  const auctions = ['2025-12-17', '2026-01-07', '2026-01-21'];
  const today = new Date().toISOString().split('T')[0];
  return auctions.find(d => d >= today) || auctions[0];
}
