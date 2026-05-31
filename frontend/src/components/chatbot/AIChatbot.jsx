import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, X, Send, Minimize2, Maximize2,
  TrendingUp, Briefcase, Newspaper,
  ChevronDown, Loader2, BarChart2, AlertTriangle
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STRATEGIES = ["ICT", "Smart Money Concept (SMC)", "Price Action", "Fibonacci", "Moving Average", "Custom"];
const MODES = [
  { id: "trading",   label: "Trading Analysis",      icon: TrendingUp,  color: "#a3e635" },
  { id: "portfolio", label: "Portfolio Guidance",     icon: Briefcase,   color: "#38bdf8" },
  { id: "news",      label: "News & Sentiment",       icon: Newspaper,   color: "#f472b6" },
];

const RISK_COLORS = { Low: "#a3e635", Medium: "#facc15", High: "#f87171", "Very High": "#ef4444" };

function RiskBadge({ level }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
      style={{ color: RISK_COLORS[level] || "#fff", borderColor: RISK_COLORS[level] || "#fff", opacity: 0.9 }}>
      <AlertTriangle size={9} /> {level}
    </span>
  );
}

function SignalBadge({ signal }) {
  const colors = { Buy: { bg: "#a3e63520", border: "#a3e635", text: "#a3e635" }, Sell: { bg: "#ef444420", border: "#ef4444", text: "#ef4444" }, Hold: { bg: "#facc1520", border: "#facc15", text: "#facc15" } };
  const c = colors[signal] || colors.Hold;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      <BarChart2 size={11} /> {signal}
    </span>
  );
}

// ─── Message Renderer ────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary/10 border border-white/15 px-4 py-2.5 text-sm text-foreground/90">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.type === "trading" && msg.data) {
    const d = msg.data;
    return (
      <div className="mb-3">
        <div className="rounded-2xl rounded-bl-sm bg-[#0f1a0f]/80 border border-border p-4 text-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <SignalBadge signal={d.signal} />
            {d.riskLevel && <RiskBadge level={d.riskLevel} />}
          </div>
          {d.explanation && (
            <p className="text-foreground/80 text-xs leading-relaxed">{d.explanation}</p>
          )}
          {d.reasoning && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Reasoning</div>
              <p className="text-foreground/70 text-xs leading-relaxed">{d.reasoning}</p>
            </div>
          )}
          {d.sentimentSummary && (
            <div className="rounded-lg bg-primary/5 border border-white/8 p-3">
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Market Sentiment</div>
              <p className="text-foreground/70 text-xs">{d.sentimentSummary}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (msg.type === "portfolio" && msg.data) {
    const d = msg.data;
    return (
      <div className="mb-3">
        <div className="rounded-2xl rounded-bl-sm bg-[#0a1520]/80 border border-border p-4 text-sm space-y-3">
          {d.investmentGuide && (
            <p className="text-foreground/80 text-xs leading-relaxed">{d.investmentGuide}</p>
          )}
          {d.allocations && d.allocations.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Asset Allocation</div>
              <div className="space-y-1.5">
                {d.allocations.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="text-foreground/70 text-xs w-14 shrink-0">{a.asset}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                      <div className="h-full rounded-full bg-sky-400" style={{ width: `${a.pct}%` }} />
                    </div>
                    <div className="text-foreground/50 text-[10px] w-8 text-right">{a.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.dcaAdvice && (
            <div className="rounded-lg bg-primary/5 border border-white/8 p-3">
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">DCA Strategy</div>
              <p className="text-foreground/70 text-xs">{d.dcaAdvice}</p>
            </div>
          )}
          {d.riskyCoins && d.riskyCoins.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-red-400/70 mr-1">Risky:</span>
              {d.riskyCoins.map(c => (
                <span key={c} className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">{c}</span>
              ))}
            </div>
          )}
          {d.safeCoins && d.safeCoins.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-green-400/70 mr-1">Safer long-term:</span>
              {d.safeCoins.map(c => (
                <span key={c} className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/15 text-green-400 border border-green-500/20">{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (msg.type === "news" && msg.data) {
    const d = msg.data;
    const sentimentColor = d.overallSentiment?.toLowerCase().includes("bull") ? "#a3e635" : d.overallSentiment?.toLowerCase().includes("bear") ? "#ef4444" : "#facc15";
    return (
      <div className="mb-3">
        <div className="rounded-2xl rounded-bl-sm bg-[#1a0f1a]/80 border border-border p-4 text-sm space-y-3">
          {d.overallSentiment && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40">Sentiment:</span>
              <span className="text-xs font-bold" style={{ color: sentimentColor }}>{d.overallSentiment}</span>
            </div>
          )}
          {d.summary && <p className="text-foreground/80 text-xs leading-relaxed">{d.summary}</p>}
          {d.trendingNews && d.trendingNews.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Trending News</div>
              <ul className="space-y-1.5">
                {d.trendingNews.map((n, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/70">
                    <span className="text-pink-400 mt-0.5 shrink-0">•</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {d.signals && d.signals.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {d.signals.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500/15 text-pink-300 border border-pink-500/20">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Plain text message
  return (
    <div className="mb-3 flex gap-2.5">
      <div className="size-6 rounded-full bg-primary/10 border border-white/15 shrink-0 mt-0.5 grid place-items-center">
        <Bot size={12} className="text-foreground/60" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-primary/5 border border-border px-4 py-2.5 text-xs text-foreground/80 leading-relaxed max-w-[85%]">
        {msg.content}
      </div>
    </div>
  );
}

// ─── Trading Form ────────────────────────────────────────────────────────────

function TradingForm({ onSubmit, loading }) {
  const [coin, setCoin] = useState("BTC");
  const [strategy, setStrategy] = useState("Smart Money Concept (SMC)");
  const [custom, setCustom] = useState("");

  const handleSubmit = () => {
    onSubmit({ coin, strategy, customStrategy: custom });
  };

  return (
    <div className="space-y-3 p-4 bg-primary/3 rounded-2xl border border-white/8">
      <div className="text-[10px] uppercase tracking-widest text-foreground/40">Trading Analysis</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-foreground/40 mb-1">Coin</label>
          <input value={coin} onChange={e => setCoin(e.target.value.toUpperCase())}
            className="w-full bg-primary/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30"
            placeholder="BTC, ETH…" />
        </div>
        <div>
          <label className="block text-[10px] text-foreground/40 mb-1">Strategy</label>
          <select value={strategy} onChange={e => setStrategy(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30">
            {STRATEGIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {strategy === "Custom" && (
        <textarea value={custom} onChange={e => setCustom(e.target.value)} rows={2}
          className="w-full bg-primary/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30 resize-none"
          placeholder="Describe your custom strategy…" />
      )}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-2.5 rounded-xl bg-lime-400/90 text-primary-foreground text-xs font-bold tracking-wider hover:bg-lime-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <TrendingUp size={13} />}
        Analyze {coin}
      </button>
    </div>
  );
}

// ─── Portfolio Form ───────────────────────────────────────────────────────────

function PortfolioForm({ onSubmit, loading }) {
  const [capital, setCapital] = useState("10000");
  const [holdings, setHoldings] = useState("BTC: 0.1, ETH: 1.5");
  const [riskAppetite, setRiskAppetite] = useState("Medium");
  const [history, setHistory] = useState("");

  const handleSubmit = () => {
    onSubmit({ totalCapital: capital, currentHoldings: holdings, riskAppetite, tradingHistory: history });
  };

  return (
    <div className="space-y-3 p-4 bg-primary/3 rounded-2xl border border-white/8">
      <div className="text-[10px] uppercase tracking-widest text-foreground/40">Portfolio Guidance</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-foreground/40 mb-1">Total Capital (USD)</label>
          <input value={capital} onChange={e => setCapital(e.target.value)} type="number"
            className="w-full bg-primary/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30"
            placeholder="10000" />
        </div>
        <div>
          <label className="block text-[10px] text-foreground/40 mb-1">Risk Appetite</label>
          <select value={riskAppetite} onChange={e => setRiskAppetite(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30">
            {["Low", "Medium", "High", "Very High"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] text-foreground/40 mb-1">Current Holdings (e.g. BTC: 0.1, ETH: 2)</label>
        <input value={holdings} onChange={e => setHoldings(e.target.value)}
          className="w-full bg-primary/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30"
          placeholder="BTC: 0.1, ETH: 1.5, SOL: 10" />
      </div>
      <div>
        <label className="block text-[10px] text-foreground/40 mb-1">Recent Trading History (optional)</label>
        <textarea value={history} onChange={e => setHistory(e.target.value)} rows={2}
          className="w-full bg-primary/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30 resize-none"
          placeholder="e.g. Bought BTC at 60k, sold ETH at 3k…" />
      </div>
      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-2.5 rounded-xl bg-sky-400/90 text-primary-foreground text-xs font-bold tracking-wider hover:bg-sky-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Briefcase size={13} />}
        Get Portfolio Guidance
      </button>
    </div>
  );
}

// ─── News Form ───────────────────────────────────────────────────────────────

function NewsForm({ onSubmit, loading }) {
  const [coin, setCoin] = useState("Bitcoin");

  return (
    <div className="space-y-3 p-4 bg-primary/3 rounded-2xl border border-white/8">
      <div className="text-[10px] uppercase tracking-widest text-foreground/40">News & Sentiment Analysis</div>
      <div>
        <label className="block text-[10px] text-foreground/40 mb-1">Coin Name</label>
        <input value={coin} onChange={e => setCoin(e.target.value)}
          className="w-full bg-primary/5 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-white/30"
          placeholder="Bitcoin, Ethereum, Solana…" />
      </div>
      <button onClick={() => onSubmit({ coin })} disabled={loading}
        className="w-full py-2.5 rounded-xl bg-pink-400/90 text-primary-foreground text-xs font-bold tracking-wider hover:bg-pink-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Newspaper size={13} />}
        Analyze {coin} News
      </button>
    </div>
  );
}

// ─── API Calls → Your Backend ─────────────────────────────────────────────────
//
// All three functions call YOUR backend routes (not Anthropic directly).
// The backend has the API key, handles CORS, calls the LLM, and returns JSON.
//
// Base URL:  set VITE_API_BASE_URL in your .env file (see .env.example)
//            defaults to http://localhost:5000 for local dev
//
// Expected backend response shape per endpoint:
//   POST /api/trading-analysis   → { signal, explanation, reasoning, riskLevel, sentimentSummary }
//   POST /api/portfolio-guidance → { investmentGuide, allocations, dcaAdvice, riskyCoins, safeCoins }
//   POST /api/news-sentiment     → { overallSentiment, summary, trendingNews, signals }

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiFetch(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Server error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Support two backend response shapes:
  //   1. Backend returns the result directly:  { signal: "Buy", ... }
  //   2. Backend wraps it:                     { result: { signal: "Buy", ... } }
  //                                         or { data: { signal: "Buy", ... } }
  if (data.result) return data.result;
  if (data.data)   return data.data;
  return data;
}

async function callTradingAPI({ coin, strategy, customStrategy }) {
  return apiFetch("/api/trading-analysis", {
    strategy: strategy === "Custom" ? "Custom" : strategy,
    customStrategyText: strategy === "Custom" ? customStrategy : undefined,
    coin,
  });
}

async function callPortfolioAPI({ totalCapital, currentHoldings, riskAppetite, tradingHistory }) {
  return apiFetch("/api/portfolio-guidance", {
    totalCapital,
    currentPortfolio: currentHoldings,
    currentHoldings,
    riskAppetite,
    userTradingHistory: tradingHistory,
  });
}

async function callNewsAPI({ coin }) {
  return apiFetch("/api/news-sentiment", { coin });
}

// ─── Main Chatbot ─────────────────────────────────────────────────────────────

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState("trading");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content: "Hey! I'm your AI crypto analyst. I can analyze trading signals, review your portfolio, and fetch the latest market sentiment. Pick a mode below to get started."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const addUserMsg = (text) => setMessages(m => [...m, { role: "user", type: "text", content: text }]);
  const addAssistantMsg = (type, data) => setMessages(m => [...m, { role: "assistant", type, data }]);
  const addTextMsg = (content) => setMessages(m => [...m, { role: "assistant", type: "text", content }]);

  const handleTrading = async ({ coin, strategy, customStrategy }) => {
    addUserMsg(`Analyze ${coin} · ${strategy}${strategy === "Custom" ? ": " + customStrategy : ""}`);
    setLoading(true);
    try {
      const data = await callTradingAPI({ coin, strategy, customStrategy });
      addAssistantMsg("trading", data);
    } catch (err) {
      addTextMsg(`⚠️ Could not reach the backend: ${err.message}. Make sure your server is running and VITE_API_BASE_URL is set correctly in .env`);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolio = async (params) => {
    addUserMsg(`Portfolio review · $${params.totalCapital} · ${params.riskAppetite} risk`);
    setLoading(true);
    try {
      const data = await callPortfolioAPI(params);
      addAssistantMsg("portfolio", data);
    } catch (err) {
      addTextMsg(`⚠️ Could not reach the backend: ${err.message}. Make sure your server is running and VITE_API_BASE_URL is set correctly in .env`);
    } finally {
      setLoading(false);
    }
  };

  const handleNews = async ({ coin }) => {
    addUserMsg(`News & sentiment for ${coin}`);
    setLoading(true);
    try {
      const data = await callNewsAPI({ coin });
      addAssistantMsg("news", data);
    } catch (err) {
      addTextMsg(`⚠️ Could not reach the backend: ${err.message}. Make sure your server is running and VITE_API_BASE_URL is set correctly in .env`);
    } finally {
      setLoading(false);
    }
  };

  const activeMode = MODES.find(m => m.id === mode);

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
            style={{ boxShadow: "0 0 30px rgba(255,255,255,0.25)" }}
          >
            <Bot size={24} />
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-lime-400 border-2 border-black animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed z-50 right-4 bottom-4 flex flex-col"
            style={{
              width: expanded ? "min(680px, calc(100vw - 2rem))" : "min(420px, calc(100vw - 2rem))",
              height: expanded ? "min(700px, calc(100vh - 2rem))" : "min(580px, calc(100vh - 2rem))",
              background: "rgba(8, 8, 10, 0.97)",
              backdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "24px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 shrink-0">
              <div className="size-8 rounded-full bg-primary/10 border border-white/15 grid place-items-center">
                <Bot size={16} className="text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground tracking-tight">AI Crypto Analyst</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-lime-400 animate-pulse" />
                  <span className="text-[10px] text-foreground/40 uppercase tracking-widest">Live · Powered by Claude</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setExpanded(e => !e)} className="size-7 rounded-lg hover:bg-primary/10 grid place-items-center text-foreground/50 hover:text-foreground transition-colors">
                  {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
                <button onClick={() => setOpen(false)} className="size-7 rounded-lg hover:bg-primary/10 grid place-items-center text-foreground/50 hover:text-foreground transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-1 px-4 py-3 border-b border-white/8 shrink-0">
              {MODES.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
                    style={mode === m.id
                      ? { background: m.color + "18", color: m.color, border: `1px solid ${m.color}30` }
                      : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }
                    }>
                    <Icon size={11} />
                    <span className="hidden sm:inline">{m.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {loading && (
                <div className="flex gap-2.5 mb-3">
                  <div className="size-6 rounded-full bg-primary/10 border border-white/15 shrink-0 mt-0.5 grid place-items-center">
                    <Bot size={12} className="text-foreground/60" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-primary/5 border border-border px-4 py-3 flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-foreground/50" />
                    <span className="text-xs text-foreground/40">Analyzing market data…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Forms */}
            <div className="px-4 pb-4 shrink-0 border-t border-white/8 pt-4">
              {mode === "trading" && <TradingForm onSubmit={handleTrading} loading={loading} />}
              {mode === "portfolio" && <PortfolioForm onSubmit={handlePortfolio} loading={loading} />}
              {mode === "news" && <NewsForm onSubmit={handleNews} loading={loading} />}
              <p className="text-[9px] text-foreground/20 text-center mt-2">Not financial advice · For informational purposes only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
