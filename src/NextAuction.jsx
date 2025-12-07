import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Building2, Clock, ArrowRight, FileText } from 'lucide-react';

const NextAuction = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Dec 10, 2025 at 11:00 AM EST
  const auctionDate = new Date('2025-12-10T11:00:00-05:00');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = auctionDate - now;
      
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const properties = [
    { case: '05-2023-CA-028050', address: '6585 Orchid Ave', city: 'Cocoa', value: '$188,650', rec: 'REVIEW' },
    { case: '05-2023-CA-034443', address: '3680 Big Pine Rd', city: 'Melbourne', value: '$481,390', rec: 'SKIP' },
    { case: '05-2024-CA-040608', address: '150 Delia Ave', city: 'Palm Bay', value: '$258,100', rec: 'REVIEW' },
    { case: '05-2024-CA-050336', address: '729 Hawkins Ave', city: 'Palm Bay', value: '$137,740', rec: 'BID' },
  ];
  
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-medium text-sm">UPCOMING AUCTION</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            December 10, 2025
          </h2>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>11:00 AM EST</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Titusville Courthouse</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>IN-PERSON</span>
            </div>
          </div>
        </div>
        
        {/* Countdown */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { value: countdown.days, label: 'Days' },
            { value: countdown.hours, label: 'Hours' },
            { value: countdown.minutes, label: 'Minutes' },
            { value: countdown.seconds, label: 'Seconds' }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-white">{String(item.value).padStart(2, '0')}</span>
              </div>
              <span className="text-slate-500 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
        
        {/* Property Preview */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Featured Properties</h3>
            <span className="text-slate-400">12 Total Properties</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {properties.map((prop, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{prop.address}</p>
                  <p className="text-slate-400 text-sm">{prop.city} • {prop.value}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  prop.rec === 'BID' ? 'bg-green-500/20 text-green-400' :
                  prop.rec === 'REVIEW' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {prop.rec}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <a 
            href="https://github.com/breverdbidder/brevard-bidder-scraper/actions" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-colors"
          >
            <FileText className="w-5 h-5" />
            Download Full Report
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default NextAuction;
