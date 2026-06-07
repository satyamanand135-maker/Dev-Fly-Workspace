import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Zap, ArrowRight, Shield, GitBranch, Star } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ─── Animated Canvas Background ─────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COMMIT_MSGS = [
      "feat: auth middleware", "fix: token validation", "refactor: OAuth2",
      "chore: bump deps", "feat: Redis cache", "fix: rate limiting",
      "feat: pipeline v2", "docs: update README", "perf: 10x latency", "fix: memory leak"
    ];

    const nodes = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 1,
      label: i < 10 ? COMMIT_MSGS[i] : null,
      sha: Math.random().toString(16).slice(2, 9),
      opacity: Math.random() * 0.5 + 0.1,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const rings = Array.from({ length: 3 }, (_, i) => ({
      cx: canvas.width * (0.15 + i * 0.35),
      cy: canvas.height * (0.2 + (i % 2) * 0.5),
      radius: 80 + i * 60,
      speed: 0.0003 + i * 0.0002,
      angle: (i * Math.PI * 2) / 3,
      dotCount: 6 + i * 3,
    }));

    const blobs = [
      { cx: canvas.width * 0.1,  cy: canvas.height * 0.2,  r: 180, color: "#0d9488", phase: 0 },
      { cx: canvas.width * 0.85, cy: canvas.height * 0.75, r: 220, color: "#92400e", phase: 2 },
      { cx: canvas.width * 0.7,  cy: canvas.height * 0.15, r: 150, color: "#1d4ed8", phase: 4 },
    ];

    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobs.forEach((b) => {
        const t = frame * 0.008 + b.phase;
        const gradient = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.r);
        gradient.addColorStop(0, b.color + "18");
        gradient.addColorStop(1, "transparent");

        ctx.save();
        ctx.beginPath();
        const pts = 6;
        for (let i = 0; i <= pts; i++) {
          const angle = (i / pts) * Math.PI * 2;
          const wobble = b.r * (0.85 + 0.15 * Math.sin(t + i * 1.3));
          const x = b.cx + Math.cos(angle) * wobble;
          const y = b.cy + Math.sin(angle) * wobble;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.filter = "blur(40px)";
        ctx.fill();
        ctx.filter = "none";
        ctx.restore();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(52,211,153,${0.06 * (1 - dist / 160)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + n.pulsePhase);
        const alpha = n.opacity * (0.6 + 0.4 * pulse);

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${alpha})`;
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 8 * pulse;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (n.label && n.radius > 2) {
          ctx.font = "10px JetBrains Mono, monospace";
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
          ctx.fillText(n.sha, n.x + 6, n.y - 6);
        }
      });

      rings.forEach((ring) => {
        ring.angle += ring.speed;
        ctx.beginPath();
        ctx.arc(ring.cx, ring.cy, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 12]);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let d = 0; d < ring.dotCount; d++) {
          const a = ring.angle + (d / ring.dotCount) * Math.PI * 2;
          const dx = ring.cx + Math.cos(a) * ring.radius;
          const dy = ring.cy + Math.sin(a) * ring.radius;
          const size = d === 0 ? 3 : 1.5;
          const glow = d === 0;

          ctx.beginPath();
          ctx.arc(dx, dy, size, 0, Math.PI * 2);
          ctx.fillStyle = glow ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.15)";
          if (glow) {
            ctx.shadowColor = "#34d399";
            ctx.shadowBlur = 10;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      nodes.forEach((n, i) => {
        if (!n.label) return;
        const alpha = n.opacity * 0.45;
        const t = frame * 0.015 + i;
        const floatY = n.y + Math.sin(t) * 8;

        ctx.font = "9px JetBrains Mono, monospace";
        const w = ctx.measureText(n.label).width + 16;
        const h = 18;
        const rx = n.x - w / 2;
        const ry = floatY - h / 2;

        ctx.beginPath();
        ctx.roundRect(rx, ry, w, h, 9);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.06})`;
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.12})`;
        ctx.lineWidth = 0.5;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
        ctx.fillText(n.label, rx + 8, ry + 12);
      });
    };

    let animId;
    const loop = () => { draw(); animId = requestAnimationFrame(loop); };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}

// ─── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: GitBranch, text: "Auto-sync all your repositories" },
  { icon: Star,      text: "Zero setup, instant access" },
  { icon: Shield,    text: "Read-only permissions, always secure" },
];

// ─── Main Login ──────────────────────────────────────────────────────────────
export default function Login() {
  const [hovered, setHovered] = useState(false);
  const [phase, setPhase]     = useState(0); // 0 idle · 1 loading/authenticating

  // 🔌 REAL GITHUB OAUTH HANDSHAKE HANDLER
  const handleLogin = () => {
    setPhase(1); // Set button state to 'Authenticating...'

    // Replace this string with your real GitHub Client ID from Developer Settings
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID; 
    const REDIRECT_URI = `${API_BASE_URL}/api/auth/callback/github`;
    const SCOPE = "repo,read:user"; 

    // Kickoff the structural context handover to GitHub
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "#000" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .font-sans  { font-family: 'DM Sans', sans-serif; }
        .font-mono  { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md mx-4 z-10"
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.1) 0%, transparent 65%)",
            filter: "blur(24px)",
            transform: "scale(1.12)",
          }}
        />

        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.09)",
            background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.6) 100%)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.6) 50%, transparent)",
            }}
          />

          <div className="p-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex items-center gap-2.5 mb-10"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.25)",
                  boxShadow: "0 0 16px rgba(52,211,153,0.12)",
                }}
              >
                <Zap size={15} color="#34d399" />
              </div>
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                DevPost
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mb-8"
            >
              <h1
                className="font-serif text-4xl leading-tight mb-3"
                style={{ color: "#fff", letterSpacing: "-0.02em" }}
              >
                Welcome back,
                <br />
                <em style={{ color: "rgba(255,255,255,0.5)" }}>creator.</em>
              </h1>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                Connect your GitHub to start turning commits
                <br />into content that actually lands.
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col gap-2.5 mb-9"
            >
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}
                  >
                    <Icon size={11} color="#34d399" />
                  </div>
                  <span className="font-sans text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* GitHub button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.button
                onClick={handleLogin}
                disabled={phase > 0}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                whileTap={{ scale: 0.98 }}
                className="relative w-full flex items-center justify-center gap-3 py-4 rounded-2xl overflow-hidden font-sans font-medium text-sm"
                style={{
                  background: hovered ? "rgba(255,255,255,0.95)" : "#fff",
                  color: "#000",
                  boxShadow: hovered
                    ? "0 0 40px rgba(255,255,255,0.18)"
                    : "0 0 20px rgba(255,255,255,0.08)",
                  transition: "all 0.3s ease",
                  letterSpacing: "0.01em",
                  cursor: phase > 0 ? "not-allowed" : "pointer",
                }}
              >
                <AnimatePresence mode="wait">
                  {phase === 0 ? (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                      <Github size={18} />
                      Continue with GitHub
                      <motion.div animate={{ x: hovered ? 4 : 0 }} transition={{ type: "spring", stiffness: 400 }}>
                        <ArrowRight size={14} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Github size={18} />
                      </motion.div>
                      Authenticating…
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>OR</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>

            <button
              className="w-full py-3 rounded-2xl font-sans text-sm font-medium"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.35)",
                background: "transparent",
                letterSpacing: "0.01em",
                cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
            >
              Continue as Guest (demo mode)
            </button>

            <p className="font-sans text-xs text-center mt-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.18)" }}>
              By signing in you agree to our{" "}
              <span className="underline cursor-pointer" style={{ color: "rgba(255,255,255,0.35)" }}>Terms</span>{" "}
              and{" "}
              <span className="underline cursor-pointer" style={{ color: "rgba(255,255,255,0.35)" }}>Privacy Policy</span>.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 font-mono text-xs"
        style={{ color: "rgba(255,255,255,0.1)", letterSpacing: "0.12em" }}
      >
        DEVPOST · AGENT-FIRST DEV-TO-CREATOR PIPELINE
      </motion.p>
    </div>
  );
}