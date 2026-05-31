import { motion } from "framer-motion";
import { TrendingUp, Briefcase, Newspaper, ArrowRight, Zap } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    color: "#a3e635",
    title: "AI Trading Analysis",
    subtitle: "ICT · SMC · Fibonacci · Price Action",
    desc: "Get Buy/Sell/Hold signals with risk levels and detailed strategy reasoning. Supports 6 trading methodologies including custom strategies.",
    badge: "Live Signal",
  },
  {
    icon: Briefcase,
    color: "#38bdf8",
    title: "Portfolio Guidance",
    subtitle: "Capital · DCA · Allocation",
    desc: "Input your holdings and risk appetite. AI returns optimal asset allocation, DCA strategy, safe vs risky coins, and capital management advice.",
    badge: "Smart Allocation",
  },
  {
    icon: Newspaper,
    color: "#f472b6",
    title: "News & Sentiment",
    subtitle: "Twitter · Crypto Media · Whales",
    desc: "Real-time analysis of market sentiment, whale activity, regulatory news, ETF updates, and influencer signals for any coin.",
    badge: "Real-time Intel",
  },
];

export function AIFeatureBanner() {
  return (
    <section className="py-24 border-t border-border relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-10"
          style={{ background: "radial-gradient(circle, #a3e635, #38bdf8, #f472b6)" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
            <Zap className="size-3 text-foreground" />
            AI-Powered · Powered by Claude
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-end justify-between mb-12 flex-wrap gap-4"
        >
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI Analyst</div>
            <h2 className="mt-2 text-3xl md:text-muted-foregroundxl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your 24/7 crypto AI advisor.
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-sm">
            Three specialized AI endpoints. One chat interface. Ask anything about trading, portfolio management, or market news.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl border border-border bg-card/50 p-7 hover:border-foreground/20 transition-all cursor-pointer overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${f.color}08, transparent 60%)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="size-11 rounded-xl border border-border bg-secondary/40 grid place-items-center group-hover:border-foreground/20 transition-colors"
                      style={{ boxShadow: `0 0 20px ${f.color}20` }}>
                      <Icon className="size-5" style={{ color: f.color }} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border"
                      style={{ color: f.color, borderColor: f.color + "40", background: f.color + "10" }}>
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-1 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {f.title}
                  </h3>
                  <div className="text-[11px] text-muted-foreground mb-3 font-mono tracking-wider">{f.subtitle}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-medium transition-colors"
                    style={{ color: f.color }}>
                    Try it now
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          Click the <span className="text-foreground font-medium">AI button</span> in the bottom-right corner to open the analyst
          <span className="mx-1.5">·</span>Not financial advice
        </motion.div>
      </div>
    </section>
  );
}
