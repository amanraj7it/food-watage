import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function AnimatedBackground({ showGrid = true, showParticles = true }) {
    // Mouse coordinates for interactive ambient spotlight
    const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 300);

    const springConfig = { damping: 25, stiffness: 120 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Precomputed particle seeds for stable rendering
    const [particles] = useState(() =>
        Array.from({ length: 28 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1.5,
            duration: Math.random() * 8 + 6,
            delay: Math.random() * 4,
            opacity: Math.random() * 0.4 + 0.15,
            driftX: (Math.random() - 0.5) * 40,
        }))
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
            {/* Deep Dark Base */}
            <div className="absolute inset-0 bg-[#07090e]" />

            {/* Interactive Mouse Spotlight Glow */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px] opacity-20 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
                style={{
                    left: smoothMouseX,
                    top: smoothMouseY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Ambient Animated Orb 1 - Top Left (Emerald) */}
            <motion.div
                className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[130px] opacity-25 bg-gradient-to-br from-emerald-500 to-teal-700"
                animate={{
                    x: [0, 60, -40, 0],
                    y: [0, 50, -30, 0],
                    scale: [1, 1.15, 0.95, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Ambient Animated Orb 2 - Center Right (Cyan / Deep Teal) */}
            <motion.div
                className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 bg-gradient-to-tl from-cyan-500 via-emerald-600 to-transparent"
                animate={{
                    x: [0, -80, 30, 0],
                    y: [0, 80, -40, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />

            {/* Ambient Animated Orb 3 - Bottom Left (Lime / Forest Glow) */}
            <motion.div
                className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 bg-gradient-to-tr from-teal-500 to-emerald-400"
                animate={{
                    x: [0, 70, -50, 0],
                    y: [0, -60, 40, 0],
                    scale: [1, 1.1, 0.92, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 4,
                }}
            />

            {/* Ambient Animated Orb 4 - Bottom Right (Golden Amber Spark) */}
            <motion.div
                className="absolute -bottom-20 -right-20 w-[420px] h-[420px] rounded-full blur-[140px] opacity-10 bg-gradient-to-tl from-amber-500 via-emerald-500 to-transparent"
                animate={{
                    x: [0, -40, 50, 0],
                    y: [0, -50, 30, 0],
                    scale: [1, 1.25, 1],
                }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                }}
            />

            {/* Fine Tech Dot/Grid Overlay with Radial Fade */}
            {showGrid && (
                <div
                    className="absolute inset-0 opacity-[0.14]"
                    style={{
                        backgroundImage: `radial-gradient(rgba(52, 211, 153, 0.45) 1px, transparent 1px)`,
                        backgroundSize: '36px 36px',
                        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
                    }}
                />
            )}

            {/* Flowing Subtle Grid Lines */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)`,
                    backgroundSize: '96px 96px',
                }}
            />

            {/* Floating Micro Particles (Framer Motion) */}
            {showParticles && (
                <div className="absolute inset-0">
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute rounded-full bg-emerald-300"
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                width: p.size,
                                height: p.size,
                                boxShadow: '0 0 10px rgba(52, 211, 153, 0.7)',
                            }}
                            animate={{
                                y: ['0px', '-120px', '-240px'],
                                x: [0, p.driftX, 0],
                                opacity: [0, p.opacity, 0],
                                scale: [0.8, 1.3, 0.6],
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: p.delay,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Vignette / Edge Softener */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07090e]/30 to-[#07090e] pointer-events-none" />
        </div>
    );
}
