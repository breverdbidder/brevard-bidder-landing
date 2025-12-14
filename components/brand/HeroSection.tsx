import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * BidDeed.AI Hero Section
 * Demonstrates brand theme: Navy primary, Orange accent, Teal secondary
 */
export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-navy-overlay opacity-95" />
      
      {/* Decorative teal glow */}
      <div 
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'hsl(166 84% 63% / 0.15)' }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <Badge 
            variant="secondary" 
            className="animate-pulse-teal px-4 py-1.5 text-sm font-medium"
          >
            🚀 Agentic AI Ecosystem
          </Badge>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Foreclosure Intelligence
            <span className="block text-brand-gradient mt-2">
              Powered by AI
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            BidDeed.AI analyzes Brevard County foreclosure auctions with 
            ML-powered predictions, automated lien discovery, and 
            institutional-grade due diligence.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-cta-gradient glow-orange hover:opacity-90 text-white font-semibold px-8"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-navy-400 text-white hover:bg-navy-800/50"
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-navy-700/50 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-300">64.4%</div>
              <div className="text-sm text-muted-foreground">ML Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">12</div>
              <div className="text-sm text-muted-foreground">Pipeline Stages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-300">100x</div>
              <div className="text-sm text-muted-foreground">ROI</div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

/**
 * Feature Card - Navy background with teal/orange accents
 */
export function FeatureCard({ 
  title, 
  description, 
  icon,
  accentColor = 'teal' 
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: 'teal' | 'orange';
}) {
  return (
    <div className="group relative bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300">
      {/* Icon with accent glow */}
      <div className={`
        inline-flex p-3 rounded-lg mb-4
        ${accentColor === 'teal' 
          ? 'bg-teal-300/10 text-teal-300 group-hover:glow-teal' 
          : 'bg-orange-500/10 text-orange-400 group-hover:glow-orange'
        }
        transition-all duration-300
      `}>
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/**
 * Status Badge variants for auction recommendations
 */
export function AuctionBadge({ status }: { status: 'BID' | 'REVIEW' | 'SKIP' }) {
  const variants = {
    BID: 'bg-teal-300/20 text-teal-300 border-teal-300/30',
    REVIEW: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    SKIP: 'bg-muted text-muted-foreground border-border',
  };
  
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
      ${variants[status]}
    `}>
      {status}
    </span>
  );
}
