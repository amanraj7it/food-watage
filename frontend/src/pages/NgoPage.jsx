import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ChefHat, ShieldAlert, Heart, MapPin, Clock,
    CheckCircle, Star, Sparkles, Filter, Users, ArrowRight,
    Utensils, AlertTriangle, Check, BookOpen, ThumbsUp
} from 'lucide-react';

export default function NgoPage({ user, donations = [], onSaveDonations, isEmbedded = false }) {
    const [currentUser, setCurrentUser] = useState(user || null);
    const [localDonations, setLocalDonations] = useState(donations);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [aiRecipeModal, setAiRecipeModal] = useState(null);
    const [ratingModal, setRatingModal] = useState(null);
    const [ratingVal, setRatingVal] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    // Standalone fallback
    useEffect(() => {
        if (!user) {
            const s = localStorage.getItem('hl_session');
            if (!s) {
                window.location.href = '/login';
                return;
            }
            try {
                const parsed = JSON.parse(s);
                if (parsed.role && parsed.role !== 'ngo' && parsed.role !== 'admin') {
                    window.location.href = '/dashboard';
                    return;
                }
                fetch('/api/users')
                    .then(r => r.json())
                    .then(d => {
                        const allUsers = JSON.parse(d.value || '[]');
                        const found = allUsers.find(u => u.id === parsed.userId);
                        if (found) {
                            if (found.role !== 'ngo' && found.role !== 'admin') {
                                window.location.href = '/dashboard';
                                return;
                            }
                            setCurrentUser(found);
                        } else {
                            window.location.href = '/login';
                        }
                    })
                    .catch(() => { window.location.href = '/login'; });
            } catch (e) {
                window.location.href = '/login';
            }
        } else {
            setCurrentUser(user);
        }
    }, [user]);

    useEffect(() => {
        if (donations.length > 0) {
            setLocalDonations(donations);
        } else {
            fetch('/api/donations')
                .then(r => r.json())
                .then(d => setLocalDonations(JSON.parse(d.value || '[]')))
                .catch(() => {});
        }
    }, [donations]);

    const saveDonationsState = async (updated) => {
        setLocalDonations(updated);
        if (onSaveDonations) {
            await onSaveDonations(updated);
        } else {
            try {
                await fetch('/api/donations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: JSON.stringify(updated) })
                });
            } catch (err) {}
        }
    };

    // Accept donation for the shelter
    const handleAcceptDonation = async (donationId) => {
        const donation = localDonations.find(d => d.id === donationId);
        if (!donation) return;

        const updated = localDonations.map(d =>
            d.id === donationId
                ? {
                      ...d,
                      status: 'accepted',
                      ngoId: currentUser?.id || 'ngo_demo_1',
                      ngoName: currentUser?.name || 'Hope Horizon Shelter',
                      acceptedAt: new Date().toISOString()
                  }
                : d
        );

        await saveDonationsState(updated);
        setToastMessage(`Accepted ${donation.foodName}! Volunteer couriers notified.`);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // Submit rating for delivered surplus
    const handleSubmitRating = async () => {
        if (!ratingModal) return;
        const updated = localDonations.map(d =>
            d.id === ratingModal.id
                ? {
                      ...d,
                      feedback: {
                          rating: ratingVal,
                          comment: ratingComment || 'Excellent freshness and packaging.'
                      }
                  }
                : d
        );

        await saveDonationsState(updated);
        setRatingModal(null);
        setToastMessage('Quality feedback logged! Thank you for upholding safety standards.');
        setTimeout(() => setToastMessage(''), 4000);
    };

    // Calculations
    const acceptedByMe = localDonations.filter(d => d.ngoId === currentUser?.id || (!d.ngoId && currentUser?.id === 'ngo_demo_1'));
    const deliveredToMe = acceptedByMe.filter(d => d.status === 'delivered');
    const incomingDeliveries = acceptedByMe.filter(d => d.status === 'assigned' || d.status === 'pickedUp' || d.status === 'onTheWay');
    const availableSurplus = localDonations.filter(d => d.status === 'available');

    const totalMealsReceived = Math.round(
        deliveredToMe.reduce((acc, curr) => acc + (Number(curr.quantityKg) || 0) * 3, 0)
    );
    const familiesNourished = Math.round(totalMealsReceived / 4);

    // Urgent expiring list (under 4 hours left or aiPredictionHours < 8)
    const urgentExpiring = availableSurplus.filter(d => {
        if (d.aiPredictionHours && d.aiPredictionHours <= 12) return true;
        if (!d.expiryAt) return false;
        const diff = new Date(d.expiryAt) - new Date();
        return diff > 0 && diff < 14400000; // 4 hours
    });

    // Filter categories
    const categories = ['All', 'Cooked Food Packets', 'Fresh Vegetables', 'Baked Goods', 'Packaged Groceries'];

    const filteredSurplus = availableSurplus.filter(d => {
        const matchesCat = selectedCategory === 'All' || d.foodType === selectedCategory || d.foodName === selectedCategory;
        const matchesSearch =
            d.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className={`space-y-8 font-sans ${!isEmbedded ? 'min-h-screen bg-[#07090E] text-white p-4 md:p-10 max-w-7xl mx-auto' : ''}`}>
            
            {/* Top Toast Banner */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.9 }}
                        className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40"
                    >
                        <Check className="w-5 h-5 text-white" />
                        <span className="text-xs font-bold">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / Hunger Relief Operations Hub */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[#0B1522] to-[#07090E] border border-emerald-500/20 p-6 md:p-10 shadow-[0_0_50px_rgba(16,185,129,0.08)]"
            >
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                            <span>Community Hunger Relief Operations</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
                            Shelter Hub: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{currentUser?.name || 'Hope Horizon Shelter'}</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
                            Claiming local surplus with zero food waste. Equipped with AI Scrap-Saver culinary algorithms and priority cold-chain rescue pipelines.
                        </p>
                    </div>

                    {/* Quick Badge */}
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[240px] shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Shelter Rating</span>
                            <div className="flex items-center text-amber-400 gap-1 text-sm font-bold">
                                <Star className="w-4 h-4 fill-amber-400" /> 4.9/5.0
                            </div>
                        </div>
                        <div className="text-2xl font-bold font-display text-white">
                            Certified Safe Hub
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Inspected Thermal Pantry</p>
                    </motion.div>
                </div>

                {/* Staggered NGO Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Meals Received', val: totalMealsReceived.toLocaleString(), sub: 'Prepared portions', icon: Utensils, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        { label: 'Families Nourished', val: familiesNourished.toLocaleString(), sub: 'Direct beneficiaries', icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
                        { label: 'Available Surplus', val: availableSurplus.length, sub: 'Ready for rescue', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                        { label: 'Incoming Drops', val: incomingDeliveries.length, sub: 'Couriers en-route', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx, duration: 0.5 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`p-5 rounded-2xl bg-surface/60 backdrop-blur-sm border ${stat.border} relative overflow-hidden transition-all shadow-lg group`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-mono text-gray-500">LIVE OPS</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">{stat.val}</div>
                            <div className="text-xs font-semibold text-gray-300 mt-0.5">{stat.label}</div>
                            <div className="text-[11px] text-gray-500 mt-1">{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Urgent High-Priority Rescue Radar Banner */}
            {urgentExpiring.length > 0 && (
                <motion.div
                    animate={{
                        boxShadow: [
                            '0 0 20px rgba(239,68,68,0.2)',
                            '0 0 45px rgba(239,68,68,0.45)',
                            '0 0 20px rgba(239,68,68,0.2)'
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-gradient-to-r from-red-950/70 via-[#180C0E] to-[#07090E] border border-red-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                                Critical Urgency: Fast-Expiry Food Detected ({urgentExpiring.length} Items)
                            </h3>
                            <p className="text-xs text-gray-400">These nutritional packages will spoil without emergency rescue.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {urgentExpiring.map(item => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-surface/80 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-sm"
                            >
                                <div>
                                    <h4 className="font-bold text-white text-sm">{item.foodName}</h4>
                                    <p className="text-xs text-emerald-400 font-bold">{item.quantityKg} Kg Available</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">From: {item.donorName}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAcceptDonation(item.id)}
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition"
                                >
                                    Rescue Now
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Marketplace & Incoming Drops 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Surplus Food Marketplace (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface/70 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-2xl">
                        
                        {/* Header, Search & Categories */}
                        <div className="space-y-4 mb-6 pb-6 border-b border-border">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                        <Utensils className="w-5 h-5 text-emerald-400" />
                                        <span>Surplus Food Marketplace</span>
                                    </h2>
                                    <p className="text-xs text-gray-400">Browse verified nutritional surplus broadcasted by nearby donors</p>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search surplus or donor..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="bg-bg border border-border rounded-xl px-4 py-2 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition w-full sm:w-60"
                                    />
                                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                                </div>
                            </div>

                            {/* Category Filter Pills with animated layoutId */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {categories.map(cat => {
                                    const isSelected = selectedCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                                isSelected ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="ngoCategoryPill"
                                                    className="absolute inset-0 bg-primary/20 border border-primary/50 rounded-xl"
                                                />
                                            )}
                                            <span className="relative z-10">{cat}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Surplus Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSurplus.length === 0 ? (
                                <div className="col-span-2 text-center py-16 text-gray-500 border border-dashed border-border rounded-2xl">
                                    No surplus matches your query. Try selecting another category!
                                </div>
                            ) : (
                                filteredSurplus.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -4, borderColor: 'rgba(16,185,129,0.4)' }}
                                        className="bg-bg/60 border border-border rounded-2xl p-5 flex flex-col justify-between shadow-lg group transition-all"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h4 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                                                        {item.foodName}
                                                    </h4>
                                                    <p className="text-xs text-gray-400">
                                                        Donor: <span className="text-gray-200 font-medium">{item.donorName}</span>
                                                    </p>
                                                </div>
                                                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    {item.quantityKg} Kg
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-gray-400 my-3">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate">{item.pickupAddress}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                                    <span>Shelf Life: ~{item.aiPredictionHours || 12}h remaining</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="flex items-center justify-between pt-3 border-t border-border mt-2 gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setAiRecipeModal(item)}
                                                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-hover text-gray-300 hover:text-white border border-border text-xs font-semibold transition"
                                            >
                                                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                                                <span>AI Recipe</span>
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleAcceptDonation(item.id)}
                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-bg font-bold py-2 px-4 rounded-xl text-xs shadow-md transition text-center"
                                            >
                                                Accept for Shelter
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Incoming Drops & Quality Rating (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface/70 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl space-y-6">
                        <div>
                            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span>Incoming Deliveries ({incomingDeliveries.length})</span>
                            </h3>
                            <p className="text-xs text-gray-400">Couriers heading to your shelter doors</p>
                        </div>

                        {incomingDeliveries.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-border rounded-2xl text-gray-500 text-xs">
                                No active couriers en-route. Accept surplus to dispatch drivers!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {incomingDeliveries.map(item => (
                                    <div
                                        key={item.id}
                                        className="bg-bg/70 border border-blue-500/20 rounded-2xl p-4 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-white">{item.foodName}</h4>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                                {item.status === 'onTheWay' ? 'In Transit' : 'Courier Assigned'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Courier: <strong className="text-gray-200">{item.volunteerName || 'Regional Courier'}</strong>
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            Quantity: {item.quantityKg} Kg (~{Math.round(item.quantityKg * 3)} meals)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Dropoff Quality Inspection / Rating */}
                        <div className="pt-4 border-t border-border">
                            <h4 className="font-bold text-sm text-white mb-2">Past Delivered Batches</h4>
                            {deliveredToMe.length === 0 ? (
                                <p className="text-xs text-gray-500">No completed deliveries yet.</p>
                            ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {deliveredToMe.map(d => (
                                        <div
                                            key={d.id}
                                            className="bg-bg/50 border border-border p-3 rounded-xl flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <p className="font-bold text-white">{d.foodName}</p>
                                                <p className="text-gray-500 text-[10px]">{d.quantityKg} Kg from {d.donorName}</p>
                                            </div>
                                            {d.feedback ? (
                                                <span className="flex items-center gap-1 text-amber-400 font-bold">
                                                    <Star className="w-3 h-3 fill-amber-400" />
                                                    {d.feedback.rating}/5
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setRatingModal(d)}
                                                    className="px-2.5 py-1 rounded-lg bg-surface-hover hover:bg-border text-emerald-400 font-bold transition"
                                                >
                                                    Rate Quality
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Scrap-Saver Culinary Engine Modal */}
            <AnimatePresence>
                {aiRecipeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 20 }}
                            className="bg-gradient-to-br from-[#0E1524] to-[#07090E] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full relative shadow-[0_0_60px_rgba(245,158,11,0.15)]"
                        >
                            <button
                                onClick={() => setAiRecipeModal(null)}
                                className="absolute top-5 right-5 text-gray-500 hover:text-white"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <ChefHat className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-white">AI Scrap-Saver Recipe</h3>
                                    <p className="text-xs text-amber-400">Nutritional Community Meal Blueprint</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div className="bg-bg/80 border border-border p-4 rounded-2xl space-y-2 font-mono text-gray-300">
                                    <div className="text-emerald-400 font-bold text-sm">
                                        RECIPE: Bulk Repurposed Shelter Skillet
                                    </div>
                                    <p className="text-gray-400">
                                        Optimized for: <strong className="text-white">{aiRecipeModal.foodName} ({aiRecipeModal.quantityKg} Kg)</strong>
                                    </p>
                                    <div className="border-t border-border pt-2 text-[11px] leading-relaxed">
                                        1. Pre-heat large convection kettle to 350°F (175°C).<br />
                                        2. Sauté aromatics (onions, garlic, celery base).<br />
                                        3. Fold in {aiRecipeModal.foodName}, heating to internal temp of 165°F.<br />
                                        4. Fortify with seasonal stock and legumes for caloric density.<br />
                                        <strong className="text-emerald-300 mt-2 block">
                                            ESTIMATED YIELD: ~{Math.round(aiRecipeModal.quantityKg * 4)} Community Portions
                                        </strong>
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-950/30 border border-emerald-900 rounded-xl text-emerald-400 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Meets USDA & WHO Community Shelter Nutritional Guidelines</span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setAiRecipeModal(null)}
                                className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-bg font-bold py-3.5 rounded-xl text-xs shadow-lg transition"
                            >
                                Print Kitchen Recipe Card
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Dropoff Quality Rating Modal */}
            <AnimatePresence>
                {ratingModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface border border-border rounded-3xl p-6 max-w-sm w-full relative shadow-2xl text-center"
                        >
                            <button
                                onClick={() => setRatingModal(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                ✕
                            </button>

                            <h3 className="text-lg font-bold text-white mb-1">Rate Dropoff Quality</h3>
                            <p className="text-xs text-gray-400 mb-4">{ratingModal.foodName} from {ratingModal.donorName}</p>

                            {/* 5 Stars with bouncy hover animations */}
                            <div className="flex items-center justify-center gap-2 my-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <motion.button
                                        key={star}
                                        type="button"
                                        whileHover={{ scale: 1.35, rotate: 10 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setRatingVal(star)}
                                        className="p-1 text-2xl"
                                    >
                                        <Star
                                            className={`w-7 h-7 ${
                                                star <= ratingVal
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-gray-600'
                                            }`}
                                        />
                                    </motion.button>
                                ))}
                            </div>

                            <textarea
                                rows={2}
                                placeholder="Optional feedback regarding freshness, courier speed, or temperature..."
                                value={ratingComment}
                                onChange={e => setRatingComment(e.target.value)}
                                className="w-full bg-bg border border-border rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary my-3"
                            />

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmitRating}
                                className="w-full bg-primary text-bg font-bold py-3 rounded-xl text-xs shadow-lg transition"
                            >
                                Submit Inspection Review
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
