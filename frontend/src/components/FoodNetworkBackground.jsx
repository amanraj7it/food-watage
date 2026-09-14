import React, { useEffect, useRef } from 'react';

export default function FoodNetworkBackground({ canvasRef }) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        let w, h;
        let animationFrameId;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Nodes representing distribution centers
        const nodes = [];
        const numNodes = Math.floor((w * h) / 18000);
        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1.5,
            });
        }

        const packets = [];

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(10, 14, 23, 0.4)';
            ctx.fillRect(0, 0, w, h);

            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;
            });

            ctx.lineWidth = 1;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 180) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(60, 200, 100, ${1 - dist / 180})`;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();

                        if (Math.random() < 0.003) {
                            packets.push({
                                p1: nodes[i], p2: nodes[j],
                                progress: 0,
                                speed: 0.005 + Math.random() * 0.015
                            });
                        }
                    }
                }
            }

            nodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffb347';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffb347';
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            for (let i = packets.length - 1; i >= 0; i--) {
                const p = packets[i];
                p.progress += p.speed;
                if (p.progress >= 1) {
                    packets.splice(i, 1);
                    continue;
                }
                const px = p.p1.x + (p.p2.x - p.p1.x) * p.progress;
                const py = p.p1.y + (p.p2.y - p.p1.y) * p.progress;

                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffffff';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [canvasRef]);

    return null;
}
