import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Leaf, Gift, Truck, MapPin, CheckCircle, BarChart3, ShieldCheck,
    ArrowRight, Sparkles, Clock, Navigation, Heart, Award, ArrowUpRight
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Landing() {
    const [session, setSession] = useState(null);

    useEffect(() => {
        try {
            const s = localStorage.getItem('hl_session');
            if (s) setSession(JSON.parse(s));
        } catch (e) {}
    }, []);

    const liveRescues = [
        "⚡ Just now: The Grand Bakery donated 45kg fresh breads to Hope Shelter",
        "🌱 8 mins ago: Volunteer Bhavya completed pickup at Metro Organics",
        "📦 15 mins ago: Skyline Hotel dispatched 120 warm dinner packets",
        "🌍 Impact Alert: 12.4 Tons of carbon emissions prevented to date",
        "🤝 24 mins ago: New NGO Partner 'Feeding Hands' joined the network",
    ];

    return (
        <div className="min-h-screen bg-[#07090E] text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-black relative">
            {/* Dynamic Framer Motion Background */}
            <AnimatedBackground showGrid={true} showParticles={true} />

            {/* Content Container */}
            <div className="relative z-10">

                {/* Navbar */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090E]/70 border-b border-white/[0.08] transition-all">
                    <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
                        {/* Brand Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-all">
                                <Leaf className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-1.5">
                                    SMART FOOD <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">AI v2.4</span>
                                </div>
                                <div className="text-emerald-400 text-[10px] uppercase font-bold tracking-[0.25em]">Redistribution Network</div>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
                            <a href="#features" className="hover:text-emerald-400 transition-colors">AI Features</a>
                            <a href="#join" className="hover:text-emerald-400 transition-colors">Join Movement</a>
                        </nav>

                        {/* Action CTA */}
                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                <span>Network Online • 42 Nodes</span>
                            </div>
                            {session ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={session.role === 'donor' ? '/donor' : session.role === 'volunteer' ? '/volunteer' : session.role === 'ngo' ? '/ngo' : '/dashboard'}
                                        className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#07090E] px-5 py-2 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center gap-1.5"
                                    >
                                        Go to Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('hl_session');
                                            setSession(null);
                                        }}
                                        className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#07090E] px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Live News / Ticker Banner */}
                <div className="border-b border-white/[0.06] bg-emerald-950/20 backdrop-blur-md overflow-hidden py-2.5">
                    <div className="max-w-7xl mx-auto px-6 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                            <Sparkles className="w-3.5 h-3.5" /> Live Activity
                        </div>
                        <div className="overflow-hidden relative w-full">
                            <motion.div
                                className="flex gap-10 whitespace-nowrap text-gray-300 text-xs"
                                animate={{ x: ['0%', '-50%'] }}
                                transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                            >
                                {[...liveRescues, ...liveRescues].map((item, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-2">
                                        <span className="text-emerald-400/60">•</span> {item}
                                    </span>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <main className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-24 flex flex-col lg:flex-row items-center justify-between gap-16">
                    
                    {/* Left Column: Typography & CTAs */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/10 hover:border-emerald-500/40 px-4 py-2 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-md transition-all shadow-inner"
                        >
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            AI-Powered Shelf Life & Zero Waste Logistics Active
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.1]"
                        >
                            Redistribute Food.<br />
                            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                                Feed Communities.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-normal"
                        >
                            Connect surplus food from restaurants, grocers, and events with verified local shelters in real-time. Automated AI dispatch, instant NGO alerts, and verifiable CO₂ reduction.
                        </motion.p>

                        {/* Interactive CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
                        >
                            <Link
                                to="/login"
                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#07090E] px-8 py-4 rounded-2xl font-bold text-base shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Gift className="w-5 h-5 text-[#07090E]" />
                                Donate Surplus Food
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-emerald-500/40 text-white px-8 py-4 rounded-2xl font-bold text-base backdrop-blur-md transition-all flex items-center justify-center gap-2"
                            >
                                <Heart className="w-5 h-5 text-emerald-400" />
                                Partner as NGO / Shelter
                            </Link>
                        </motion.div>

                        {/* Trust Micro-Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>Verified NGOs Only</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>AI Freshness Prediction</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>QR Safety Verified</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Interactive Logistics Radar & Live Dispatch Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="flex-1 w-full max-w-xl relative"
                    >
                        {/* Ambient Card Backlight */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-[2.5rem] blur-2xl opacity-50"></div>

                        {/* Main Glass Showcase Card */}
                        <div className="relative bg-[#0F1420]/80 backdrop-blur-2xl border border-white/[0.12] rounded-[2.5rem] p-7 shadow-2xl overflow-hidden">
                            {/* Card Header */}
                            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span className="text-sm font-bold tracking-wide text-gray-200">LIVE REDISTRIBUTION RADAR</span>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                                    <Navigation className="w-3 h-3" /> Auto-Optimized
                                </span>
                            </div>

                            {/* Simulated Transit Map Visualizer */}
                            <div className="h-64 rounded-2xl bg-[#080B12] border border-white/[0.06] relative overflow-hidden flex items-center justify-center p-6">
                                {/* Radar Concentric Circles */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-40 h-40 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '4s' }}></div>
                                    <div className="w-72 h-72 rounded-full border border-white/[0.04]"></div>
                                    <div className="w-96 h-96 rounded-full border border-emerald-500/10"></div>
                                </div>

                                {/* SVG Delivery Route Curve */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 450 240" fill="none">
                                    <path
                                        d="M 60 180 C 140 60, 310 200, 390 70"
                                        stroke="rgba(52, 211, 153, 0.25)"
                                        strokeWidth="3"
                                        strokeDasharray="6 6"
                                    />
                                    <motion.path
                                        d="M 60 180 C 140 60, 310 200, 390 70"
                                        stroke="#34D399"
                                        strokeWidth="3"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: [0, 1, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </svg>

                                {/* Donor Node (Bottom-Left) */}
                                <motion.div
                                    animate={{ y: [-3, 3, -3] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute left-8 bottom-8 flex flex-col items-center gap-1"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                        <Gift className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-300 bg-[#0F1420]/90 px-2 py-0.5 rounded-md border border-white/10">
                                        Baker's Delight
                                    </span>
                                </motion.div>

                                {/* Active Volunteer / Courier in Transit */}
                                <motion.div
                                    animate={{
                                        x: [-30, 40, -30],
                                        y: [10, -20, 10],
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                    className="relative z-10 flex flex-col items-center gap-1"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/30 border border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                                        <Truck className="w-7 h-7 text-emerald-300" />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                                        Active Delivery: 35 kg
                                    </span>
                                </motion.div>

                                {/* Destination NGO Node (Top-Right) */}
                                <motion.div
                                    animate={{ y: [3, -3, 3] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute right-8 top-8 flex flex-col items-center gap-1"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                        <MapPin className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-300 bg-[#0F1420]/90 px-2 py-0.5 rounded-md border border-white/10">
                                        City Food Relief
                                    </span>
                                </motion.div>
                            </div>

                            {/* Dynamic Micro Info Cards */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/[0.04] border border-white/[0.08] p-3.5 rounded-2xl flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">CO₂ Prevented</p>
                                        <p className="text-base font-bold text-white">87.5 kg eq.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/[0.04] border border-white/[0.08] p-3.5 rounded-2xl flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Freshness AI</p>
                                        <p className="text-base font-bold text-cyan-300">18h Left (Optimal)</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* Intelligent Workflow Section */}
                <section id="how-it-works" className="max-w-7xl mx-auto px-6 md:px-10 py-24 relative">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            Intelligent Flow
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-bold">
                            How Food Moves in <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Minutes</span>
                        </h2>
                        <p className="text-gray-400 text-base">
                            A decentralized, zero-latency pipeline connecting community donors with verified NGOs through smart automation.
                        </p>
                    </div>

                    {/* 4 Workflow Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                step: '01',
                                title: 'Smart Logging',
                                desc: 'Donors upload food details in seconds. Machine learning predicts safe shelf life and sets pickup priority.',
                                icon: <Gift className="w-7 h-7 text-emerald-400" />,
                                highlight: 'AI Shelf-Life'
                            },
                            {
                                step: '02',
                                title: 'Auto-Matching',
                                desc: 'Our algorithms match surplus inventory with nearby verified shelters based on dietary needs and capacity.',
                                icon: <MapPin className="w-7 h-7 text-emerald-400" />,
                                highlight: 'Instant Dispatch'
                            },
                            {
                                step: '03',
                                title: 'Secure Transit',
                                desc: 'Nearby volunteers accept routes, execute temperature checks, and authenticate handoffs with QR verification.',
                                icon: <Truck className="w-7 h-7 text-emerald-400" />,
                                highlight: 'QR Safety Protocol'
                            },
                            {
                                step: '04',
                                title: 'Verifiable Impact',
                                desc: 'Both donor and recipient gain immutable carbon offset tokens, tax documentation, and community reputation.',
                                icon: <BarChart3 className="w-7 h-7 text-emerald-400" />,
                                highlight: 'CO₂ Analytics'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -8 }}
                                className="group relative bg-[#0F1420]/70 backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/50 p-7 rounded-3xl transition-all duration-300 flex flex-col justify-between shadow-xl"
                            >
                                {/* Top Accent Glow */}
                                <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/80 transition-all duration-500"></div>

                                <div>
                                    {/* Card Header with Icon and Step Badge */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                                            {item.icon}
                                        </div>
                                        <span className="text-3xl font-display font-extrabold text-white/20 group-hover:text-emerald-400/40 transition-colors">
                                            {item.step}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold font-display text-white mb-2.5 group-hover:text-emerald-300 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-emerald-400 font-semibold">
                                    <span>{item.highlight}</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* AI & Features Section */}
                <section id="features" className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                    <div className="bg-gradient-to-br from-[#0F1420]/90 to-[#0B0F19]/90 border border-white/[0.1] rounded-[3rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
                            
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold uppercase">
                                    <Sparkles className="w-3.5 h-3.5" /> Core Innovation
                                </div>
                                <h3 className="text-3xl sm:text-4xl font-display font-bold leading-tight">
                                    Built for Speed, Safety & Absolute Transparency
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Every surplus meal is categorized by perishable decay curves, ensuring vulnerable populations receive wholesome food while eliminating liability concerns.
                                </p>
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-base text-white">Perishability AI</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Trained on culinary freshness degradation models. Alerts dispatch teams before food passes safety thresholds.
                                    </p>
                                </div>

                                <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-base text-white">QR Safety Handshake</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Two-sided cryptographic QR scan ensures chain-of-custody confirmation between donor, volunteer, and shelter.
                                    </p>
                                </div>

                                <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-base text-white">ESG Impact Certificates</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Automated compliance reports detailing CO₂ emissions mitigated and tax-deductible donation summaries.
                                    </p>
                                </div>

                                <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                                        <Navigation className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-base text-white">Micro-Hub Logistics</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Smart hyper-local grouping routes deliveries within a 5-mile radius for sub-30-minute turnarounds.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Stats / Impact Counter Section */}
                <section id="impact" className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { num: '850+', label: 'Active Donors', sub: 'Bakeries, Caterers & Stores', icon: <Gift className="w-5 h-5 text-emerald-400" /> },
                            { num: '320+', label: 'Verified NGOs', sub: 'Shelters & Relief Centers', icon: <Heart className="w-5 h-5 text-teal-400" /> },
                            { num: '14,500+', label: 'Meals Delivered', sub: 'Wholesome Food Rescued', icon: <Truck className="w-5 h-5 text-cyan-400" /> },
                            { num: '12.4 Tons', label: 'CO₂ Prevented', sub: 'Methane Landfill Offsets', icon: <BarChart3 className="w-5 h-5 text-emerald-400" /> }
                        ].map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-[#0F1420]/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-3xl text-center relative overflow-hidden group hover:border-emerald-500/40 transition-all"
                            >
                                <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl lg:text-4xl font-display font-extrabold text-white mb-1 tracking-tight group-hover:text-emerald-300 transition-colors">
                                    {stat.num}
                                </div>
                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-[11px] text-gray-400">
                                    {stat.sub}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Call To Action Banner */}
                <section id="join" className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                    <div className="relative rounded-[3rem] p-10 md:p-16 text-center overflow-hidden border border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.15)] bg-gradient-to-b from-[#0F1420] to-[#080B12]">
                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none"></div>

                        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                                Be Part of the Solution
                            </span>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white leading-tight">
                                Turn Surplus Food into <br />
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                    Life-Saving Meals Today.
                                </span>
                            </h2>
                            <p className="text-gray-300 text-base md:text-lg max-w-xl mx-auto">
                                Join hundreds of businesses, non-profits, and volunteers building a zero-hunger, zero-waste future.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/login"
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#07090E] px-9 py-4 rounded-2xl font-bold text-base shadow-[0_0_35px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white px-8 py-4 rounded-2xl font-bold text-base backdrop-blur-md transition-all flex items-center justify-center gap-2"
                                >
                                    Login to Portal
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/[0.08] bg-[#05070B] py-12">
                    <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <Leaf className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-gray-300 font-bold font-display text-sm">SMART FOOD REDISTRIBUTION</span>
                        </div>
                        <div className="flex gap-8 text-gray-400 font-medium">
                            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
                            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
                            <a href="#impact" className="hover:text-emerald-400 transition-colors">Impact Analytics</a>
                            <Link to="/login" className="hover:text-emerald-400 transition-colors">Partner Portal</Link>
                        </div>
                        <p>© {new Date().getFullYear()} Smart Food Redistribution Network. All rights reserved.</p>
                    </div>
                </footer>

            </div>
        </div>
    );
}
