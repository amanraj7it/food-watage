import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Leaf, LayoutDashboard, Gift, MapPin, Truck, History, LogOut, CheckCircle, Search,
    ShieldAlert, BarChart3, QrCode, FileText, Users, Star, Mic, Trophy, ChefHat,
    Share2, Shield, ThermometerSnowflake, Activity, FileKey
} from 'lucide-react';

import DonorPage from './DonorPage';
import VolunteerPage from './VolunteerPage';
import NgoPage from './NgoPage';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    // New donation form state
    const [foodType, setFoodType] = useState('Cooked Food Packets');
    const [quantity, setQuantity] = useState('');
    const [expiry, setExpiry] = useState('');
    const [foodStatus, setFoodStatus] = useState('Fresh');
    const [pickupLocation, setPickupLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [imageFile, setImageFile] = useState(null);

    // Niche Feature States
    const [isListening, setIsListening] = useState(false);
    const [activeCert, setActiveCert] = useState(null);
    const [activeShare, setActiveShare] = useState(null);
    const [aiRecipeFor, setAiRecipeFor] = useState(null);
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    useEffect(() => {
        const s = localStorage.getItem('hl_session');
        if (!s) {
            window.location.href = '/login';
            return;
        }
        const parsed = JSON.parse(s);
        fetchData(parsed.userId);

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const seq = ['p', 'a', 'r', 'a', 'k', 'h'];
        let idx = 0;
        const kd = (e) => {
            if (e.key.toLowerCase() === seq[idx]) {
                idx++;
                if (idx === seq.length) {
                    setShowEasterEgg(true);
                    idx = 0;
                }
            } else { idx = 0; }
        };
        window.addEventListener('keydown', kd);
        return () => window.removeEventListener('keydown', kd);
    }, [navigate]);

    useEffect(() => {
        if (!loading && user && (user.role === 'admin' || user.role === 'ngo')) {
            const avail = donations.filter(d => d.status === 'available').length;
            if (avail > 0 && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('Harvest Network Alert', { body: `There are ${avail} new food donations pending rescue!` });
            }
        }
    }, [loading]);

    const fetchData = async (userId) => {
        try {
            const uRes = await fetch('/api/users');
            const uData = await uRes.json();
            const allUsers = JSON.parse(uData.value || '[]');
            setUsers(allUsers);
            const currUser = allUsers.find(u => u.id === userId);
            if (!currUser || currUser.status === 'banned') {
                localStorage.removeItem('hl_session');
                window.location.href = '/login';
                return;
            }
            setUser(currUser);

            const dRes = await fetch('/api/donations');
            const dData = await dRes.json();
            setDonations(JSON.parse(dData.value || '[]'));
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const saveDonations = async (newDonations) => {
        try {
            await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: JSON.stringify(newDonations) })
            });
            setDonations(newDonations);
        } catch (e) {
            console.error('Failed to save donations');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('hl_session');
        window.location.href = '/login';
    };

    // Voice AI Mock
    const simulateVoiceInput = () => {
        setIsListening(true);
        setTimeout(() => {
            setFoodType('Cooked Food Packets');
            setQuantity('45');
            setFoodStatus('Fresh');
            setPickupLocation('124 Central Avenue, Kitchen B');
            setNotes('Leftovers from the charity gala event. Contains pasta and garlic bread.');

            const d = new Date();
            d.setHours(d.getHours() + 12);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setExpiry(d.toISOString().slice(0, 16));
            setIsListening(false);
        }, 2500);
    };

    const handleCreateDonation = async (e) => {
        e.preventDefault();
        if (!quantity || !pickupLocation || !expiry) return;

        // AI Shelf Life Prediction Block
        let aiPredictionHours = foodType.includes('Cooked') ? 12 : 72;
        if (foodStatus !== 'Fresh') aiPredictionHours /= 2;

        const newDonation = {
            id: Math.random().toString(36).substring(2, 15),
            donorId: user.id, donorName: user.name,
            foodName: foodType, foodType: foodType,
            quantityKg: parseFloat(quantity), foodStatus, pickupAddress: pickupLocation, notes,
            co2Saved: parseFloat(quantity) * 2.5,
            aiPredictionHours, hasImage: !!imageFile,
            createdAt: new Date().toISOString(), expiryAt: expiry, status: 'available',
            ngoId: null, ngoName: null, volunteerId: null, volunteerName: null
        };

        await saveDonations([...donations, newDonation]);
        setFoodType('Cooked Food Packets'); setQuantity(''); setExpiry(''); setPickupLocation(''); setNotes(''); setImageFile(null);
        setActiveTab('dashboard');
    };

    const acceptDonation = async (donationId) => {
        const donation = donations.find(d => d.id === donationId);
        const updated = donations.map(d => d.id === donationId ? { ...d, status: 'accepted', ngoId: user.id, ngoName: user.name, acceptedAt: new Date().toISOString() } : d);
        await saveDonations(updated);

        const donorUser = users.find(u => u.id === donation.donorId);
        if (donorUser && donorUser.email) {
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to_email: donorUser.email,
                    subject: 'Your Food Donation was Accepted!',
                    body: `Your donation of ${donation.quantityKg} Kg ${donation.foodName} has been accepted by ${user.name}. It is now pending volunteer assignment.`
                })
            });
        }

        const volunteers = users.filter(u => u.role === 'volunteer');
        volunteers.forEach(v => {
            if (v.email) {
                fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to_email: v.email,
                        subject: 'LIVE UPDATE: New Delivery Route!',
                        body: `Action Required: New delivery route pending from ${donation.pickupAddress} to ${user.name}. Open your dashboard to accept.`
                    })
                });
            }
        });
    };

    const volunteerAccept = async (donationId) => {
        const donation = donations.find(d => d.id === donationId);
        const updated = donations.map(d => d.id === donationId ? { ...d, status: 'assigned', volunteerId: user.id, volunteerName: user.name } : d);
        await saveDonations(updated);

        const ngo = users.find(u => u.id === donation.ngoId);
        if (ngo && ngo.email) {
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to_email: ngo.email,
                    subject: 'Volunteer En Route!',
                    body: `Volunteer ${user.name} has accepted the route for ${donation.foodName} and is on their way.`
                })
            });
        }
    };

    const advanceDeliveryStatus = async (donationId, currentStatus) => {
        const order = ['assigned', 'pickedUp', 'onTheWay', 'reached', 'delivered'];
        const nextIdx = order.indexOf(currentStatus) + 1;
        if (nextIdx >= order.length) return;
        const updated = donations.map(d => d.id === donationId ? { ...d, status: order[nextIdx] } : d);
        await saveDonations(updated);
    };

    const handleFeedback = async (donationId, rating, comment) => {
        const updated = donations.map(d => d.id === donationId ? { ...d, feedback: { rating, comment } } : d);
        await saveDonations(updated);
    };

    const banUser = async (userId) => {
        const u = users.find(x => x.id === userId);
        if (!u) return;
        if (!confirm(`Are you sure you want to ban ${u.name}?`)) return;
        u.status = 'banned';
        const newUsers = users.map(x => x.id === userId ? u : x);
        setUsers(newUsers);
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: JSON.stringify(newUsers) })
        });
    };

    if (loading || !user) {
        return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
    }

    // Active Data Math
    const mealsReceived = donations.filter(d => d.status === 'delivered').reduce((acc, curr) => acc + (curr.quantityKg * 3), 0);
    const totalCo2Saved = donations.filter(d => d.status === 'delivered').reduce((acc, curr) => acc + (curr.co2Saved || 0), 0);
    const expiringSoon = donations.filter(d => d.status === 'available' && (new Date(d.expiryAt) - new Date()) < 7200000 && (new Date(d.expiryAt) - new Date()) > 0);

    // Leaderboard Calculation
    const topUsers = [...users].map(u => {
        let xp = 0;
        if (u.role === 'donor') xp = donations.filter(d => d.donorId === u.id).reduce((s, d) => s + d.quantityKg * 10, 0);
        if (u.role === 'volunteer') xp = donations.filter(d => d.volunteerId === u.id && d.status === 'delivered').length * 250;
        if (u.role === 'ngo') xp = donations.filter(d => d.ngoId === u.id && d.status === 'delivered').reduce((s, d) => s + d.quantityKg * 5, 0);
        return { ...u, xp: Math.round(xp) };
    }).filter(u => u.xp > 0 && u.role !== 'admin').sort((a, b) => b.xp - a.xp).slice(0, 5);

    const myXp = topUsers.find(u => u.id === user.id)?.xp || 0;
    const myTier = myXp > 2000 ? 'Platinum' : myXp > 500 ? 'Gold' : 'Silver';
    const effectiveRole = user.role;

    return (
        <div className="flex h-screen bg-bg text-white font-sans overflow-hidden">

            {/* Modals for Niche Features */}
            <AnimatePresence>
                {showEasterEgg && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} exit={{ scale: 0 }} className="bg-gradient-to-br from-amber-500 to-pink-600 p-12 rounded-[50px] text-center shadow-[0_0_100px_rgba(251,191,36,0.6)] border-4 border-white/20">
                            <ChefHat className="w-32 h-32 mx-auto text-white mb-6 animate-bounce" />
                            <h1 className="text-5xl md:text-6xl font-display font-black text-white drop-shadow-2xl mb-4">SPECIAL THANKS</h1>
                            <p className="text-xl md:text-2xl font-bold text-white/90 uppercase tracking-[0.5em] md:tracking-[1em]">TO PARAKH</p>
                            <p className="mt-6 text-white/80 font-medium">For inspiring resilience and innovation in the Harvest Network.</p>
                            <button onClick={() => setShowEasterEgg(false)} className="mt-10 bg-white text-pink-600 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition">Return to Mission</button>
                        </motion.div>
                    </div>
                )}
                {activeCert && <CertificateModal d={activeCert} onClose={() => setActiveCert(null)} />}
                {activeShare && <SocialImpactModal d={activeShare} onClose={() => setActiveShare(null)} />}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <aside className="w-64 bg-surface border-r border-border flex flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3 border-b border-border">
                    <div className="bg-primary/20 p-2 rounded-xl border border-primary/30"><Leaf className="text-primary w-6 h-6" /></div>
                    <div><h1 className="font-display font-bold text-lg leading-tight tracking-wide">HARVEST</h1><p className="text-[10px] text-primary tracking-widest uppercase">Network</p></div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label={effectiveRole === 'donor' ? 'Donor Hub' : effectiveRole === 'volunteer' ? 'Courier Dispatch' : effectiveRole === 'ngo' ? 'Shelter Operations' : 'Dashboard'}
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />

                    {effectiveRole === 'donor' && (
                        <NavItem icon={<Gift size={20} />} label="Donate Surplus" active={activeTab === 'donate'} onClick={() => setActiveTab('donate')} />
                    )}

                    {effectiveRole === 'ngo' && (
                        <NavItem icon={<Search size={20} />} label="Find Food" active={activeTab === 'find'} onClick={() => setActiveTab('find')} />
                    )}

                    {effectiveRole === 'volunteer' && (
                        <NavItem icon={<Truck size={20} />} label="Deliveries" active={activeTab === 'deliveries'} onClick={() => setActiveTab('deliveries')} />
                    )}

                    {effectiveRole === 'admin' && (
                        <>
                            <NavItem icon={<Activity size={20} />} label="Live Dispatch" active={activeTab === 'dispatch'} onClick={() => setActiveTab('dispatch')} />
                            <NavItem icon={<Users size={20} />} label="Manage Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                            <NavItem icon={<FileText size={20} />} label="System Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                        </>
                    )}
                    <NavItem icon={<History size={20} />} label="ESG & History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                    <NavItem icon={<Trophy size={20} />} label="Leaderboards" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="bg-bg border border-border rounded-xl p-3 mb-4">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Your Impact Level</div>
                        <div className="font-bold flex items-center gap-2 text-sm"><Shield className={`w-4 h-4 ${myTier === 'Platinum' ? 'text-blue-400' : myTier === 'Gold' ? 'text-amber-400' : 'text-gray-400'}`} /> {myTier} Tier</div>
                        <div className="mt-2 w-full bg-surface-hover h-1.5 rounded-full overflow-hidden"><div className="bg-primary h-full" style={{ width: `${(myXp % 1000) / 10}%` }}></div></div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full p-2"><LogOut size={20} /><span className="font-medium">Sign Out</span></button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                <header className="bg-surface/50 backdrop-blur-md px-6 md:px-8 py-4 flex flex-wrap justify-between items-center z-10 border-b border-border gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold flex items-center gap-2">Welcome, {user.name}</h2>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider">
                            {user.role}
                        </span>
                    </div>

                    {/* Official Role Lock Indicator */}
                    <div className="flex items-center gap-2 bg-bg/90 border border-border px-3.5 py-1.5 rounded-2xl text-xs shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
                            {user.role === 'donor' && '🎁 Donor Portal'}
                            {user.role === 'volunteer' && '🏃 Courier Dispatch'}
                            {user.role === 'ngo' && '🤝 Shelter Operations'}
                            {user.role === 'admin' && '👑 System Administrator'}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/30">{user.name.charAt(0)}</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto space-y-8 pb-20">

                        {/* Donor Page View (Framer Motion Rich) */}
                        {(activeTab === 'dashboard' || activeTab === 'donate') && effectiveRole === 'donor' && (
                            <DonorPage user={user} donations={donations} onSaveDonations={saveDonations} isEmbedded={true} />
                        )}

                        {/* Volunteer Page View (Framer Motion Rich) */}
                        {(activeTab === 'dashboard' || activeTab === 'deliveries') && effectiveRole === 'volunteer' && (
                            <VolunteerPage user={user} donations={donations} onSaveDonations={saveDonations} isEmbedded={true} />
                        )}

                        {/* NGO Page View (Framer Motion Rich) */}
                        {(activeTab === 'dashboard' || activeTab === 'find') && effectiveRole === 'ngo' && (
                            <NgoPage user={user} donations={donations} onSaveDonations={saveDonations} isEmbedded={true} />
                        )}

                        {/* Admin Overview (shown when admin is active) */}
                        {activeTab === 'dashboard' && effectiveRole === 'admin' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard value={donations.filter(d => d.status === 'available').length} label="Available Surpluses" icon={<Gift />} />
                                    <StatCard value={Math.round(mealsReceived)} label="Meals Received" icon={<ChefHat />} />
                                    <StatCard value={donations.filter(d => d.status === 'delivered').length} label="Completed Rescues" icon={<CheckCircle />} />
                                    <StatCard value={totalCo2Saved.toFixed(1) + ' Kg'} label="Global CO₂ Saved" icon={<BarChart3 />} glow />
                                </div>
                                <FeedList title="Global Live Surplus Feed" donations={donations.filter(d => d.status === 'available')} action={acceptDonation} actionText="Dispatch" />
                            </motion.div>
                        )}

                        {/* Admin Live Dispatch & Heatmap (Mock UI) */}
                        {activeTab === 'dispatch' && user.role === 'admin' && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="border border-border bg-surface rounded-3xl overflow-hidden shadow-2xl relative h-[600px] flex flex-col">
                                <div className="p-5 border-b border-border bg-surface-hover flex justify-between items-center z-10">
                                    <h3 className="font-bold flex items-center gap-2"><MapPin className="text-blue-500" /> Uber-Style Live Tracking Mesh</h3>
                                    <div className="flex gap-4 text-xs font-bold"><span className="text-primary flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-ping"></span> Live</span></div>
                                </div>
                                <div className="flex-1 bg-[#050505] relative overflow-hidden flex items-center justify-center">
                                    {/* Grid / Roads Graphic */}
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)' }}></div>
                                    {/* Radar */}
                                    <div className="absolute w-[600px] h-[600px] border border-primary/20 rounded-full flex items-center justify-center pointer-events-none">
                                        <div className="absolute w-[400px] h-[400px] border border-primary/30 rounded-full"></div>
                                        <div className="absolute w-[200px] h-[200px] border border-primary/50 rounded-full"></div>
                                        <div className="absolute w-full h-[2px] bg-primary/20 animate-spin" style={{ animationDuration: '5s' }}></div>
                                    </div>
                                    {/* Map Markers */}
                                    <MapMarker t="top-[30%] left-[40%]" ping color="bg-primary" label="Surplus Density: High" />
                                    <MapMarker t="top-[60%] left-[65%]" ping color="bg-red-500" label="Deficit Zone: Critical" />
                                    <MapMarker t="top-[45%] left-[50%]" color="bg-blue-400" label="Truck-04 (Arriving)" isTruck />
                                </div>
                            </motion.div>
                        )}

                        {/* History, ESG Certificates & Social Share */}
                        {activeTab === 'history' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2"><Shield size={24} className="text-primary" /> ESG Fulfillment Ledgers</h3>
                                {(!donations || donations.filter(d => d?.status === 'delivered' && (d?.donorId === user?.id || d?.ngoId === user?.id || d?.volunteerId === user?.id || user?.role === 'admin')).length === 0) ? (
                                    <div className="text-center text-gray-500 py-12 border border-border border-dashed rounded-2xl bg-surface-hover/30 text-sm font-medium">
                                        No ESG History found. Complete deliveries to earn ESG Certificates.
                                    </div>
                                ) : (
                                    donations.filter(d => d?.status === 'delivered' && (d?.donorId === user?.id || d?.ngoId === user?.id || d?.volunteerId === user?.id || user?.role === 'admin')).map(d => (
                                        <div key={d.id} className="bg-surface border border-border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/30 transition">
                                            <div>
                                                <h4 className="font-bold text-lg">{d.foodName} <span className="text-sm font-normal text-gray-500 px-2 py-0.5 bg-bg rounded-full ml-2">{d.quantityKg} Kg</span></h4>
                                                <div className="flex gap-4 mt-2">
                                                    <p className="text-xs text-gray-500 flex flex-col gap-1"><span className="uppercase text-[9px] tracking-widest">Donor</span> {d?.donorName}</p>
                                                    <p className="text-xs text-gray-500 flex flex-col gap-1 items-center border-l border-r border-border px-4"><span className="uppercase text-[9px] tracking-widest">Volunteer</span> {d?.volunteerName}</p>
                                                    <p className="text-xs text-gray-500 flex flex-col gap-1 text-right"><span className="uppercase text-[9px] tracking-widest">Received</span> {d?.ngoName}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
                                                {(user?.role === 'donor' || user?.role === 'admin') && (
                                                    <button onClick={() => setActiveCert(d)} className="flex items-center gap-2 bg-emerald-900/40 text-emerald-400 border border-emerald-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-900/60 transition"><FileKey size={14} /> ESG Certificate</button>
                                                )}

                                                <button onClick={() => setActiveShare(d)} className="flex items-center gap-2 bg-blue-900/40 text-blue-400 border border-blue-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-900/60 transition"><Share2 size={14} /> Brag Impact</button>

                                                {d?.feedback ? (
                                                    <div className="bg-bg border border-border px-4 py-2 rounded-xl flex items-center gap-2">
                                                        <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs"><Star size={12} fill="currentColor" /> {d.feedback.rating}/5</span>
                                                    </div>
                                                ) : (user?.role === 'ngo' || user?.role === 'donor') ? (
                                                    <button onClick={() => {
                                                        const rt = prompt('Rate from 1 to 5');
                                                        const cmt = prompt('Leave a comment (Optional)');
                                                        if (rt && parseInt(rt)) handleFeedback(d.id, parseInt(rt), cmt || '');
                                                    }} className="text-xs bg-surface-hover hover:bg-border text-white px-4 py-2 rounded-xl font-bold border border-border transition">Rate Dropoff</button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {/* System Reports */}
                        {activeTab === 'reports' && user?.role === 'admin' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2"><FileText size={24} className="text-primary" /> System Reports</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard value={donations?.length || 0} label="Total Donations" icon={<Gift />} />
                                    <StatCard value={donations?.filter(d => d?.status === 'delivered')?.length || 0} label="Successful Deliveries" icon={<CheckCircle />} />
                                    <StatCard value={(totalCo2Saved || 0).toFixed(1) + ' Kg'} label="Total CO₂ Saved" icon={<BarChart3 />} />
                                </div>
                                <div className="bg-surface border border-border rounded-3xl p-6 mt-6">
                                    <h4 className="font-bold text-lg mb-4">Platform Activity</h4>
                                    <p className="text-gray-400 flex justify-between py-2 border-b border-border"><span>Total Users:</span> <span className="text-white font-bold">{users?.length || 0}</span></p>
                                    <p className="text-gray-400 flex justify-between py-2 border-b border-border"><span>Total Donors:</span> <span className="text-white font-bold">{users?.filter(u => u?.role === 'donor')?.length || 0}</span></p>
                                    <p className="text-gray-400 flex justify-between py-2 border-b border-border"><span>Total NGOs:</span> <span className="text-white font-bold">{users?.filter(u => u?.role === 'ngo')?.length || 0}</span></p>
                                    <p className="text-gray-400 flex justify-between py-2"><span>Total Volunteers:</span> <span className="text-white font-bold">{users?.filter(u => u?.role === 'volunteer')?.length || 0}</span></p>
                                </div>
                            </motion.div>
                        )}

                        {/* Leaderboards */}
                        {activeTab === 'leaderboard' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
                                <div className="text-center mb-10">
                                    <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">Global Impact Champions</h2>
                                    <p className="text-gray-400">Competitive ESG leaderboards updated in real-time.</p>
                                </div>
                                <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-orange-400"></div>
                                    <div className="divide-y divide-border">
                                        {topUsers.map((u, i) => (
                                            <div key={u.id} className={`p-6 flex items-center gap-6 ${i === 0 ? 'bg-gradient-to-r from-amber-500/10 to-transparent' : ''} hover:bg-surface-hover transition`}>
                                                <div className={`w-12 h-12 flex flex-col items-center justify-center font-display font-bold text-2xl rounded-full ${i === 0 ? 'text-amber-400 bg-amber-400/10' : i === 1 ? 'text-gray-300 bg-gray-300/10' : i === 2 ? 'text-orange-400 bg-orange-400/10' : 'text-gray-600'}`}>
                                                    {i === 0 ? <Trophy size={28} /> : `#${i + 1}`}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-xl font-bold">{u.name} <span className="uppercase text-[9px] tracking-widest text-gray-500 ml-2 border border-border px-2 py-0.5 rounded-full">{u.role}</span></h4>
                                                    <p className="text-sm text-gray-400 mt-1">Level {Math.floor(u.xp / 1000) + 1} Waste Warrior</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold font-display text-primary">{u.xp.toLocaleString()} <span className="text-[10px] text-gray-500">XP</span></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Admin Other Views */}
                        {activeTab === 'users' && user.role === 'admin' && (
                            <div className="bg-surface border border-border rounded-2xl overflow-hidden"><div className="p-6 border-b border-border"><h3 className="font-bold text-lg">System Users</h3></div>
                                <div className="divide-y divide-border">{users.map(u => (
                                    <div key={u.id} className="p-4 flex justify-between items-center hover:bg-surface-hover">
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {u.name}
                                                <span className="uppercase text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">{u.role}</span>
                                                {u.status === 'banned' && <span className="uppercase text-[10px] bg-red-900/50 text-red-500 px-2 py-0.5 rounded">Banned</span>}
                                            </div>
                                            <div className="text-xs text-gray-400">{u.email}</div>
                                        </div>
                                        {u.role === 'donor' && u.status !== 'banned' && (
                                            <button onClick={() => banUser(u.id)} className="bg-red-900/40 text-red-500 hover:bg-red-900/80 px-3 py-1.5 rounded-lg text-xs font-bold transition">Ban Donor</button>
                                        )}
                                    </div>
                                ))}</div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// ----- Subcomponents & Modals -----

function StatCard({ value, label, icon, glow }) {
    return (
        <div className={`bg-surface p-6 rounded-3xl border flex flex-col justify-center gap-3 relative overflow-hidden ${glow ? 'border-primary/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-border shadow-md'}`}>
            {glow && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${glow ? 'bg-primary/20 text-primary' : 'bg-bg border border-border text-gray-400'}`}>{icon}</div>
            <div>
                <div className={`text-4xl font-display font-bold ${glow ? 'text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-white'}`}>{value}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{label}</div>
            </div>
        </div>
    );
}

function FeedList({ title, donations, action, actionText, noAction, aiRecipeGenerator }) {
    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-lg">
            <div className="p-6 border-b border-border flex justify-between items-center bg-surface-hover">
                <h3 className="font-bold text-lg tracking-tight">{title}</h3>
                <span className="bg-bg text-gray-400 text-xs py-1 px-4 rounded-full font-bold border border-border shadow-inner">{donations.length} Active</span>
            </div>
            <div className="divide-y divide-border">
                {donations.length === 0 && <div className="p-12 text-center text-gray-500 text-sm font-medium tracking-wide border-t border-border border-dashed">The ecosystem is quiet right now.</div>}
                {[...donations].reverse().map((d) => (
                    <FeedItem key={d.id} d={d} action={action} actionText={actionText} noAction={noAction} aiRecipeGenerator={aiRecipeGenerator} />
                ))}
            </div>
        </div>
    );
}

function FeedItem({ d, action, actionText, noAction, aiRecipeGenerator }) {
    return (
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-surface-hover transition-colors">
            <div className="flex gap-5 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/5 ${d.hasImage ? 'bg-gray-800' : 'bg-bg text-gray-600'}`}>
                    {d.hasImage ? <span className="text-[10px] text-gray-500 text-center uppercase tracking-widest font-bold">Photo</span> : <Gift className="w-6 h-6" />}
                </div>
                <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-[17px] flex items-center gap-2 text-gray-100">
                        {d.foodName}
                        {d.aiPredictionHours && <span className="text-[9px] uppercase tracking-widest bg-emerald-950 text-emerald-400 px-2 py-1 rounded-md border border-emerald-900 flex items-center gap-1 shadow-sm"><ShieldAlert size={10} /> AI Expiry ~{d.aiPredictionHours}h</span>}
                    </h4>
                    <p className="text-sm text-gray-400">Qty: <strong className="text-primary tracking-wide">{d.quantityKg} Kg</strong> <span className="mx-2 text-border">|</span> Provider: <span className="text-gray-300 font-medium">{d.donorName}</span></p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium tracking-wide"><MapPin size={12} className="text-gray-600" /> {d.pickupAddress || 'No location'}</p>
                </div>
            </div>
            <div className="flex w-full md:w-auto justify-end items-center gap-4">
                {aiRecipeGenerator && <button onClick={() => aiRecipeGenerator(d)} className="hidden md:flex bg-bg border border-border text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold items-center gap-2 transition shadow-sm"><ChefHat size={14} /> AI Recipe</button>}
                {!noAction && action && (
                    <button onClick={() => action(d.id)} className="w-full md:w-auto bg-primary text-bg hover:bg-primary-light px-7 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                        {actionText}
                    </button>
                )}
            </div>
        </div>
    );
}

function DeliveryProgressList({ title, donations, advanceDelivery }) {
    const steps = ['assigned', 'pickedUp', 'onTheWay', 'reached', 'delivered'];
    const formatStep = (step) => step.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    // IoT Mock hook
    const [mockTemp, setMockTemp] = useState(3.2);
    useEffect(() => {
        const int = setInterval(() => setMockTemp((3.1 + Math.random() * 0.5).toFixed(1)), 3000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-lg">
            <div className="p-6 border-b border-border bg-gradient-to-r from-surface-hover to-surface"><h3 className="font-bold text-lg">{title}</h3></div>
            <div className="p-6 space-y-8">
                {donations.length === 0 && <div className="text-center text-gray-500 py-12 text-sm font-medium tracking-wide">Fleet is idle. No active dispatches.</div>}

                {donations.map(d => {
                    const currentStepIdx = steps.indexOf(d.status);
                    const requiresIoT = d.foodType === 'Cooked Food Packets';
                    return (
                        <div key={d.id} className="bg-bg border border-border rounded-2xl p-6 relative overflow-visible shadow-inner">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className="font-bold text-xl flex items-center gap-3">
                                        {d.foodName}
                                        <button className="bg-surface border border-border p-2 rounded-lg hover:bg-surface-hover hover:border-primary group relative transition-colors shadow-sm">
                                            <QrCode size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface text-gray-300 text-[10px] px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none whitespace-nowrap border border-border flex items-center gap-2"><QrCode size={12} /> Scan NGO Dropoff Key</span>
                                        </button>
                                    </h4>
                                    <p className="text-sm text-gray-400 mt-2 flex items-center gap-2"><MapPin size={14} className="text-gray-600" /> <span className="text-gray-300 line-clamp-1">{d.pickupAddress}</span> <span className="mx-2 text-border">→</span> <Truck size={14} className="text-gray-600" /> To: <span className="text-white font-medium">{d.ngoName}</span></p>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    {currentStepIdx < steps.length - 1 && (
                                        <button onClick={() => advanceDelivery(d.id, d.status)} className="bg-white text-bg px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition shadow-[0_5px_15px_rgba(255,255,255,0.1)]">
                                            Log Transit '{formatStep(steps[currentStepIdx + 1])}'
                                        </button>
                                    )}
                                    {requiresIoT && <div className="text-[10px] font-bold text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded-md border border-blue-900/50 flex items-center gap-1 shadow-inner"><ThermometerSnowflake size={12} /> {mockTemp}°C Safe</div>}
                                </div>
                            </div>

                            <div className="relative pt-2 px-1">
                                <div className="overflow-hidden h-2 mb-4 flex rounded-full bg-surface border border-border shadow-inner">
                                    <div style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }} className="shadow-[0_0_15px_rgba(16,185,129,0.8)] flex flex-col text-center whitespace-nowrap justify-center bg-primary transition-all duration-700 ease-out"></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                                    {steps.map((s, i) => (
                                        <span key={s} className={i <= currentStepIdx ? 'text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-colors' : ''}>{formatStep(s)}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MapMarker({ t, label, ping, isTruck }) {
    return (
        <div className={`absolute ${t} flex flex-col items-center gap-1`}>
            {isTruck ? <Truck className="text-blue-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> :
                <div className="relative">
                    {ping && <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-60"></div>}
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
                </div>
            }
            <div className="bg-surface/90 backdrop-blur text-[9px] font-bold text-gray-300 px-2 py-1 rounded border border-border whitespace-nowrap">{label}</div>
        </div>
    );
}

function CertificateModal({ d, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-surface border border-border rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
                <div className="text-center mb-8 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-900"><Shield className="text-primary w-8 h-8" /></div>
                    <div><h2 className="text-2xl font-display font-bold">Cryptographic ESG Certificate</h2><p className="text-xs text-gray-400 tracking-wider">HARVEST.NETWORK BLOCKCHAIN REGISTRY</p></div>
                </div>
                <div className="bg-bg border border-border rounded-2xl p-6 font-mono text-sm text-gray-400 space-y-4 shadow-inner">
                    <div className="flex justify-between border-b border-border pb-3"><span>TX_HASH:</span><span className="text-primary">0x{Math.random().toString(16).slice(2, 10)}...e74b</span></div>
                    <div className="flex justify-between border-b border-border pb-3"><span>DONOR:</span><span className="text-white">{d.donorName}</span></div>
                    <div className="flex justify-between border-b border-border pb-3"><span>COMMODITY:</span><span className="text-white">{d.quantityKg} Kg {d.foodName}</span></div>
                    <div className="flex justify-between border-b border-border pb-3"><span>CO₂ OFFSET:</span><span className="text-primary font-bold">{d.co2Saved} Kg</span></div>
                    <div className="flex justify-between"><span>TIMESTAMP:</span><span className="text-white">{new Date(d.createdAt).toISOString()}</span></div>
                </div>
                <button className="mt-8 w-full bg-primary text-bg font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">Download Certified PDF</button>
            </motion.div>
        </div>
    );
}

function SocialImpactModal({ d, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.9, rotate: 2 }} className="bg-surface border border-border rounded-3xl p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-bg w-8 h-8 rounded-full z-10 flex items-center justify-center shadow-lg">✕</button>

                {/* Instagram Post Simulation */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 aspect-square rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                    <Leaf className="absolute -right-10 -top-10 w-48 h-48 text-white opacity-10 pointer-events-none" />
                    <div>
                        <h4 className="text-white/80 text-xs font-bold tracking-widest uppercase mb-1 drop-shadow-md">My Impact Today</h4>
                        <div className="text-4xl font-display font-bold text-white drop-shadow-md leading-tight">Saved {d.quantityKg} Kg of Food Waste.</div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">
                        <div className="flex justify-between items-center"><span className="text-white/80 text-xs font-medium">CO₂ Emissions Averted:</span><span className="font-bold text-white text-lg">{d.co2Saved} Kg</span></div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10"><span className="text-white/80 text-xs font-medium">Platform:</span><span className="font-bold text-white tracking-widest text-xs">HARVEST.NETWORK</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition text-sm">Share on 𝕏</button>
                    <button className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition text-sm shadow-md">Instagram Story</button>
                </div>
            </motion.div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' : 'text-gray-400 hover:bg-surface-hover hover:text-white'}`}>
            {icon}
            <span className="tracking-wide">{label}</span>
        </button>
    );
}
