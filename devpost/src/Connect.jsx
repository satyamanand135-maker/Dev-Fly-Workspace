import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Linkedin, Twitter, Instagram, Hash, Check,
  ArrowRight, Zap, Github, ChevronRight, X
} from "lucide-react";

const PLATFORMS = [
  {
    id: "linkedin", name: "LinkedIn", icon: Linkedin,
    color: "#0A66C2", glow: "rgba(10,102,194,0.25)", border: "rgba(10,102,194,0.35)", bg: "rgba(10,102,194,0.06)",
    description: "Long-form posts, career narratives & thought leadership",
    audience: "Professionals & recruiters",
  },
  {
    id: "x", name: "X (Twitter)", icon: Twitter,
    color: "#fff", glow: "rgba(255,255,255,0.15)", border: "rgba(255,255,255,0.2)", bg: "rgba(255,255,255,0.04)",
    description: "Punchy threads, hot takes & real-time dev updates",
    audience: "Dev community & tech Twitter",
  },
  {
    id: "reddit", name: "Reddit", icon: Hash,
    color: "#FF4500", glow: "rgba(255,69,0,0.2)", border: "rgba(255,69,0,0.3)", bg: "rgba(255,69,0,0.05)",
    description: "Community posts to r/programming, r/webdev & more",
    audience: "Hacker communities & devs",
  },
  {
    id: "instagram", name: "Instagram", icon: Instagram,
    color: "#E1306C", glow: "rgba(225,48,108,0.2)", border: "rgba(225,48,108,0.3)", bg: "rgba(225,48,108,0.05)",
    description: "Aesthetic code snippets, carousel posts & dev lifestyle",
    audience: "Visual learners & creators",
  },
];

// 📦 Floating background ecosystem animation
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 600, h: 600, t: -150, l: -150, color: "#0d9488", op: 0.08 },
        { w: 500, h: 500, b: -100, r: -100, color: "#92400e", op: 0.07 },
        { w: 400, h: 400, t: "40%", r: "5%",  color: "#1d4ed8", op: 0.06 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.w, height: o.h,
            top: o.t, left: o.l, bottom: o.b, right: o.r,
            background: `radial-gradient(ellipse, ${o.color} 0%, transparent 70%)`,
            opacity: o.op, filter: "blur(60px)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [o.op, o.op * 1.4, o.op] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
        />
      ))}
    </div>
  );
}

// 📦 Individual Social Media Connect Node Matrix
function PlatformCard({ platform, connected, connecting, onConnect, onDisconnect }) {
  const [hovered, setHovered] = useState(false);
  const Icon = platform.icon;

  return (
    <motion.div
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ y: hovered ? -3 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        border: connected ? `1px solid ${platform.border}` : hovered ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
        background: connected ? platform.bg : hovered ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
        boxShadow: connected ? `0 0 24px ${platform.glow}` : "none",
        transition: "border 0.3s, background 0.3s, box-shadow 0.3s",
      }}
    >
      {connected && (
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${platform.color}80, transparent)` }}
        />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: connected ? `${platform.color}18` : "rgba(255,255,255,0.05)",
                border: connected ? `1px solid ${platform.color}35` : "1px solid rgba(255,255,255,0.08)",
                boxShadow: connected ? `0 0 12px ${platform.glow}` : "none",
                transition: "all 0.3s",
              }}
            >
              <Icon size={18} color={connected ? platform.color : "rgba(255,255,255,0.35)"} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-sans text-sm font-medium" style={{ color: connected ? "#fff" : "rgba(255,255,255,0.7)" }}>
                  {platform.name}
                </p>
                {connected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${platform.color}18`, color: platform.color, border: `1px solid ${platform.color}35` }}
                  >
                    Connected
                  </motion.span>
                )}
              </div>
              <p className="font-sans text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{platform.description}</p>
              <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{platform.audience}</p>
            </div>
          </div>

          <div className="shrink-0 mt-1">
            {connected ? (
              <button
                onClick={() => onDisconnect(platform.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", background: "transparent", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "rgba(239,68,68,0.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
              >
                <X size={10} /> Disconnect
              </button>
            ) : (
              <motion.button
                onClick={() => onConnect(platform.id)}
                disabled={connecting === platform.id}
                whileTap={{ scale: connecting === platform.id ? 1 : 0.96 }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans text-xs font-medium"
                style={{
                  background: connecting === platform.id ? "rgba(255,255,255,0.06)" : hovered ? "#fff" : "rgba(255,255,255,0.08)",
                  color: connecting === platform.id ? "rgba(255,255,255,0.4)" : hovered ? "#000" : "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  transition: "all 0.2s",
                  cursor: connecting === platform.id ? "not-allowed" : "pointer",
                }}
              >
                {connecting === platform.id ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block">◌</motion.span>
                    Connecting…
                  </>
                ) : (
                  <>Connect <ChevronRight size={10} /></>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 📦 MAIN CONTAINER COMPONENT
export default function Connect() {
  const [connected, setConnected] = useState([]);
  const [connecting, setConnecting] = useState(null);

  // 🛠️ CHANGED: Read and track ALL live platform cookies on component mount
  useEffect(() => {
    const activeIntegrations = [];
    const cookies = document.cookie;

    if (cookies.includes("li_access_token")) activeIntegrations.push("linkedin");
    if (cookies.includes("x_access_token")) activeIntegrations.push("x");
    if (cookies.includes("reddit_access_token")) activeIntegrations.push("reddit");

    setConnected(activeIntegrations);
  }, []);

  // 🛠️ CHANGED: Swapped out mock timers for genuine server authentication routes
  const handleConnect = (id) => {
    setConnecting(id);

    if (id === "linkedin") {
      window.location.href = "http://localhost:5000/api/auth/connect/linkedin";
    } else if (id === "x") {
      window.location.href = "http://localhost:5000/api/auth/connect/x";
    } else if (id === "reddit") {
      window.location.href = "http://localhost:5000/api/auth/connect/reddit";
    } else {
      // Instagram simulation loop until Meta APIs are verified
      setTimeout(() => {
        setConnecting(null);
        setConnected((prev) => [...prev, id]);
      }, 1000);
    }
  };

  // 🛠️ CHANGED: Cleanly drop target tokens from cookie registry on disconnect
  const handleDisconnect = (id) => {
    if (id === "linkedin") {
      document.cookie = "li_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    } else if (id === "x") {
      document.cookie = "x_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    } else if (id === "reddit") {
      document.cookie = "reddit_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    }
    setConnected((prev) => prev.filter((c) => c !== id));
  };

  const canContinue = connected.length >= 1;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-12" style={{ background: "#000" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .font-sans  { font-family: 'DM Sans', sans-serif; }
        .font-mono  { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <FloatingOrbs />

      <div className="relative z-10 w-full max-w-xl mx-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>
              <Zap size={13} color="#34d399" />
            </div>
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>DevPost</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {[{ label: "GitHub", done: true }, { label: "Socials", active: true }, { label: "Dashboard", done: false }].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: step.done ? "rgba(52,211,153,0.15)" : step.active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                      border: step.done ? "1px solid rgba(52,211,153,0.4)" : step.active ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {step.done ? <Check size={9} color="#34d399" /> : <span className="font-mono text-xs" style={{ color: step.active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }}>{i + 1}</span>}
                  </div>
                  <span className="font-mono text-xs" style={{ color: step.done ? "rgba(52,211,153,0.7)" : step.active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
                    {step.label}
                  </span>
                </div>
                {i < 2 && <div className="w-6 h-px mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />}
              </div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}
          >
            <Github size={12} color="#34d399" />
            <span className="font-mono text-xs" style={{ color: "#34d399" }}>GitHub connected</span>
            <Check size={10} color="#34d399" />
          </motion.div>

          <h1 className="font-serif text-4xl leading-tight mb-3" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
            Where do you<br /><em style={{ color: "rgba(255,255,255,0.5)" }}>post your work?</em>
          </h1>
          <p className="font-sans text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Connect at least one platform. You can add more later.</p>
        </motion.div>

        <div className="flex flex-col gap-3 mb-6">
          {PLATFORMS.map((platform, i) => (
            <motion.div key={platform.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <PlatformCard platform={platform} connected={connected.includes(platform.id)} connecting={connecting} onConnect={handleConnect} onDisconnect={handleDisconnect} />
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {connected.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
              <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
                <span className="font-sans text-xs" style={{ color: "rgba(52,211,153,0.8)" }}>
                  {connected.length} platform{connected.length > 1 ? "s" : ""} connected — ready to start publishing
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col gap-3">
          <motion.button
            onClick={() => { window.location.href = "/dashboard"; }}
            disabled={!canContinue}
            whileTap={{ scale: canContinue ? 0.98 : 1 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-sans font-medium text-sm"
            style={{
              background: canContinue ? "#fff" : "rgba(255,255,255,0.05)",
              color: canContinue ? "#000" : "rgba(255,255,255,0.2)",
              border: canContinue ? "none" : "1px solid rgba(255,255,255,0.07)",
              boxShadow: canContinue ? "0 0 30px rgba(255,255,255,0.1)" : "none",
              cursor: canContinue ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
            }}
          >
            Go to Dashboard <ArrowRight size={14} />
          </motion.button>

          <button
            onClick={() => { window.location.href = "/dashboard"; }}
            className="w-full py-2.5 font-sans text-sm"
            style={{ color: "rgba(255,255,255,0.2)", background: "transparent", border: "none", cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
          >
            Skip for now — I'll connect later
          </button>
        </motion.div>
      </div>
    </div>
  );
}