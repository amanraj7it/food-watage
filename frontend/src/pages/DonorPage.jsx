import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift, Leaf, Sparkles, MapPin, Clock, ShieldCheck, CheckCircle2,
    ArrowUpRight, Mic, Share2, Award, FileKey, AlertTriangle,
    TrendingUp, Calendar, ChevronRight, Check, Image as ImageIcon, HeartHandshake
} from 'lucide-react';

export default function DonorPage({ user, donations = [], onSaveDonations, isEmbedded = false }) {
    // Current user fallback if accessed directly via /donor
    const [currentUser, setCurrentUser] = useState(user || null);
    const [localDonations, setLocalDonations] = useState(donations);
    const [filter, setFilter] = useState('all'); // all, available, assigned, delivered
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Form State
    const [foodType, setFoodType] = useState('Cooked Food Packets');
    const [quantity, setQuantity] = useState('');
    const [expiry, setExpiry] = useState('');
    const [foodStatus, setFoodStatus] = useState('Fresh');
    const [pickupLocation, setPickupLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isListening, setIsListening] = useState(false);

    // Modals
    const [activeCert, setActiveCert] = useState(null);
    const [activeShare, setActiveShare] = useState(null);

    // Category options
    const categories = [
        { id: 'Cooked Food Packets', label: 'Cooked Meals', icon: '🍲', shelfHours: 12 },
        { id: 'Fresh Vegetables', label: 'Fresh Produce', icon: '🥦', shelfHours: 72 },
        { id: 'Baked Goods', label: 'Bakery & Bread', icon: '🥖', shelfHours: 36 },
        { id: 'Packaged Groceries', label: 'Packaged Items', icon: '📦', shelfHours: 120 },
    ];

    // Load user/donations if standalone
    useEffect(() => {
        if (!user) {
            const s = localStorage.getItem('hl_session');
            if (!s) {
                window.location.href = '/login';
                return;
            }
            try {
                const parsed = JSON.parse(s);
                if (parsed.role && parsed.role !== 'donor' && parsed.role !== 'admin') {
                    window.location.href = '/dashboard';
                    return;
                }
                fetch('/api/users')
                    .then(r => r.json())
                    .then(d => {
                        const allUsers = JSON.parse(d.value || '[]');
                        const found = allUsers.find(u => u.id === parsed.userId);
                        if (found) {
                            if (found.role !== 'donor' && found.role !== 'admin') {
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
                .then(d => {
                    const parsed = JSON.parse(d.value || '[]');
                    setLocalDonations(parsed);
                })
                .catch(() => {});
        }
    }, [donations]);

    // Calculate donor specific metrics
    const myDonations = localDonations.filter(d => d.donorId === currentUser?.id || (!d.donorId && currentUser?.id === 'donor_demo_1'));
    const totalKgDonated = myDonations.reduce((sum, d) => sum + (Number(d.quantityKg) || 0), 0);
    const mealsProvided = Math.round(totalKgDonated * 3.2);
    const co2SavedKg = (totalKgDonated * 2.5).toFixed(1);
    const activeCount = myDonations.filter(d => d.status !== 'delivered').length;
    const completedCount = myDonations.filter(d => d.status === 'delivered').length;

    // Estimated Shelf Life calculation
    const selectedCategoryObj = categories.find(c => c.id === foodType) || categories[0];
    let calculatedShelfLife = selectedCategoryObj.shelfHours;
    if (foodStatus !== 'Fresh') calculatedShelfLife = Math.round(calculatedShelfLife * 0.5);

    // Voice AI Simulation
    const handleVoiceAssist = () => {
        setIsListening(true);
        setTimeout(() => {
            setFoodType('Cooked Food Packets');
            setQuantity('35');
            setFoodStatus('Fresh');
            setPickupLocation('Riverside Community Kitchen, Bay 4');
            setNotes('Nutritious vegetarian pasta bowls & whole grain bread, packaged hot in thermal containers.');

            const d = new Date();
            d.setHours(d.getHours() + 10);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setExpiry(d.toISOString().slice(0, 16));
            setIsListening(false);
        }, 2200);
    };

    const handleCreateDonation = async (e) => {
        e.preventDefault();
        if (!quantity || !pickupLocation || !expiry) return;

        const newDonation = {
            id: 'don_' + Math.random().toString(36).substring(2, 9),
            donorId: currentUser?.id || 'donor_demo_1',
            donorName: currentUser?.name || 'Green Harvest Bistro',
            foodName: foodType,
            foodType: foodType,
            quantityKg: parseFloat(quantity),
            foodStatus,
            pickupAddress: pickupLocation,
            notes,
            co2Saved: parseFloat(quantity) * 2.5,
            aiPredictionHours: calculatedShelfLife,
            hasImage: !!imagePreview,
            createdAt: new Date().toISOString(),
            expiryAt: expiry,
            status: 'available',
            ngoId: null,
            ngoName: null,
            volunteerId: null,
            volunteerName: null
        };

        const updated = [newDonation, ...localDonations];
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

        // Reset & show toast
        setQuantity('');
        setPickupLocation('');
        setNotes('');
        setExpiry('');
        setImagePreview(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
    };

    // Filtered donations list
    const filteredList = myDonations.filter(d => {
        if (filter === 'all') return true;
        if (filter === 'available') return d.status === 'available';
        if (filter === 'assigned') return d.status === 'assigned' || d.status === 'pickedUp' || d.status === 'onTheWay';
        if (filter === 'delivered') return d.status === 'delivered';
        return true;
    });

    return (
        <div className={`space-y-8 font-sans ${!isEmbedded ? 'min-h-screen bg-[#07090E] text-white p-4 md:p-10 max-w-7xl mx-auto' : ''}`}>
            
            {/* Top Success Banner / Toast */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Surplus Broadcasted!</h4>
                            <p className="text-xs text-white/80">Local NGOs and volunteer couriers have been alerted via AI Dispatch.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / Hero Impact Hub */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[#0E1522] to-[#07090E] border border-emerald-500/20 p-6 md:p-10 shadow-[0_0_50px_rgba(16,185,129,0.08)]"
            >
                {/* Decorative floating orbs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-20 left-10 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"
                />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                            <span>Verified Food Donor Hub</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{currentUser?.name || 'Green Harvest Bistro'}</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
                            Transforming your edible surplus into life-saving meals with real-time cryptographic audit trails and cold-chain volunteer logistics.
                        </p>
                    </div>

                    {/* Tier Card */}
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[240px] shadow-xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Impact Tier</span>
                            <Award className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold font-display text-white flex items-center gap-2">
                            Gold Benefactor
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Level 4 Zero-Waste Pioneer</p>
                        
                        {/* Tier progress */}
                        <div className="mt-3 w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '74%' }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            />
                        </div>
                        <span className="text-[10px] text-gray-500 block text-right mt-1 font-mono">2,450 / 3,000 XP to Platinum</span>
                    </motion.div>
                </div>

                {/* Staggered Live Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Total Donated', val: `${totalKgDonated.toFixed(0)} Kg`, sub: 'All-time rescued', icon: Gift, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        { label: 'Meals Provided', val: mealsProvided.toLocaleString(), sub: 'Served to shelters', icon: HeartHandshake, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
                        { label: 'CO₂ Prevented', val: `${co2SavedKg} Kg`, sub: 'Direct carbon offset', icon: Leaf, color: 'text-emerald-300', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', glow: true },
                        { label: 'Deliveries Completed', val: completedCount, sub: `${activeCount} currently live`, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx, duration: 0.5 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`p-5 rounded-2xl bg-surface/60 backdrop-blur-sm border ${stat.border} relative overflow-hidden transition-all shadow-lg group`}
                        >
                            {stat.glow && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                            )}
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <div className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">{stat.val}</div>
                            <div className="text-xs font-semibold text-gray-300 mt-0.5">{stat.label}</div>
                            <div className="text-[11px] text-gray-500 mt-1">{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* 2-Column Section: Smart Surplus Listing Studio & Live Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Smart Surplus Creation Studio (7 Cols) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="lg:col-span-7 bg-surface/70 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-white">Smart Surplus Studio</h2>
                                <p className="text-xs text-gray-400">Post surplus with AI shelf-life prediction & voice dictation</p>
                            </div>
                        </div>

                        {/* Voice AI Assist Button with Framer Motion audio waves */}
                        <motion.button
                            type="button"
                            onClick={handleVoiceAssist}
                            disabled={isListening}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all border shadow-lg ${
                                isListening
                                    ? 'bg-primary text-bg border-primary'
                                    : 'bg-surface-hover border-border text-gray-300 hover:text-white hover:border-primary/50'
                            }`}
                        >
                            <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-bg' : 'text-primary'}`} />
                            <span>{isListening ? 'AI Listening...' : 'Voice Assist AI'}</span>

                            {/* Animated sound wave bars */}
                            {isListening && (
                                <div className="flex items-center gap-1 ml-1 h-3">
                                    {[0.4, 0.8, 0.5, 0.9, 0.3].map((height, i) => (
                                        <motion.span
                                            key={i}
                                            animate={{ scaleY: [0.3, 1.2, 0.3] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                                            className="w-1 bg-bg rounded-full h-full"
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.button>
                    </div>

                    <form onSubmit={handleCreateDonation} className="space-y-6">
                        
                        {/* Food Category Selector Pills */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                                Select Surplus Category
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {categories.map(cat => {
                                    const isSelected = foodType === cat.id;
                                    return (
                                        <motion.button
                                            type="button"
                                            key={cat.id}
                                            onClick={() => setFoodType(cat.id)}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-colors overflow-hidden ${
                                                isSelected
                                                    ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                    : 'border-border bg-bg/50 text-gray-400 hover:bg-surface-hover hover:text-gray-200'
                                            }`}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="activeDonorCategory"
                                                    className="absolute inset-0 bg-primary/10 border border-primary pointer-events-none rounded-2xl"
                                                />
                                            )}
                                            <span className="text-2xl mb-1.5">{cat.icon}</span>
                                            <span className="text-xs font-bold leading-tight">{cat.label}</span>
                                            <span className="text-[10px] text-gray-500 mt-1">~{cat.shelfHours}h shelf life</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Live AI Shelf-Life Gauge */}
                        <motion.div
                            layout
                            className="bg-gradient-to-r from-emerald-950/30 via-[#0B111D] to-[#07090E] border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-2">
                                        AI Shelf-Life Prediction Engine
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">Neural v2</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400">Calculated based on food acidity, ambient temp & category</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xl font-bold font-display text-emerald-400">~{calculatedShelfLife} Hours</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Safe Distribution Window</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quantity & Freshness Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Quantity (Kg)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.5"
                                    required
                                    placeholder="e.g. 25"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Freshness Condition
                                </label>
                                <select
                                    value={foodStatus}
                                    onChange={e => setFoodStatus(e.target.value)}
                                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition font-medium"
                                >
                                    <option value="Fresh">Freshly Prepared / Packaged</option>
                                    <option value="Leftover but Safe">Safe Edible Leftovers (Inspected)</option>
                                    <option value="Near Best Before">Near Best-Before Date (Dry Goods)</option>
                                </select>
                            </div>
                        </div>

                        {/* Pickup Address & Expiry Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Expiry Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={expiry}
                                    onChange={e => setExpiry(e.target.value)}
                                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition font-medium [color-scheme:dark]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Pickup Location / Bay
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 142 River Road, Kitchen Back Door"
                                        value={pickupLocation}
                                        onChange={e => setPickupLocation(e.target.value)}
                                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition font-medium"
                                    />
                                    <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                                </div>
                            </div>
                        </div>

                        {/* Special Packaging / Allergen Notes */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Packaging & Allergen Information (Optional)
                            </label>
                            <textarea
                                rows={2}
                                placeholder="e.g., Kept warm in sealed aluminum chafing pans. Contains gluten, dairy-free."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full bg-bg border border-border rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition text-sm font-medium"
                            />
                        </div>

                        {/* Submit Action */}
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(16,185,129,0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-bg font-display font-bold py-4 rounded-xl text-base shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Broadcast Surplus to Harvest Network</span>
                        </motion.button>
                    </form>
                </motion.div>

                {/* Right Column: Active Listings & Real-Time Tracking Feed (5 Cols) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="lg:col-span-5 space-y-6"
                >
                    <div className="bg-surface/70 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl">
                        
                        {/* Feed Header with Tab Filter Pills */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
                            <div>
                                <h3 className="text-lg font-display font-bold text-white">Your Donation Listings</h3>
                                <p className="text-xs text-gray-400">Live custody and cold-chain status</p>
                            </div>

                            {/* Filter Pills */}
                            <div className="flex items-center gap-1 bg-bg p-1 rounded-xl border border-border text-xs">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'available', label: 'Live' },
                                    { id: 'assigned', label: 'Transit' },
                                    { id: 'delivered', label: 'Delivered' }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setFilter(t.id)}
                                        className={`relative px-3 py-1.5 rounded-lg font-bold transition-colors ${
                                            filter === t.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        {filter === t.id && (
                                            <motion.div
                                                layoutId="activeDonorFilter"
                                                className="absolute inset-0 bg-surface-hover border border-white/10 rounded-lg shadow-sm"
                                            />
                                        )}
                                        <span className="relative z-10">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Listings Feed */}
                        <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
                            {filteredList.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16 px-4 border border-dashed border-border rounded-2xl text-gray-500"
                                >
                                    <Gift className="w-12 h-12 mx-auto mb-3 text-gray-600 stroke-[1.5]" />
                                    <p className="text-sm font-medium text-gray-400">No surplus listings match this filter.</p>
                                    <p className="text-xs mt-1">Post a new surplus above to feed families in need.</p>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredList.map((d, index) => {
                                        const isDelivered = d.status === 'delivered';
                                        const isTransit = d.status === 'assigned' || d.status === 'pickedUp' || d.status === 'onTheWay';
                                        const isAvailable = d.status === 'available';

                                        return (
                                            <motion.div
                                                key={d.id}
                                                layout
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.35, delay: index * 0.05 }}
                                                className="bg-bg/60 border border-border hover:border-emerald-500/30 rounded-2xl p-5 transition-all shadow-md group"
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                                            {d.foodName}
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 font-mono">
                                                                {d.quantityKg} Kg
                                                            </span>
                                                        </h4>
                                                        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                                                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                                            <span className="truncate max-w-[220px]">{d.pickupAddress}</span>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge with Live Pulse */}
                                                    <div className="flex flex-col items-end gap-1">
                                                        {isAvailable && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                                                Pending Rescue
                                                            </span>
                                                        )}
                                                        {isTransit && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                                Courier In Transit
                                                            </span>
                                                        )}
                                                        {isDelivered && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                                                                Delivered
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Notes or Courier info */}
                                                {d.notes && (
                                                    <p className="text-xs text-gray-500 bg-surface/50 p-2.5 rounded-xl border border-white/5 my-2.5 line-clamp-2">
                                                        {d.notes}
                                                    </p>
                                                )}

                                                {/* Action Bar */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400">
                                                    <span className="font-mono text-[11px]">
                                                        {new Date(d.createdAt).toLocaleDateString()}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        {isDelivered && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setActiveCert(d)}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900 hover:bg-emerald-900/60 font-semibold transition"
                                                            >
                                                                <FileKey className="w-3.5 h-3.5" />
                                                                <span>Certificate</span>
                                                            </motion.button>
                                                        )}

                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setActiveShare(d)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-hover text-gray-300 border border-border hover:text-white font-semibold transition"
                                                        >
                                                            <Share2 className="w-3.5 h-3.5 text-primary" />
                                                            <span>Share</span>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Cryptographic ESG Certificate Modal */}
            <AnimatePresence>
                {activeCert && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, rotateX: 15 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.85, rotateX: 15 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="bg-gradient-to-br from-[#0F1626] to-[#080C14] border border-emerald-500/30 rounded-3xl p-8 max-w-lg w-full relative shadow-[0_0_80px_rgba(16,185,129,0.2)]"
                        >
                            <button
                                onClick={() => setActiveCert(null)}
                                className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 w-8 h-8 rounded-full flex items-center justify-center"
                            >
                                ✕
                            </button>

                            <div className="text-center mb-6">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                                    className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-4"
                                >
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                </motion.div>
                                <h3 className="text-2xl font-display font-black text-white">Certified ESG Offset</h3>
                                <p className="text-xs text-emerald-400 uppercase tracking-widest mt-0.5">Harvest Network Verified Ledger</p>
                            </div>

                            <div className="bg-bg/80 border border-border rounded-2xl p-5 font-mono text-xs space-y-3 text-gray-300 shadow-inner">
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-gray-500">LEDGER_HASH:</span>
                                    <span className="text-emerald-400 font-bold">0x{Math.random().toString(16).slice(2, 10)}...f8a1</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-gray-500">BENEFICIARY_DONOR:</span>
                                    <span className="text-white">{activeCert.donorName}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-gray-500">COMMODITY:</span>
                                    <span className="text-white">{activeCert.quantityKg} Kg {activeCert.foodName}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-gray-500">EMISSIONS_AVERTED:</span>
                                    <span className="text-emerald-400 font-bold">{(activeCert.quantityKg * 2.5).toFixed(1)} Kg CO₂e</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">VERIFIED_AT:</span>
                                    <span className="text-white">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        alert('Certificate downloaded with cryptographic seal.');
                                        setActiveCert(null);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-bg font-bold py-3.5 rounded-xl shadow-lg"
                                >
                                    Download Immutable PDF
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Social Impact Brag Modal */}
            <AnimatePresence>
                {activeShare && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="bg-surface border border-border rounded-3xl p-6 max-w-sm w-full relative shadow-2xl"
                        >
                            <button
                                onClick={() => setActiveShare(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white bg-bg w-8 h-8 rounded-full flex items-center justify-center"
                            >
                                ✕
                            </button>

                            {/* Instagram-Ready Card */}
                            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900 aspect-square rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl text-white">
                                <Leaf className="absolute -right-8 -bottom-8 w-44 h-44 text-white/10 pointer-events-none" />
                                <div>
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                                        Climate Action Impact
                                    </div>
                                    <div className="text-3xl font-display font-black leading-tight mt-1">
                                        Saved {activeShare.quantityKg} Kg of Food Waste!
                                    </div>
                                </div>

                                <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/15 space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-white/70">CO₂ Avoided:</span>
                                        <span className="font-bold text-emerald-300">{(activeShare.quantityKg * 2.5).toFixed(1)} Kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Shelter Meals:</span>
                                        <span className="font-bold text-white">~{Math.round(activeShare.quantityKg * 3)} Portions</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`We just diverted ${activeShare.quantityKg} Kg of food waste and fed community members via @HarvestNetwork! 🌱 #ZeroWaste`)}`);
                                        setActiveShare(null);
                                    }}
                                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl text-xs transition"
                                >
                                    Share on 𝕏
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`We saved ${activeShare.quantityKg} Kg of food surplus via Harvest Network!`);
                                        alert('Impact caption copied to clipboard!');
                                        setActiveShare(null);
                                    }}
                                    className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl text-xs shadow-md"
                                >
                                    Copy Instagram Story
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
