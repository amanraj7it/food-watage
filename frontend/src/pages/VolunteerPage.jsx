import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, MapPin, Navigation, CheckCircle, Clock, ShieldCheck,
    ThermometerSnowflake, QrCode, AlertCircle, Compass, Zap,
    Award, ArrowRight, Activity, Phone, ChevronRight, Check
} from 'lucide-react';

export default function VolunteerPage({ user, donations = [], onSaveDonations, isEmbedded = false }) {
    const [currentUser, setCurrentUser] = useState(user || null);
    const [localDonations, setLocalDonations] = useState(donations);
    const [isOnline, setIsOnline] = useState(true);
    const [activeTab, setActiveTab] = useState('missions'); // 'missions' | 'radar' | 'stats'
    const [activeQrModal, setActiveQrModal] = useState(null);
    const [successToast, setSuccessToast] = useState('');

    // IoT Cold Chain Mock
    const [tempReadout, setTempReadout] = useState(3.4);
    const [sensorWave, setSensorWave] = useState([3.2, 3.4, 3.1, 3.5, 3.3, 3.4]);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextVal = Number((3.1 + Math.random() * 0.6).toFixed(1));
            setTempReadout(nextVal);
            setSensorWave(prev => [...prev.slice(1), nextVal]);
        }, 3200);
        return () => clearInterval(interval);
    }, []);

    // Standalone fallback
    useEffect(() => {
        if (!user) {
            const s = localStorage.getItem('hl_session');
            if (s) {
                try {
                    const parsed = JSON.parse(s);
                    setCurrentUser(parsed);
                } catch (e) { }
            } else {
                setCurrentUser({
                    id: 'vol_demo_1',
                    name: 'Alex Rivera',
                    email: 'alex.courier@harvest.eco',
                    role: 'volunteer'
                });
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

    // Accept an available delivery route
    const handleAcceptRoute = async (donationId) => {
        const target = localDonations.find(d => d.id === donationId);
        if (!target) return;

        const updated = localDonations.map(d =>
            d.id === donationId
                ? {
                      ...d,
                      status: 'assigned',
                      volunteerId: currentUser?.id || 'vol_demo_1',
                      volunteerName: currentUser?.name || 'Alex Rivera',
                      assignedAt: new Date().toISOString()
                  }
                : d
        );

        await saveDonationsState(updated);
        setSuccessToast(`Route accepted for ${target.foodName}! Navigate to pickup.`);
        setTimeout(() => setSuccessToast(''), 4000);
    };

    // Advance transit step
    const transitSteps = ['assigned', 'pickedUp', 'onTheWay', 'reached', 'delivered'];
    const stepLabels = {
        assigned: 'Route Assigned',
        pickedUp: 'Cargo Picked Up',
        onTheWay: 'In Transit',
        reached: 'Arrived at NGO',
        delivered: 'Completed Delivery'
    };

    const handleAdvanceTransit = async (donationId, currentStatus) => {
        const curIdx = transitSteps.indexOf(currentStatus);
        if (curIdx === -1 || curIdx >= transitSteps.length - 1) return;

        const nextStatus = transitSteps[curIdx + 1];
        const updated = localDonations.map(d =>
            d.id === donationId
                ? {
                      ...d,
                      status: nextStatus,
                      ...(nextStatus === 'delivered' ? { deliveredAt: new Date().toISOString() } : {})
                  }
                : d
        );

        await saveDonationsState(updated);
        if (nextStatus === 'delivered') {
            setSuccessToast('Mission accomplished! +250 XP earned for cold-chain rescue.');
            setTimeout(() => setSuccessToast(''), 4500);
        }
    };

    // Filter volunteer data
    const availableRequests = localDonations.filter(d => d.status === 'accepted' || (!d.volunteerId && d.status === 'available'));
    const myActiveDeliveries = localDonations.filter(
        d => (d.volunteerId === currentUser?.id || (!d.volunteerId && currentUser?.id === 'vol_demo_1')) && d.status !== 'delivered' && d.status !== 'available'
    );
    const myCompletedDeliveries = localDonations.filter(
        d => (d.volunteerId === currentUser?.id || (!d.volunteerId && currentUser?.id === 'vol_demo_1')) && d.status === 'delivered'
    );

    const volunteerXp = myCompletedDeliveries.length * 250 + myActiveDeliveries.length * 50;

    return (
        <div className={`space-y-8 font-sans ${!isEmbedded ? 'min-h-screen bg-[#07090E] text-white p-4 md:p-10 max-w-7xl mx-auto' : ''}`}>
            
            {/* Toast Notification */}
            <AnimatePresence>
                {successToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.9 }}
                        className="fixed top-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/40"
                    >
                        <Check className="w-5 h-5 text-white" />
                        <span className="text-xs font-bold">{successToast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Fleet Command Hub */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#0B1324] to-[#07090E] border border-blue-500/20 p-6 md:p-10 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
            >
                {/* Background Glows */}
                <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
                />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Autonomous Fleet Courier Dispatch</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
                            Courier Hub: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{currentUser?.name || 'Alex Rivera'}</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
                            Connecting local food donors with community shelters in real-time. Cold-chain certified courier protocols active.
                        </p>
                    </div>

                    {/* Online / Standby Dispatch Switch */}
                    <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-md p-3 px-5 rounded-2xl border border-white/10 shadow-xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Duty Status</span>
                            <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
                                {isOnline ? 'On Duty (Live Dispatch)' : 'Standby Mode'}
                            </span>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOnline(!isOnline)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                isOnline
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </motion.button>
                    </div>
                </div>

                {/* Staggered Courier Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Completed Rescues', val: myCompletedDeliveries.length, sub: 'Zero-waste deliveries', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        { label: 'Active Missions', val: myActiveDeliveries.length, sub: 'Currently en-route', icon: Navigation, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                        { label: 'Fleet XP Earned', val: volunteerXp.toLocaleString(), sub: 'Rank #4 Regional', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                        { label: 'IoT Cold Safe', val: `${tempReadout}°C`, sub: 'Thermally compliant', icon: ThermometerSnowflake, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: true },
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
                                <span className="text-[10px] font-mono text-gray-500">LIVE SENSOR</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">{stat.val}</div>
                            <div className="text-xs font-semibold text-gray-300 mt-0.5">{stat.label}</div>
                            <div className="text-[11px] text-gray-500 mt-1">{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* View Selector Tabs */}
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border">
                    {[
                        { id: 'missions', label: 'Active Missions & Logistics', icon: Truck },
                        { id: 'radar', label: 'Cybernetic Radar Mesh', icon: Compass },
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                                    isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="volActiveTab"
                                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                    />
                                )}
                                <tab.icon className="w-4 h-4 relative z-10" />
                                <span className="relative z-10">{tab.label}</span>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="text-xs text-gray-400 hidden sm:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>Live GPS Precision: ± 1.8m</span>
                </div>
            </div>

            {/* TAB 1: Missions & Active Logistics Pipeline */}
            {activeTab === 'missions' && (
                <div className="space-y-8">
                    
                    {/* Active Transit Missions Tracker */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                                <span>Active Cargo in Transit ({myActiveDeliveries.length})</span>
                            </h2>
                            <span className="text-xs text-gray-500 font-mono">EN-ROUTE TO SHELTER</span>
                        </div>

                        {myActiveDeliveries.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-surface/50 border border-dashed border-border rounded-3xl p-10 text-center text-gray-500"
                            >
                                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-600 stroke-[1.5]" />
                                <h3 className="text-base font-bold text-gray-300">Courier Fleet is Idle</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                    No missions currently in transit. Accept a pending route below to initiate pickup and GPS routing.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {myActiveDeliveries.map(d => {
                                    const currentIdx = transitSteps.indexOf(d.status);
                                    const nextStep = transitSteps[currentIdx + 1];

                                    return (
                                        <motion.div
                                            key={d.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-surface/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
                                        >
                                            {/* Top info row */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-display font-bold text-white">{d.foodName}</h3>
                                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                                                            {d.quantityKg} Kg
                                                        </span>
                                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                                                            <ThermometerSnowflake className="w-3 h-3" />
                                                            {tempReadout}°C Verified
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1.5 flex flex-wrap items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                                            From: <strong className="text-gray-200">{d.pickupAddress}</strong>
                                                        </span>
                                                        <span className="text-gray-600">→</span>
                                                        <span className="flex items-center gap-1">
                                                            <Navigation className="w-3.5 h-3.5 text-blue-400" />
                                                            To: <strong className="text-white">{d.ngoName || 'Regional Relief Shelter'}</strong>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action buttons: Scan QR Handshake & Advance Step */}
                                                <div className="flex items-center gap-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setActiveQrModal(d)}
                                                        className="flex items-center gap-2 bg-surface-hover border border-border text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                                                    >
                                                        <QrCode className="w-4 h-4 text-blue-400" />
                                                        <span>Verify QR Handshake</span>
                                                    </motion.button>

                                                    {currentIdx < transitSteps.length - 1 && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={() => handleAdvanceTransit(d.id, d.status)}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg"
                                                        >
                                                            <span>Log '{stepLabels[nextStep]}'</span>
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Transit Progress Bar with Moving Truck */}
                                            <div className="space-y-4">
                                                <div className="relative pt-6 pb-2">
                                                    {/* Background line */}
                                                    <div className="h-2 bg-bg rounded-full overflow-hidden border border-border">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(currentIdx / (transitSteps.length - 1)) * 100}%` }}
                                                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                                                            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                                                        />
                                                    </div>

                                                    {/* Moving Delivery Truck Icon */}
                                                    <motion.div
                                                        animate={{ left: `${(currentIdx / (transitSteps.length - 1)) * 100}%` }}
                                                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                                                        className="absolute top-1 -translate-x-1/2 w-9 h-9 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                                    >
                                                        <Truck className="w-4 h-4 text-white" />
                                                    </motion.div>
                                                </div>

                                                {/* Step Labels */}
                                                <div className="grid grid-cols-5 text-center text-[10px] font-bold uppercase tracking-wider">
                                                    {transitSteps.map((step, sIdx) => {
                                                        const isPastOrCur = sIdx <= currentIdx;
                                                        return (
                                                            <div
                                                                key={step}
                                                                className={`flex flex-col items-center gap-1 ${
                                                                    isPastOrCur ? 'text-blue-400' : 'text-gray-600'
                                                                }`}
                                                            >
                                                                <span>{stepLabels[step]}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* IoT Temperature Wave Graphic */}
                                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-500 font-mono text-[11px]">IoT Cold-Chain Telemetry:</span>
                                                    <div className="flex items-center gap-1 h-4">
                                                        {sensorWave.map((val, wIdx) => (
                                                            <motion.div
                                                                key={wIdx}
                                                                animate={{ height: `${Math.max(6, (val - 2.5) * 16)}px` }}
                                                                transition={{ duration: 0.4 }}
                                                                className="w-1.5 bg-cyan-400 rounded-full"
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-cyan-400 font-mono font-bold">{tempReadout}°C</span>
                                                </div>
                                                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> HACCP Certified Safe
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pending Logistics Requests (Available Routes to Accept) */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                    <Compass className="w-5 h-5 text-emerald-400" />
                                    <span>Available Rescue Routes ({availableRequests.length})</span>
                                </h2>
                                <p className="text-xs text-gray-400">Claim pending food donor pickups near your GPS coordinates</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableRequests.length === 0 ? (
                                <div className="col-span-2 text-center py-12 border border-dashed border-border rounded-3xl text-gray-500">
                                    No pending route requests right now. All local surplus is covered!
                                </div>
                            ) : (
                                availableRequests.map((req, i) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        whileHover={{ y: -4, borderColor: 'rgba(59,130,246,0.4)' }}
                                        className="bg-surface/70 border border-border rounded-2xl p-6 flex flex-col justify-between shadow-xl group transition-all"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                                                        {req.foodName}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        Offered by: <span className="text-gray-200 font-medium">{req.donorName}</span>
                                                    </p>
                                                </div>
                                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    {req.quantityKg} Kg
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-xs text-gray-400 my-4 bg-bg/50 p-3 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate">{req.pickupAddress}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                    <span>Rescue Urgency: ~{req.aiPredictionHours || 12}h Safe Time Window</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                                            <span className="text-xs font-mono text-gray-500">EST. DISTANCE: 2.3 KM</span>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleAcceptRoute(req.id)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-1.5"
                                            >
                                                <span>Accept Mission</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Cybernetic Dispatch Radar Mesh */}
            {activeTab === 'radar' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-border bg-[#050811] rounded-3xl overflow-hidden shadow-2xl relative h-[600px] flex flex-col"
                >
                    <div className="p-5 border-b border-border bg-surface/80 backdrop-blur-md flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <Compass className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
                            <div>
                                <h3 className="font-bold text-white text-sm">Harvest Cyber-Dispatch Radar Mesh</h3>
                                <p className="text-[11px] text-gray-400">Dynamic node positioning & courier telemetry</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                14 Nodes Connected
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        {/* Matrix Grid */}
                        <div
                            className="absolute inset-0 opacity-15 pointer-events-none"
                            style={{
                                backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                            }}
                        />

                        {/* Concentric Radar Rings */}
                        <div className="absolute w-[500px] h-[500px] border border-blue-500/20 rounded-full flex items-center justify-center pointer-events-none">
                            <div className="absolute w-[360px] h-[360px] border border-blue-500/30 rounded-full" />
                            <div className="absolute w-[220px] h-[220px] border border-blue-500/40 rounded-full" />
                            <div className="absolute w-[90px] h-[90px] border border-blue-500/60 rounded-full" />
                            
                            {/* Rotating Sweeper Beam */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-blue-400 pointer-events-none"
                            />
                        </div>

                        {/* Interactive Radar Markers */}
                        <motion.div
                            whileHover={{ scale: 1.15 }}
                            className="absolute top-[32%] left-[42%] flex flex-col items-center gap-1 cursor-pointer"
                        >
                            <div className="relative">
                                <span className="absolute -inset-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                                <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
                            </div>
                            <span className="bg-surface/90 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300">
                                Fresh Harvest Bistro (Pickup)
                            </span>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.15 }}
                            className="absolute top-[65%] left-[58%] flex flex-col items-center gap-1 cursor-pointer"
                        >
                            <div className="relative">
                                <span className="absolute -inset-2 bg-blue-400 rounded-full animate-ping opacity-75" />
                                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                            </div>
                            <span className="bg-surface/90 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30 text-blue-300">
                                Community Food Pantry (Dropoff)
                            </span>
                        </motion.div>

                        <motion.div
                            animate={{ y: [-4, 4, -4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-[48%] left-[50%] flex flex-col items-center gap-1"
                        >
                            <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,1)]">
                                <Truck className="w-4 h-4 text-white" />
                            </div>
                            <span className="bg-blue-950/80 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-400 text-white">
                                You (Courier Live)
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* QR Handshake Scanner Modal */}
            <AnimatePresence>
                {activeQrModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            className="bg-surface border border-border rounded-3xl p-8 max-w-sm w-full relative shadow-2xl text-center"
                        >
                            <button
                                onClick={() => setActiveQrModal(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                ✕
                            </button>

                            <h3 className="text-xl font-display font-bold text-white mb-1">Cryptographic Custody Handshake</h3>
                            <p className="text-xs text-gray-400 mb-6">Scan recipient NGO token to verify chain-of-custody transfer</p>

                            {/* Simulated Scanner Box with Moving Laser Beam */}
                            <div className="relative w-48 h-48 mx-auto bg-black rounded-2xl border-2 border-blue-500/40 p-4 flex items-center justify-center overflow-hidden shadow-inner">
                                <QrCode className="w-32 h-32 text-gray-600" />
                                
                                {/* Animated Vertical Laser Beam */}
                                <motion.div
                                    animate={{ y: [-80, 80, -80] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(6,182,212,1)]"
                                />
                            </div>

                            <div className="mt-6 text-xs text-gray-400 space-y-1">
                                <p>CARGO: <strong className="text-white">{activeQrModal.foodName}</strong></p>
                                <p className="font-mono text-[11px] text-blue-400">HASH: 0x{Math.random().toString(16).slice(2, 10)}</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    alert('Handshake Authenticated! Chain of custody signed cryptographically.');
                                    setActiveQrModal(null);
                                }}
                                className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition"
                            >
                                Simulate Scan Confirmation
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
