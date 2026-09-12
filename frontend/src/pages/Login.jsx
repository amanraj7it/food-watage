import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlass } from '../components/LiquidGlass';
import FoodNetworkBackground from '../components/FoodNetworkBackground';
import '../index.css';

const GLASS_OPTIONS = {
    shape: 'roundedrect',
    rx: 28,
    distort: 0.12,
    edgeCurl: 0.08,
    brightness: 0.10,
    specular: 0.35,
    border: 0.3,
    borderWidth: 2,
};

export default function Login() {
    const bgCanvasRef = useRef(null);
    const glassCanvasRef = useRef(null);
    const sceneRef = useRef(null);
    const cardRef = useRef(null);

    const navigate = useNavigate();

    const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot' | 'verify' | 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('donor');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let glass = null;
        let animationId;

        const initGlass = () => {
            if (!bgCanvasRef.current || !glassCanvasRef.current || !sceneRef.current || !cardRef.current) return;

            const sceneR = sceneRef.current.getBoundingClientRect();
            const cardR = cardRef.current.getBoundingClientRect();
            const W = Math.round(cardR.width);
            const H = Math.round(cardR.height);
            const isMobile = W < 640;
            const D = isMobile ? W : Math.max(W, H);

            glassCanvasRef.current.width = D;
            glassCanvasRef.current.height = D;

            glass = new LiquidGlass(bgCanvasRef.current, Object.assign({}, GLASS_OPTIONS, {
                size: D,
                sceneW: sceneR.width,
                sceneH: sceneR.height
            }));

            const renderGlass = () => {
                if (glass && bgCanvasRef.current && sceneRef.current && cardRef.current && glassCanvasRef.current) {
                    const cRect = cardRef.current.getBoundingClientRect();
                    const sRect = sceneRef.current.getBoundingClientRect();
                    const cx = cRect.left - sRect.left + cRect.width / 2;
                    const cy = cRect.top - sRect.top + cRect.height / 2;
                    glass.render(glassCanvasRef.current, cx, cy, sRect.width, sRect.height);
                }
                animationId = requestAnimationFrame(renderGlass);
            };
            renderGlass();
        };

        const timeout = setTimeout(initGlass, 100);
        window.addEventListener('resize', initGlass);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', initGlass);
            cancelAnimationFrame(animationId);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('hl_session', JSON.stringify({ userId: data.user.id, role: data.user.role }));
                navigate('/dashboard');
                window.location.reload();
            } else {
                alert(data.message || 'Error occurred');
            }
        } catch (e) {
            alert('Server error.');
        }
        setLoading(false);
    };

    const handleSendOTP = async (e, mode) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, mode })
            });
            const data = await res.json();
            if (data.ok) {
                if (mode === 'register') setView('verify');
                if (mode === 'forgot') setView('reset');
            } else {
                alert(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            alert('Server error');
        }
        setLoading(false);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, name, password, role })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('hl_session', JSON.stringify({ userId: data.user.id, role: data.user.role }));
                navigate('/dashboard');
                window.location.reload();
            } else {
                alert(data.message || 'Invalid code');
            }
        } catch (err) { alert('Server error'); }
        setLoading(false);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                alert('Password successfully updated.');
                setView('login');
            } else {
                alert(data.message || 'Invalid code');
            }
        } catch (err) { alert('Server error'); }
        setLoading(false);
    };

    const variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div ref={sceneRef} className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-gray-900 font-sans">
            <canvas ref={bgCanvasRef} className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />
            <FoodNetworkBackground canvasRef={bgCanvasRef} />

            <div ref={cardRef} className="relative w-full max-w-[420px] min-h-[460px] mx-4 rounded-[28px] overflow-visible shadow-2xl z-10 p-8 text-white flex flex-col justify-center">
                <canvas ref={glassCanvasRef} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: -1 }} />

                <AnimatePresence mode="wait">
                    {view === 'login' && (
                        <motion.div key="login" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
                            <h1 className="text-3xl font-display font-bold mb-6 text-center tracking-tight">Sign In</h1>
                            <div className="mb-4">
                                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all font-medium" />
                            </div>
                            <div className="mb-6">
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all font-medium" />
                            </div>
                            <button onClick={handleLogin} disabled={loading} className="w-full bg-primary hover:bg-primary-light text-white rounded-xl py-3.5 font-bold transition-colors mb-6 shadow-lg">
                                {loading ? 'Logging in...' : 'Login into Account'}
                            </button>
                            <div className="flex justify-between text-sm font-medium">
                                <button onClick={() => setView('forgot')} className="text-white/80 hover:text-white hover:underline transition-all">Forgot password?</button>
                                <button onClick={() => setView('register')} className="text-white/80 hover:text-white hover:underline transition-all">Create an account</button>
                            </div>
                        </motion.div>
                    )}

                    {view === 'register' && (
                        <motion.div key="register" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
                            <h1 className="text-2xl font-display font-bold mb-4 text-center">Register</h1>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {['donor', 'ngo', 'volunteer'].map(r => (
                                    <div key={r} onClick={() => setRole(r)} className={`cursor-pointer border border-white/20 rounded-lg p-2 text-center text-xs font-semibold transition-all ${role === r ? 'bg-primary border-primary text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                                        {r === 'donor' && '🎁 Donor'}
                                        {r === 'ngo' && '🤝 NGO'}
                                        {r === 'volunteer' && '🏃 Vol'}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 mb-6">
                                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20" />
                                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20" />
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20" />
                            </div>
                            <button onClick={e => handleSendOTP(e, 'register')} disabled={loading} className="w-full bg-primary hover:bg-primary-light text-white rounded-xl py-3.5 font-bold transition-colors mb-4">
                                {loading ? 'Sending Code...' : 'Create Account'}
                            </button>
                            <div className="text-center">
                                <button onClick={() => setView('login')} className="text-sm font-medium text-white/80 hover:text-white hover:underline transition-all">Already have an account? Sign in</button>
                            </div>
                        </motion.div>
                    )}

                    {view === 'verify' && (
                        <motion.div key="verify" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center text-center">
                            <h1 className="text-2xl font-display font-bold mb-2">Check your email</h1>
                            <p className="text-sm text-white/70 mb-6">We've sent a 4-digit code to <span className="font-bold text-white">{email}</span>.</p>
                            <input type="text" placeholder="4-digit code" maxLength="4" value={code} onChange={e => setCode(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 text-center tracking-[8px] text-lg font-bold mb-6" />
                            <button onClick={handleVerify} disabled={loading} className="w-full bg-primary hover:bg-primary-light text-white rounded-xl py-3.5 font-bold transition-colors mb-4">
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                            <button onClick={() => setView('register')} className="text-sm font-medium text-white/80 hover:text-white hover:underline transition-all">Back to register</button>
                        </motion.div>
                    )}

                    {view === 'forgot' && (
                        <motion.div key="forgot" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
                            <h1 className="text-2xl font-display font-bold mb-2 text-center">Reset Password</h1>
                            <p className="text-sm text-white/70 mb-6 text-center">Enter your email address and we'll send you a 4-digit reset code.</p>
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 mb-6" />
                            <button onClick={e => handleSendOTP(e, 'forgot')} disabled={loading} className="w-full bg-primary hover:bg-primary-light text-white rounded-xl py-3.5 font-bold transition-colors mb-4">
                                {loading ? 'Sending Code...' : 'Send Reset Code'}
                            </button>
                            <div className="text-center"><button onClick={() => setView('login')} className="text-sm font-medium text-white/80 hover:text-white hover:underline transition-all">Back to login</button></div>
                        </motion.div>
                    )}

                    {view === 'reset' && (
                        <motion.div key="reset" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center text-center">
                            <h1 className="text-2xl font-display font-bold mb-2">New Password</h1>
                            <p className="text-sm text-white/70 mb-6">Code sent to <span className="font-bold text-white">{email}</span>.</p>
                            <input type="text" placeholder="4-digit code" maxLength="4" value={code} onChange={e => setCode(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 text-center tracking-[8px] text-lg font-bold mb-4" />
                            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 mb-6" />
                            <button onClick={handleReset} disabled={loading} className="w-full bg-primary hover:bg-primary-light text-white rounded-xl py-3.5 font-bold transition-colors mb-4">
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                            <button onClick={() => setView('login')} className="text-sm font-medium text-white/80 hover:text-white hover:underline transition-all">Back to login</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Creators Footer */}
            <div className="absolute bottom-6 left-0 w-full text-center text-white/60 text-[18px] md:text-s font-medium z-10 pointer-events-none">
                <p className="tracking-[0.2em] uppercase mb-2 opacity-80">Created By</p>
                <div className="flex justify-center gap-3 md:gap-4 flex-wrap max-w-3xl mx-auto px-4 opacity-90 drop-shadow-lg">
                    <span className="hover:text-white transition-colors pointer-events-auto cursor-default">Aman Raj</span>
                    <span className="text-white/30">&bull;</span>
                    <span className="hover:text-white transition-colors pointer-events-auto cursor-default">Bhakti Tyagi</span>
                    <span className="text-white/30">&bull;</span>
                    <span className="hover:text-white transition-colors pointer-events-auto cursor-default">Divya Sri KP</span>
                    <span className="text-white/30">&bull;</span>
                    <span className="hover:text-white transition-colors pointer-events-auto cursor-default">Harish P</span>
                    <span className="text-white/30">&bull;</span>
                    <span className="hover:text-white transition-colors pointer-events-auto cursor-default">Bhaviya A</span>
                    <span className="text-white/30">&bull;</span>
                    <span className="hover:text-white transition-colors pointer-events-auto cursor-default">Samyuktha</span>
                </div>
            </div>
        </div>
    );
}
