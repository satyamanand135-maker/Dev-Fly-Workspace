import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Github, Linkedin, Twitter, Copy, RefreshCw, Send,
  ChevronDown, Check, Zap, TrendingUp, Flame, Search,
  Edit3, Instagram, Hash, MessageSquare
} from "lucide-react";

const PLATFORMS = ["X", "LinkedIn", "Reddit", "Instagram"];

const PLATFORM_ICONS = {
  X: Twitter,
  LinkedIn: Linkedin,
  Reddit: Hash,
  Instagram: Instagram,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlowOrb({ color, style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: color,
        filter: "blur(80px)",
        opacity: 0.12,
        ...style,
      }}
    />
  );
}

// 🆕 Modified IntegrationBadge to support clickable connection points
function IntegrationBadge({ name, icon: Icon, active, connectUrl }) {
  const isClickable = !active && connectUrl;
  
  const content = (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono tracking-wide ${
        isClickable ? "hover:border-zinc-600 hover:bg-white/5 transition-colors cursor-pointer" : ""
      }`}
      style={{
        borderColor: active ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)",
        background: active ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
        color: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: active ? "#34d399" : "rgba(255,255,255,0.2)",
          boxShadow: active ? "0 0 6px #34d399" : "none",
        }}
      />
      <Icon size={11} />
      <span>{name}</span>
    </div>
  );

  if (isClickable) {
    return <a href={connectUrl}>{content}</a>;
  }
  return content;
}

function CommitCard({ commit, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ y: hovered ? -2 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative rounded-xl border p-4 cursor-pointer overflow-hidden"
      style={{
        borderColor: selected
          ? "rgba(52,211,153,0.4)"
          : hovered
          ? "rgba(255,255,255,0.15)"
          : "rgba(255,255,255,0.06)",
        background: selected
          ? "rgba(52,211,153,0.04)"
          : hovered
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.015)",
        boxShadow: selected ? "0 0 20px rgba(52,211,153,0.08)" : "none",
      }}
      onClick={() => onSelect(commit.id)}
    >
      {selected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(52,211,153,0.04) 0%, transparent 60%)",
          }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="font-mono text-xs px-2 py-0.5 rounded"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.05em",
              }}
            >
              {commit.sha}
            </span>
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {commit.time}
            </span>
          </div>
          <p
            className="text-sm leading-relaxed font-mono"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {commit.message}
          </p>
          <p
            className="text-xs mt-1.5"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {commit.files} files changed
          </p>
        </div>

        <AnimatePresence>
          {(hovered || selected) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={
                selected
                  ? {
                      background: "rgba(52,211,153,0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.4)",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }
              }
            >
              {selected ? (
                <>
                  <Check size={11} />
                  SELECTED
                </>
              ) : (
                "Select"
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DevPost() {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);

  const [generatedDrafts, setGeneratedDrafts] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [repoOpen, setRepoOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const [activePlatform, setActivePlatform] = useState("X");
  const [copied, setCopied] = useState(false);
  
  // 🆕 Real-time operational states
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState({ success: null, msg: "" });

  const [isXConnected, setIsXConnected] = useState(false);
  const [isRedditConnected, setIsRedditConnected] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  // 🆕 Check account integration connections via cookie presence
  useEffect(() => {
    const hasLinkedInToken = document.cookie.includes("li_access_token");
    setIsLinkedInConnected(hasLinkedInToken);
  }, [generatedDrafts]);

  // Pipeline 1: Fetch Workspace Repositories
  useEffect(() => {
    axios.get("http://localhost:5000/api/github/repos", { withCredentials: true })
      .then((response) => {
        setRepositories(response.data);
        if (response.data.length > 0) {
          setSelectedRepo(response.data[0]); 
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error wiring up dropdown repositories data:", error);
        setIsLoading(false);
      });
  }, []);

  // Pipeline 2: Auto-fetch commit logs
  useEffect(() => {
    if (!selectedRepo) return;

    setIsLoadingCommits(true);
    setSelectedCommit(null);   
    setGeneratedDrafts(null);   

    axios.get(`http://localhost:5000/api/github/repos/${selectedRepo.name}/commits`, { withCredentials: true })
      .then((response) => {
        setCommits(response.data);
        setIsLoadingCommits(false);
      })
      .catch((error) => {
        console.error("Error loading commit logs for selected repository:", error);
        setIsLoadingCommits(false);
      });
  }, [selectedRepo]);

  // Pipeline 3: Handover metadata to Gemini AI Engine
  const handleCommitSelection = async (commitId) => {
    setSelectedCommit(commitId);
    setIsGenerating(true);
    setGeneratedDrafts(null);
    setIsEditing(false);

    const activeCommit = commits.find(c => c.id === commitId);

    try {
      const response = await axios.post("http://localhost:5000/api/ai/generate-drafts", {
        repo_name: selectedRepo.name,
        commit_sha: activeCommit?.sha,
        commit_message: activeCommit?.message
      }, { withCredentials: true });

      setGeneratedDrafts(response.data.drafts);
    } catch (error) {
      console.error("AI Post composer optimization thread crashed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 🆕 Local Inline Content Revision
  const handleTextEdit = (newText) => {
    setGeneratedDrafts(prev => ({
      ...prev,
      [activePlatform]: newText
    }));
  };

  // 🆕 Live Broadcast Distribution
  const handlePublish = async () => {
    if (activePlatform !== "LinkedIn") {
      alert(`Automated direct publishing for ${activePlatform} is under integration. Copy the text to post manually for now!`);
      return;
    }

    setIsPublishing(true);
    setPublishStatus({ success: null, msg: "" });

    try {
      const response = await axios.post("http://localhost:5000/api/publish/linkedin", {
        text: generatedDrafts[activePlatform]
      }, { withCredentials: true });

      if (response.data.success) {
        setPublishStatus({ success: true, msg: "Broadcast Successful!" });
        setTimeout(() => setPublishStatus({ success: null, msg: "" }), 4000);
      }
    } catch (err) {
      console.error("Distribution execution failure:", err);
      const errMsg = err.response?.data?.error || "Publish configuration missing.";
      setPublishStatus({ success: false, msg: errMsg });
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredRepos = repositories.filter((r) =>
    r.name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  const handleCopy = () => {
    const activeText = generatedDrafts ? generatedDrafts[activePlatform] : "";
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <RefreshCw size={24} className="animate-spin text-emerald-400" />
        <span className="font-mono text-xs text-neutral-500 tracking-widest uppercase">
          Mapping Engineering Workspace...
        </span>
      </div>
    );
  }

  // 🆕 Map dynamic parameters into badges
  const INTEGRATIONS = [
    { 
    name: "LinkedIn", 
    icon: Linkedin, 
    active: isLinkedInConnected, 
    connectUrl: "http://localhost:5000/api/auth/connect/linkedin" 
  },
  { 
    name: "X (Twitter)", 
    icon: Twitter, 
    active: isXConnected, 
    connectUrl: "http://localhost:5000/api/auth/connect/x" // 👈 Add backend route
  },
  { 
    name: "Reddit", 
    icon: MessageSquare, 
    active: isRedditConnected, 
    connectUrl: "http://localhost:5000/api/auth/connect/reddit" // 👈 Add backend route
  },
  { 
    name: "Instagram", 
    icon: Instagram, 
    active: isInstagramConnected, 
    connectUrl: "http://localhost:5000/api/auth/connect/instagram" // 👈 Add backend route
  },
  ];

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background: "#000",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-serif-display { font-family: 'DM Serif Display', Georgia, serif; }
        .font-mono-sharp { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans-clean { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Background Atmosphere Orbs */}
      <GlowOrb color="radial-gradient(ellipse, #0d9488 0%, transparent 70%)" style={{ width: 600, height: 600, top: -200, left: -100 }} />
      <GlowOrb color="radial-gradient(ellipse, #1d4ed8 0%, transparent 70%)" style={{ width: 500, height: 500, top: 100, right: -100 }} />
      <GlowOrb color="radial-gradient(ellipse, #92400e 0%, transparent 70%)" style={{ width: 400, height: 400, bottom: 0, right: 200 }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)" }}>
                <Zap size={14} color="#34d399" />
              </div>
              <span className="font-mono-sharp text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                DevPost
              </span>
            </div>
            <div className="flex items-center gap-2">
              {INTEGRATIONS.map((i) => <IntegrationBadge key={i.name} {...i} />)}
            </div>
          </div>

          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
              className="font-serif-display text-5xl leading-tight mb-3" style={{ color: "#fff", letterSpacing: "-0.02em" }}
            >
              Turn Raw Commits Into
              <br />
              <em style={{ color: "rgba(255,255,255,0.65)" }}>Viral Social Capital.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}
              className="font-sans-clean text-base" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.01em" }}
            >
              The Agent-First Dev-to-Creator Pipeline.
            </motion.p>
          </div>
        </motion.header>

        {/* ── Main Workspace Grid ── */}
        <div className="flex gap-5" style={{ minHeight: 640 }}>

          {/* ── Left Panel: Repository Ecosystem (40%) ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="w-[40%] flex flex-col gap-4"
          >
            <div className="rounded-2xl border p-5 relative" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <p className="font-mono-sharp text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                Repository
              </p>

              <button
                onClick={() => setRepoOpen(!repoOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left"
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
              >
                <div>
                  <p className="font-sans-clean text-sm font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {selectedRepo ? selectedRepo.name : "No repositories discovered"}
                  </p>
                  <p className="font-mono-sharp text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {selectedRepo ? `${selectedRepo.language || 'Unknown'} · ★ ${selectedRepo.stars}` : 'Connect your account'}
                  </p>
                </div>
                <motion.div animate={{ rotate: repoOpen ? 180 : 0 }}>
                  <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
                </motion.div>
              </button>

              <AnimatePresence>
                {repoOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} exit={{ opacity: 0, y: -8, scaleY: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute left-5 right-5 z-50 mt-2 rounded-xl border overflow-hidden shadow-2xl max-h-60 overflow-y-auto"
                    style={{ borderColor: "rgba(255,255,255,0.1)", background: "#0a0a0a", top: "100%" }}
                  >
                    <div className="p-2 border-b sticky top-0 bg-[#0a0a0a] z-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-2 px-2">
                        <Search size={12} color="rgba(255,255,255,0.3)" />
                        <input
                          className="flex-1 bg-transparent text-sm outline-none" style={{ color: "rgba(255,255,255,0.7)" }}
                          placeholder="Search repos…" value={repoSearch} onChange={(e) => setRepoSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {filteredRepos.length === 0 ? (
                      <div className="px-4 py-3 font-mono text-xs text-neutral-600">No repositories match query</div>
                    ) : (
                      filteredRepos.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => { setSelectedRepo(r); setRepoOpen(false); setRepoSearch(""); }}
                          className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/5 text-left"
                        >
                          <span className="font-sans-clean text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{r.name}</span>
                          <span className="font-mono-sharp text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{r.language || 'Plain'}</span>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 rounded-2xl border p-5 overflow-hidden flex flex-col" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <p className="font-mono-sharp text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                Recent Commits · {selectedRepo ? selectedRepo.name : 'Loading'}
              </p>

              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                <div className="relative h-full flex flex-col">
                  <div className="absolute top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(52,211,153,0.3), rgba(52,211,153,0.03))", left: -1 }} />
                  
                  {isLoadingCommits ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 font-mono text-xs text-neutral-600">
                      <RefreshCw size={14} className="animate-spin text-emerald-500" />
                      <span>Reading commit history logs...</span>
                    </div>
                  ) : commits.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center font-mono text-xs text-neutral-600 text-center leading-relaxed">
                      // No recent commits discovered <br /> on this repository node
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 pl-0">
                      {commits.map((commit, i) => (
                        <motion.div key={commit.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                          <CommitCard
                            commit={commit}
                            selected={selectedCommit === commit.id}
                            onSelect={handleCommitSelection}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right Panel: AI Generation Stage (60%) ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="flex-1 flex flex-col gap-4"
          >
            <div className="rounded-2xl border p-1.5 flex gap-1 relative" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              {PLATFORMS.map((p) => {
                const Icon = PLATFORM_ICONS[p];
                const isActive = activePlatform === p;
                return (
                  <button key={p} onClick={() => { setActivePlatform(p); setIsEditing(false); }} className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl z-10">
                    {isActive && (
                      <motion.div
                        layoutId="tab-bg" className="absolute inset-0 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <Icon size={13} color={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"} />
                    <span className="font-sans-clean text-sm font-medium relative z-10" style={{ color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}>
                      {p}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="flex-1 rounded-2xl border overflow-hidden relative flex flex-col"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "linear-gradient(135deg, rgba(13,148,136,0.04) 0%, rgba(0,0,0,0) 40%, rgba(29,78,216,0.04) 100%)",
              }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: isGenerating || isPublishing ? "#f59e0b" : generatedDrafts ? "#34d399" : "#737373" }}
                  />
                  <span className="font-mono-sharp text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {isPublishing ? "Publishing Active" : `AI Draft · ${activePlatform}`}
                  </span>
                </div>
                {selectedCommit && (
                  <span className="font-mono-sharp text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                    {commits.find((c) => c.id === selectedCommit)?.sha}
                  </span>
                )}
              </div>

              {/* Central Text Area Viewport */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full w-full flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs"
                    >
                      <Zap size={16} className="animate-bounce text-amber-400" />
                      <span>LLM processing code transformations & compiling post matrices...</span>
                    </motion.div>
                  ) : generatedDrafts ? (
                    // 🆕 Toggled layout mapping dynamically from standard text block into live active editable input
                    isEditing ? (
                      <motion.textarea
                        key="editing-stage"
                        value={generatedDrafts[activePlatform]}
                        onChange={(e) => handleTextEdit(e.target.value)}
                        className="w-full h-full bg-zinc-950/40 text-sm font-sans-clean leading-relaxed p-4 border border-zinc-800 rounded-xl text-zinc-200 focus:border-zinc-700 focus:outline-none resize-none"
                      />
                    ) : (
                      <motion.pre
                        key={activePlatform} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25, ease: "easeOut" }}
                        className="whitespace-pre-wrap font-sans-clean text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}
                      >
                        {generatedDrafts[activePlatform]}
                      </motion.pre>
                    )
                  ) : (
                    <motion.div
                      key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-full w-full flex items-center justify-center text-neutral-600 font-mono text-xs text-center leading-relaxed"
                    >
                      // Select an active repository code modification <br /> commit log to ignite social channel drafts
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Composer Controls */}
              <div className="px-6 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
                <div className="flex items-center gap-2">
                  {/* 🆕 Toggle Edit/Save Mode Button */}
                  <button
                    disabled={!generatedDrafts}
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ 
                      border: isEditing ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)", 
                      color: isEditing ? "#34d399" : "rgba(255,255,255,0.5)", 
                      background: isEditing ? "rgba(52,211,153,0.04)" : "transparent" 
                    }}
                  >
                    <Edit3 size={11} /> {isEditing ? "Save Workspace" : "Edit Draft"}
                  </button>
                  <button
                    disabled={!selectedCommit || isGenerating}
                    onClick={() => handleCommitSelection(selectedCommit)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", background: "transparent" }}
                  >
                    <RefreshCw size={11} /> Regenerate
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!generatedDrafts}
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.12)",
                      color: copied ? "#34d399" : "rgba(255,255,255,0.6)",
                      background: copied ? "rgba(52,211,153,0.06)" : "transparent",
                    }}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  {/* 🆕 Live Distribution Engine Trigger Button */}
                  <motion.button
                    disabled={!generatedDrafts || isPublishing}
                    onClick={handlePublish}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: publishStatus.success === true ? "rgba(52,211,153,0.15)" : publishStatus.success === false ? "rgba(239,68,68,0.15)" : "#fff",
                      color: publishStatus.success === true ? "#34d399" : publishStatus.success === false ? "#ef4444" : "#000",
                      border: publishStatus.success !== null ? `1px solid ${publishStatus.success ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}` : "none",
                      boxShadow: "0 0 20px rgba(255,255,255,0.1)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {isPublishing ? (
                      <><RefreshCw size={12} className="animate-spin" /> Staging Call...</>
                    ) : publishStatus.success !== null ? (
                      <>{publishStatus.success ? <Check size={12} /> : <Zap size={12} />} {publishStatus.msg}</>
                    ) : (
                      <><Send size={12} /> One-Click Publish</>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Analytics Workspace Status Footer ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-5 rounded-2xl border p-6 overflow-hidden relative" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(13,148,136,0.04) 0%, transparent 50%, rgba(146,64,14,0.04) 100%)" }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-12">
              {[
                { label: "Potential Impressions", value: "15,000+", icon: TrendingUp, accent: "#34d399" },
                { label: "Developer Streak", value: "12 Days", icon: Flame, accent: "#f97316" },
                { label: "Posts This Month", value: "47", icon: Zap, accent: "#60a5fa" },
                { label: "Avg. Engagement Rate", value: "6.2%", icon: TrendingUp, accent: "#a78bfa" },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
                    <CyberpunkGridIcon Icon={Icon} accent={accent} />
                  </div>
                  <div>
                    <p className="font-serif-display text-2xl leading-none" style={{ color: "#fff" }}>{value}</p>
                    <p className="font-sans-clean text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
              <span className="font-mono-sharp text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                All systems operational
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function CyberpunkGridIcon({ Icon, accent }) {
  return <Icon size={16} color={accent} />;
}