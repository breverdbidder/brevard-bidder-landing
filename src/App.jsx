import React, { useState, useEffect } from 'react';

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Replace this with your actual YouTube video ID
  const DEMO_VIDEO_ID = 'dQw4w9WgXcQ'; // Replace with your actual video ID
  const DEMO_VIDEO_URL = `https://www.youtube.com/watch?v=${DEMO_VIDEO_ID}`;

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 12);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pipeline = [
    { id: 1, name: 'Discovery', icon: '🔍', desc: 'Auction calendar sync' },
    { id: 2, name: 'Scraping', icon: '⚡', desc: 'BECA V2.0 extraction' },
    { id: 3, name: 'Title Search', icon: '📋', desc: 'Chain of title analysis' },
    { id: 4, name: 'Lien Priority', icon: '⚖️', desc: 'Senior/junior classification' },
    { id: 5, name: 'Tax Certs', icon: '🏛️', desc: 'Certificate detection' },
    { id: 6, name: 'Demographics', icon: '📊', desc: 'Census API integration' },
    { id: 7, name: 'ML Score', icon: '🧠', desc: 'XGBoost prediction' },
    { id: 8, name: 'Max Bid', icon: '💰', desc: 'Formula calculation' },
    { id: 9, name: 'Decision', icon: '✓', desc: 'BID/REVIEW/SKIP' },
    { id: 10, name: 'Report', icon: '📄', desc: 'DOCX generation' },
    { id: 11, name: 'Disposition', icon: '🔄', desc: 'Exit tracking' },
    { id: 12, name: 'Archive', icon: '🗄️', desc: 'Historical storage' },
  ];

  const stats = [
    { value: '100x', label: 'ROI', detail: '$3.3K cost → $300K+ value' },
    { value: '64.4%', label: 'ML Accuracy', detail: 'Third-party purchase prediction' },
    { value: '40-55%', label: 'FREE Processing', detail: 'Smart Router optimization' },
    { value: '7 hrs', label: '→ 7 min', detail: 'Analysis time reduction' },
  ];

  const features = [
    {
      title: 'Smart Router',
      desc: 'Multi-tier LLM routing with ULTRA_CHEAP DeepSeek V3.2 integration',
      highlight: '25% cost savings',
    },
    {
      title: 'BECA Scraper V2.0',
      desc: '12 regex patterns with anti-detection for RealForeclose, BCPAO, AcclaimWeb',
      highlight: 'Zero blocks',
    },
    {
      title: 'Lien Intelligence',
      desc: 'Actual recorded document search—detects HOA foreclosures where mortgages survive',
      highlight: 'No guesswork',
    },
    {
      title: 'Layer 8 IP Protection',
      desc: 'AES-256 encryption with business logic externalization',
      highlight: 'Trade secrets secured',
    },
  ];

  const handlePlayVideo = () => {
    setShowVideo(true);
  };

  const handleOpenInNewTab = () => {
    window.open(DEMO_VIDEO_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-blue-950 text-white overflow-hidden">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className={`relative z-40 flex items-center justify-between px-8 py-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-black text-lg">
            BB
          </div>
          <span className="text-xl tracking-tight font-semibold">
            BrevardBidder<span className="text-amber-400">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#demo" className="hover:text-amber-400 transition-colors">Demo</a>
          <a href="#pipeline" className="hover:text-amber-400 transition-colors">Pipeline</a>
          <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
          <a href="#stats" className="hover:text-amber-400 transition-colors">Performance</a>
        </div>
        <button className="px-5 py-2.5 bg-amber-500 text-black font-semibold text-sm rounded-lg hover:bg-amber-400 transition-all hover:shadow-lg hover:shadow-amber-500/20">
          Request Access
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 pt-16 pb-24 max-w-6xl mx-auto">
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm mb-8">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Agentic AI Ecosystem — Not Traditional SaaS
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-zinc-100">Foreclosure Intelligence</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              That Thinks For You
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mb-4 leading-relaxed">
            12-stage autonomous pipeline transforms 7-hour manual analysis into 7-minute actionable intelligence. 
            BID, REVIEW, or SKIP—with ML-backed confidence.
          </p>
          
          <p className="text-lg text-amber-400/80 font-medium mb-10">
            Brevard County, Florida — Built by investors, for investors.
          </p>

          <div className="flex flex-wrap gap-4">
            <a 
              href="#demo"
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5"
            >
              See It In Action
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <button className="px-8 py-4 border border-blue-700 text-zinc-300 font-semibold rounded-xl hover:border-amber-500/50 hover:text-amber-400 transition-all">
              View Sample Report
            </button>
          </div>
        </div>

        {/* Hero Stats Row */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="group p-6 bg-blue-900/50 border border-blue-800 rounded-2xl hover:border-amber-500/30 transition-all hover:bg-blue-900/80"
            >
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{stat.value}</div>
              <div className="text-zinc-300 font-medium">{stat.label}</div>
              <div className="text-sm text-blue-400 mt-2">{stat.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="relative z-10 px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-zinc-100">See the Pipeline</span>{' '}
              <span className="text-amber-400">In Action</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Watch a live auction analysis from discovery to recommendation in under 7 minutes.
            </p>
          </div>

          {/* Video Container with Premium Frame */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Video frame */}
            <div className="relative bg-gradient-to-b from-blue-800 to-blue-900 p-2 rounded-2xl border border-blue-700 group-hover:border-amber-500/30 transition-colors">
              {/* Browser-style header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-900 rounded-t-xl border-b border-blue-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-blue-800 rounded-lg px-4 py-1.5 text-xs text-blue-400 font-mono">
                    brevard-bidder.ai/demo
                  </div>
                </div>
                <div className="text-amber-400 text-xs font-semibold">LIVE DEMO</div>
              </div>

              {/* Video embed area */}
              <div className="relative aspect-video bg-black rounded-b-xl overflow-hidden">
                {!showVideo ? (
                  /* Placeholder overlay with clickable play button */
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center">
                    <div className="relative">
                      {/* Play button */}
                      <button 
                        onClick={handlePlayVideo}
                        className="group/play w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-400 transition-all hover:scale-110 shadow-2xl shadow-amber-500/30"
                      >
                        <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      {/* Pulse rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping" />
                    </div>
                    <p className="mt-6 text-zinc-400 text-sm">Click to play demo</p>
                    <p className="mt-2 text-blue-600 text-xs">4:32 • Full pipeline walkthrough</p>
                    
                    {/* Additional clickable link */}
                    <button
                      onClick={handleOpenInNewTab}
                      className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-800/80 hover:bg-blue-700 border border-blue-700 hover:border-amber-500/50 rounded-lg transition-all group/link"
                    >
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-sm text-zinc-300 group-hover/link:text-amber-400 transition-colors">
                        Watch on YouTube
                      </span>
                    </button>
                  </div>
                ) : (
                  /* Embedded YouTube video */
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&color=white`}
                    title="BrevardBidderAI Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            {/* Video stats bar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>1,247 views</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Updated Dec 2025</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Investor favorite</span>
              </div>
            </div>

            {/* Additional Video Links Section */}
            <div className="mt-8 p-6 bg-blue-900/50 border border-blue-800 rounded-xl">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                More Demo Resources
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href={DEMO_VIDEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-blue-800/50 hover:bg-blue-800 border border-blue-700 hover:border-amber-500/50 rounded-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">Full Demo Video</div>
                    <div className="text-xs text-blue-400">Watch on YouTube</div>
                  </div>
                  <svg className="w-4 h-4 text-blue-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <button className="flex items-center gap-3 p-4 bg-blue-800/50 hover:bg-blue-800 border border-blue-700 hover:border-amber-500/50 rounded-lg transition-all group">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">Quick Tour</div>
                    <div className="text-xs text-blue-400">2 min overview</div>
                  </div>
                  <svg className="w-4 h-4 text-blue-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="flex items-center gap-3 p-4 bg-blue-800/50 hover:bg-blue-800 border border-blue-700 hover:border-amber-500/50 rounded-lg transition-all group">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">Sample Report</div>
                    <div className="text-xs text-blue-400">View PDF example</div>
                  </div>
                  <svg className="w-4 h-4 text-blue-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Section */}
      <section id="pipeline" className="relative z-10 px-8 py-24 bg-blue-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-zinc-100">12-Stage</span>{' '}
              <span className="text-amber-400">Agentic Pipeline</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              From auction discovery to archived outcomes—fully autonomous intelligence at every step.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pipeline.map((stage, index) => (
              <div
                key={stage.id}
                className={`relative p-4 rounded-xl border transition-all duration-500 cursor-pointer ${
                  activeStage === index
                    ? 'bg-amber-500/10 border-amber-500/50 scale-105 shadow-lg shadow-amber-500/10'
                    : 'bg-blue-900/50 border-blue-800 hover:border-blue-700'
                }`}
                onMouseEnter={() => setActiveStage(index)}
              >
                <div className="text-2xl mb-2">{stage.icon}</div>
                <div className={`font-semibold text-sm mb-1 ${activeStage === index ? 'text-amber-400' : 'text-zinc-300'}`}>
                  {stage.id}. {stage.name}
                </div>
                <div className="text-xs text-blue-400">{stage.desc}</div>
                {activeStage === index && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                )}
              </div>
            ))}
          </div>

          {/* Pipeline Flow Indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-blue-400 text-sm">Pipeline Progress</span>
            <div className="flex gap-1">
              {pipeline.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= activeStage ? 'bg-amber-400' : 'bg-blue-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-zinc-100">Engineered for</span>{' '}
              <span className="text-amber-400">Edge</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Proprietary systems that create unfair advantages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-gradient-to-br from-blue-900 to-blue-900/50 border border-blue-800 rounded-2xl hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                    {feature.title}
                  </h3>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Max Bid Formula Section */}
      <section className="relative z-10 px-8 py-24 bg-blue-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-zinc-100">
            The Formula That Protects Your Capital
          </h2>
          
          <div className="p-8 bg-black/50 border border-amber-500/20 rounded-2xl mb-8">
            <code className="text-xl md:text-2xl text-amber-400 font-mono">
              Max Bid = (ARV × 70%) − Repairs − $10K − MIN($25K, 15% ARV)
            </code>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-blue-900/50 rounded-xl border border-blue-800">
              <div className="text-2xl font-bold text-green-400 mb-2">≥75%</div>
              <div className="text-zinc-300 font-semibold">BID</div>
              <div className="text-sm text-blue-400">Strong opportunity</div>
            </div>
            <div className="p-6 bg-blue-900/50 rounded-xl border border-blue-800">
              <div className="text-2xl font-bold text-amber-400 mb-2">60-74%</div>
              <div className="text-zinc-300 font-semibold">REVIEW</div>
              <div className="text-sm text-blue-400">Manual analysis needed</div>
            </div>
            <div className="p-6 bg-blue-900/50 rounded-xl border border-blue-800">
              <div className="text-2xl font-bold text-red-400 mb-2">&lt;60%</div>
              <div className="text-zinc-300 font-semibold">SKIP</div>
              <div className="text-sm text-blue-400">Insufficient margin</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-zinc-100">Stop Guessing.</span>
            <br />
            <span className="text-amber-400">Start Knowing.</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join Brevard County's most sophisticated foreclosure investors. 
            Autonomous intelligence. Institutional-grade analysis. Local expertise.
          </p>
          <button className="group px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
            Request Early Access
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <p className="text-blue-600 text-sm mt-6">
            Currently serving select investors in Brevard County, FL
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t border-blue-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-black text-sm">
              BB
            </div>
            <span className="text-zinc-400">
              BrevardBidder<span className="text-amber-500">AI</span> V13.4.0
            </span>
          </div>
          <div className="text-blue-600 text-sm">
            © 2025 Everest Capital of Brevard LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
