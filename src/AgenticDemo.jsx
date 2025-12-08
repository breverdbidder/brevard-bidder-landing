// BrevardBidderAI Agentic UI Demo - Working Version
// Split-screen with visual map and interactive features
// Author: Ariel Shapira, Everest Capital USA

import React, { useState } from 'react';

// Demo properties with Brevard County locations
const DEMO_PROPERTIES = [
  { id: 1, address: '123 Ocean Blvd', city: 'Melbourne', zip: '32901', lat: 28.08, lng: -80.61, case_number: '05-2024-CA-012345', recommendation: 'BID', ml_score: 87, max_bid: 142000, judgment_amount: 189000, arv: 285000, repairs: 35000, sale_date: 'Dec 17, 2024', photo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
  { id: 2, address: '456 Palm Dr', city: 'Satellite Beach', zip: '32937', lat: 28.18, lng: -80.59, case_number: '05-2024-CA-012346', recommendation: 'REVIEW', ml_score: 65, max_bid: 98000, judgment_amount: 145000, arv: 220000, repairs: 50000, sale_date: 'Dec 17, 2024', photo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
  { id: 3, address: '789 Riverside Ave', city: 'Cocoa', zip: '32922', lat: 28.39, lng: -80.74, case_number: '05-2024-CA-012347', recommendation: 'SKIP', ml_score: 34, max_bid: 45000, judgment_amount: 210000, arv: 180000, repairs: 85000, sale_date: 'Dec 17, 2024', senior_lien: true, photo: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400' },
  { id: 4, address: '321 Banana River Dr', city: 'Merritt Island', zip: '32953', lat: 28.36, lng: -80.68, case_number: '05-2024-CA-012348', recommendation: 'BID', ml_score: 91, max_bid: 178000, judgment_amount: 225000, arv: 340000, repairs: 28000, sale_date: 'Dec 17, 2024', photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
  { id: 5, address: '555 Atlantic Ave', city: 'Cocoa Beach', zip: '32931', lat: 28.32, lng: -80.61, case_number: '05-2024-CA-012349', recommendation: 'BID', ml_score: 78, max_bid: 165000, judgment_amount: 198000, arv: 295000, repairs: 40000, sale_date: 'Dec 17, 2024', photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
  { id: 6, address: '888 Harbor City Blvd', city: 'Melbourne', zip: '32935', lat: 28.12, lng: -80.65, case_number: '05-2024-CA-012350', recommendation: 'REVIEW', ml_score: 58, max_bid: 82000, judgment_amount: 135000, arv: 195000, repairs: 55000, sale_date: 'Dec 17, 2024', photo: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400' },
];

const STATUS_COLORS = { BID: '#10B981', REVIEW: '#F59E0B', SKIP: '#EF4444' };
const PROMPTS = ["Show all BID properties", "Filter ML score > 70", "What liens survive?", "Reset all"];

export default function AgenticDemo() {
  const [properties, setProperties] = useState(DEMO_PROPERTIES);
  const [filtered, setFiltered] = useState(DEMO_PROPERTIES);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Welcome to BrevardBidderAI! 🏠\n\nLoaded ${DEMO_PROPERTIES.length} properties for Dec 17, 2024 auction.\n\nClick markers on the map or try the suggested commands below.` }
  ]);
  const [input, setInput] = useState('');

  const addMsg = (role, content) => setMessages(p => [...p, { role, content }]);

  const handleCmd = (cmd) => {
    if (!cmd.trim()) return;
    addMsg('user', cmd);
    const lower = cmd.toLowerCase();
    
    setTimeout(() => {
      if (lower.includes('bid') && (lower.includes('show') || lower.includes('all'))) {
        const bids = properties.filter(p => p.recommendation === 'BID');
        setFiltered(bids);
        addMsg('assistant', `✅ Found ${bids.length} BID properties:\n\n${bids.map(p => `• ${p.address} (ML: ${p.ml_score})`).join('\n')}`);
      } else if (lower.includes('ml') || lower.includes('score')) {
        const num = parseInt(cmd.match(/\d+/)?.[0]) || 70;
        const high = properties.filter(p => p.ml_score >= num);
        setFiltered(high);
        addMsg('assistant', `📊 ${high.length} properties with ML Score ≥ ${num}:\n\n${high.map(p => `• ${p.address} (${p.ml_score})`).join('\n')}`);
      } else if (lower.includes('lien') || lower.includes('survive')) {
        addMsg('assistant', `⚖️ **Florida Lien Priority:**\n\n• First mortgage → wipes junior liens\n• HOA super-priority → 6 months survive\n• Tax liens → ALWAYS survive\n• Municipal liens → often survive\n\n⚠️ Property at 789 Riverside has senior lien risk!`);
      } else if (lower.includes('reset') || lower.includes('all prop')) {
        setFiltered(properties);
        addMsg('assistant', `🔄 Showing all ${properties.length} properties.`);
      } else {
        addMsg('assistant', `Try these commands:\n• "Show all BID properties"\n• "Filter ML score > 80"\n• "What liens survive?"\n• "Reset all"`);
      }
    }, 300);
    setInput('');
  };

  // Convert lat/lng to map position (simple projection for demo)
  const toPos = (lat, lng) => ({
    top: `${100 - ((lat - 28.0) / 0.5) * 100}%`,
    left: `${((lng + 80.8) / 0.3) * 100}%`
  });

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      {/* LEFT: Chat Panel */}
      <div style={{ width: '320px', minWidth: '280px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>B</div>
          <div>
            <div style={{ fontWeight: '600' }}>BrevardBidderAI</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Agentic AI Copilot</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '85%', 
                padding: '10px 14px', 
                borderRadius: '12px', 
                fontSize: '14px', 
                whiteSpace: 'pre-wrap',
                background: m.role === 'user' ? '#2563eb' : '#1e293b',
                lineHeight: '1.5'
              }}>{m.content}</div>
            </div>
          ))}
        </div>

        {/* Prompts */}
        <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PROMPTS.map((p, i) => (
            <button key={i} onClick={() => handleCmd(p)} style={{ 
              fontSize: '11px', 
              padding: '6px 12px', 
              background: '#1e293b', 
              border: 'none', 
              borderRadius: '20px', 
              color: '#94a3b8', 
              cursor: 'pointer' 
            }}>{p}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '16px', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCmd(input)}
            placeholder="Ask about foreclosures..."
            style={{ flex: 1, background: '#1e293b', border: 'none', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px' }}
          />
          <button onClick={() => handleCmd(input)} style={{ 
            background: '#10B981', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '0 16px', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '18px'
          }}>→</button>
        </div>
      </div>

      {/* RIGHT: Map Area */}
      <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(135deg, #0c1929 0%, #1a2744 50%, #0f172a 100%)' }}>
        {/* Map Grid Background */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(100,150,200,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        {/* Brevard County Outline (simplified) */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M60,10 L75,15 L80,30 L78,50 L72,70 L65,85 L55,90 L45,85 L40,70 L38,50 L42,30 L50,15 Z" 
                fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          <text x="58" y="50" fill="#3b82f6" fontSize="3" fontFamily="sans-serif">BREVARD</text>
          <text x="60" y="54" fill="#3b82f6" fontSize="2" fontFamily="sans-serif">COUNTY</text>
        </svg>

        {/* Property Markers */}
        {filtered.map(p => {
          const pos = toPos(p.lat, p.lng);
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                transform: 'translate(-50%, -50%)',
                width: selected?.id === p.id ? '36px' : '28px',
                height: selected?.id === p.id ? '36px' : '28px',
                background: STATUS_COLORS[p.recommendation],
                border: '3px solid white',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: selected?.id === p.id 
                  ? `0 0 0 4px ${STATUS_COLORS[p.recommendation]}40, 0 4px 12px rgba(0,0,0,0.4)`
                  : '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.2s',
                zIndex: selected?.id === p.id ? 20 : 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold'
              }}
            >
              {p.ml_score}
            </button>
          );
        })}

        {/* Legend */}
        <div style={{ 
          position: 'absolute', 
          bottom: '16px', 
          left: '16px', 
          background: 'rgba(15,23,42,0.95)', 
          padding: '12px 16px', 
          borderRadius: '12px',
          backdropFilter: 'blur(8px)',
          border: '1px solid #334155'
        }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Recommendation</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                <span style={{ fontSize: '12px' }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>{filtered.length} properties • Dec 17 Auction</div>
        </div>

        {/* Reset Button */}
        <button 
          onClick={() => { setFiltered(properties); setSelected(null); }}
          style={{ 
            position: 'absolute', 
            top: '16px', 
            left: '16px', 
            background: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >🔄 Reset View</button>

        {/* Property Drawer */}
        {selected && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: '340px',
            background: '#0f172a',
            borderLeft: '1px solid #334155',
            overflow: 'auto',
            animation: 'slideIn 0.3s ease'
          }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ 
                  background: STATUS_COLORS[selected.recommendation], 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: '600' 
                }}>{selected.recommendation}</span>
                <button onClick={() => setSelected(null)} style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  lineHeight: 1
                }}>×</button>
              </div>
              <h2 style={{ margin: '12px 0 4px', fontSize: '18px', fontWeight: '600' }}>{selected.address}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{selected.city}, FL {selected.zip}</p>
            </div>

            {/* Photo */}
            <img src={selected.photo} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />

            {/* Metrics Grid */}
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'ML Score', value: selected.ml_score, color: '#10B981' },
                { label: 'Max Bid', value: `$${selected.max_bid.toLocaleString()}` },
                { label: 'Judgment', value: `$${selected.judgment_amount.toLocaleString()}` },
                { label: 'ARV', value: `$${selected.arv.toLocaleString()}` },
                { label: 'Repairs', value: `$${selected.repairs.toLocaleString()}` },
                { label: 'Auction', value: selected.sale_date },
              ].map((m, i) => (
                <div key={i} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: m.color || 'white', fontFamily: 'monospace' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Senior Lien Warning */}
            {selected.senior_lien && (
              <div style={{ margin: '0 16px 16px', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                ⚠️ Senior lien survives foreclosure - High Risk!
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#10B981', 
                border: 'none', 
                borderRadius: '8px', 
                color: 'white', 
                fontWeight: '600',
                cursor: 'pointer'
              }}>📄 Generate DOCX Report</button>
              <button 
                onClick={() => addMsg('assistant', `📊 **${selected.address}**\n\nML Score: ${selected.ml_score}/100\nMax Bid: $${selected.max_bid.toLocaleString()}\nJudgment: $${selected.judgment_amount.toLocaleString()}\nARV: $${selected.arv.toLocaleString()}\n\n${selected.senior_lien ? '⚠️ WARNING: Senior lien survives!' : '✅ Title appears clear'}\n\nRecommendation: **${selected.recommendation}**`)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: '8px', 
                  color: 'white',
                  cursor: 'pointer'
                }}>💬 Analyze in Chat</button>
            </div>

            {/* Case Info */}
            <div style={{ padding: '16px', borderTop: '1px solid #334155', fontSize: '13px', color: '#64748b' }}>
              <div>Case #: {selected.case_number}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
