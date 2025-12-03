// Premium Hero Section - Obsidian Vault Design
// Elevated luxury fintech aesthetic with dramatic visual presence

import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 }
  }
};

const PremiumHero = ({ heroOpacity, heroScale, heroY, stats, WaitlistForm }) => {
  return (
    <motion.section
      className="relative min-h-screen flex items-center pt-20 pb-16 px-6 overflow-hidden"
      style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
    >
      {/* ===== PREMIUM ANIMATED BACKGROUND LAYERS ===== */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 40%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-60 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.03) 50%, transparent 70%)' }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 60%)' }}
          animate={{ scale: [1, 1.3, 1], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Light beam accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-[60vh] opacity-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(245,158,11,0.6) 30%, rgba(245,158,11,0.6) 70%, transparent)' }} />
        <div className="absolute top-0 right-1/3 w-px h-[50vh] opacity-10" style={{ background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.5) 40%, transparent)' }} />
      </div>

      {/* Diagonal accent lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" preserveAspectRatio="none">
        <line x1="0" y1="100%" x2="100%" y2="0" stroke="url(#goldGrad)" strokeWidth="1" />
        <line x1="20%" y1="100%" x2="100%" y2="20%" stroke="url(#goldGrad)" strokeWidth="0.5" />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content (7 cols) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 relative"
          >
            {/* Premium floating badge */}
            <motion.div variants={fadeInUp} className="mb-10">
              <motion.span
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-semibold relative overflow-hidden group cursor-default"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  boxShadow: '0 0 30px rgba(245,158,11,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br from-amber-400 to-amber-500"></span>
                </span>
                <span className="text-amber-300/90">Agentic AI Ecosystem</span>
                <span className="w-px h-4 bg-amber-500/30" />
                <span className="text-amber-400/70 font-mono text-xs tracking-wider">V13.4.0</span>
              </motion.span>
            </motion.div>

            {/* Premium headline with editorial weight contrast */}
            <motion.h1 variants={fadeInUp} className="mb-8">
              <span className="block text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6rem] font-medium tracking-[-0.04em] leading-[0.9] text-white/90">
                Distressed
              </span>
              <span className="block text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6rem] font-medium tracking-[-0.04em] leading-[0.9] text-white/90">
                Assets.
              </span>
              <motion.span
                className="block text-[4rem] sm:text-[5rem] lg:text-[6rem] xl:text-[7rem] font-bold tracking-[-0.05em] leading-[0.85] mt-2"
                style={{
                  background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 30%, #d97706 60%, #f59e0b 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(245,158,11,0.3))',
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                Decoded.
              </motion.span>
            </motion.h1>

            {/* Mission statement with premium styling */}
            <motion.div variants={fadeInUp} className="mb-8 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-transparent" />
              <p className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                For Everyone. Everywhere.
              </p>
              <p className="text-lg md:text-xl text-blue-300/60 mt-2 font-light italic tracking-wide">
                Democratizing USA distressed asset auctions
              </p>
            </motion.div>

            {/* Value proposition with refined typography */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl lg:text-2xl text-blue-100/50 mb-12 max-w-2xl leading-relaxed font-light"
            >
              12-stage AI pipeline transforms{' '}
              <span className="text-white/90 font-medium">4-hour research</span> into{' '}
              <motion.span
                className="font-semibold relative inline-block"
                style={{ color: '#fbbf24' }}
              >
                23-second intelligence
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.span>.{' '}
              <span className="text-blue-200/70">BID, REVIEW, or SKIP with ML-powered confidence.</span>
            </motion.p>

            {/* CTA Section */}
            <motion.div variants={fadeInUp}>
              <WaitlistForm variant="hero" />
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm"
            >
              <div className="flex items-center gap-2 text-blue-300/50">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AES-256 Encrypted</span>
              </div>
              <div className="w-px h-4 bg-blue-800" />
              <div className="flex items-center gap-2 text-blue-300/50">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>1,393+ Auctions Analyzed</span>
              </div>
              <div className="w-px h-4 bg-blue-800 hidden sm:block" />
              <div className="flex items-center gap-2 text-blue-300/50 hidden sm:flex">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>50+ on waitlist</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Premium Stats Display (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Floating decorative ring */}
            <motion.div
              className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none hidden lg:block"
              style={{
                border: '1px solid rgba(245,158,11,0.15)',
                boxShadow: '0 0 60px rgba(245,158,11,0.05)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full pointer-events-none hidden lg:block"
              style={{ border: '1px dashed rgba(16,185,129,0.2)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            />

            {/* Premium glass card container */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Main stats card with glass effect */}
              <div
                className="relative p-6 sm:p-8 rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.7) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 25px 80px -20px rgba(0,0,0,0.5), 0 0 50px rgba(245,158,11,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                {/* Inner glow */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }}
                />

                {/* Stats header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-blue-300/70 tracking-wide">LIVE METRICS</span>
                  </div>
                  <span className="text-xs font-mono text-blue-500/50 hidden sm:inline">BREVARD COUNTY</span>
                </div>

                {/* Premium stat grid */}
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className={`relative group ${stat.accent ? 'col-span-2 sm:col-span-1' : ''}`}
                    >
                      <div
                        className="relative p-4 sm:p-5 rounded-2xl transition-all duration-500 group-hover:-translate-y-1"
                        style={{
                          background: stat.accent
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(30,41,59,0.4) 100%)',
                          border: `1px solid ${stat.accent ? 'rgba(16,185,129,0.3)' : 'rgba(71,85,105,0.3)'}`,
                          boxShadow: stat.accent
                            ? '0 10px 40px -10px rgba(16,185,129,0.2)'
                            : '0 10px 30px -10px rgba(0,0,0,0.3)',
                        }}
                      >
                        <div
                          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-2"
                          style={{
                            background: stat.accent
                              ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                              : 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: `drop-shadow(0 0 20px ${stat.accent ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'})`,
                          }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-white/90 font-semibold text-sm mb-1">{stat.label}</div>
                        <div className="text-xs text-blue-400/50">{stat.detail}</div>

                        {/* Hover glow */}
                        <div
                          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl ${
                            stat.accent ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Live indicator */}
                <motion.div
                  className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-blue-800/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <motion.div
                      className="flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        boxShadow: '0 0 30px rgba(16,185,129,0.1)',
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(16,185,129,0.1)',
                          '0 0 40px rgba(16,185,129,0.2)',
                          '0 0 20px rgba(16,185,129,0.1)',
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                      </span>
                      <span className="text-emerald-300 font-medium text-xs sm:text-sm tracking-wide">Live in Brevard County</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Floating accent badge */}
              <motion.div
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 10px 40px -10px rgba(245,158,11,0.5)',
                }}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 3 }}
                transition={{ delay: 1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.05, rotate: 0 }}
              >
                <span className="text-black font-bold text-xs sm:text-sm tracking-wide">100x ROI</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Premium scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="flex flex-col items-center gap-3 cursor-pointer group"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="text-xs font-medium text-blue-400/40 tracking-widest uppercase group-hover:text-amber-400/60 transition-colors">
              Explore
            </span>
            <div
              className="w-6 h-10 rounded-full flex justify-center pt-2 group-hover:border-amber-500/50 transition-colors"
              style={{ border: '2px solid rgba(71,85,105,0.5)' }}
            >
              <motion.div
                className="w-1.5 h-3 rounded-full bg-amber-400"
                animate={{
                  y: [0, 12, 0],
                  opacity: [1, 0.3, 1],
                  scale: [1, 0.8, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default PremiumHero;
