import { motion } from "framer-motion";
import { ArrowRight, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBinancePrice } from "@/hooks/useBinancePrice";
import { Sparkline } from "@/hooks/useSparkline";



export function Hero() {
        const btc = useBinancePrice('btcusdt');
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60 mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute inset-0 radial-fade" />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
            Live · 12,420 markets streaming
          </motion.div>

         <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 text-muted-foregroundxl md:text-7xl font-bold tracking-tight leading-[1.05]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Trade smarter with <br />
            <span className="text-shimmer">AI-powered</span> signals.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 max-w-lg text-lg text-muted-foreground"
          >
            Professional crypto dashboard with live prices, AI trading analysis, portfolio guidance, and real-time market sentiment — all in one focused interface.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group">
              Explore Markets
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button size="lg" variant="outline" className="border-border bg-transparent hover:bg-secondary text-foreground">
              Get Started
            </Button>
          </motion.div>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div><span className="text-foreground font-semibold">$2.4T</span> · Total Cap</div>
            <div className="h-4 w-px bg-border" />
            <div><span className="text-foreground font-semibold">52.1%</span> · BTC Dom</div>
            <div className="h-4 w-px bg-border" />
            <div><span className="text-foreground font-semibold">$98B</span> · 24h Vol</div>
          </div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute -inset-10 bg-foreground/5 blur-3xl rounded-full" />
          <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-foreground text-background grid place-items-center font-bold animate-float">₿</div>
                <div>
                  <div className="font-semibold">Bitcoin</div>
                  <div className="text-xs text-muted-foreground">BTC / USD</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold tabular-nums">${btc.price}</div>
                <div className="text-xs text-muted-foreground tabular-nums">{btc.change}% today</div>
              </div>
            </div>
            <div className="h-48 -mx-2">
      
              <Sparkline symbol="btcusdt" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              {[
                ["Open", btc.open],
                ["High", btc.high],
                ["Vol", btc.volume],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-border bg-secondary/40 p-3">
                  <div className="text-muted-foreground">{k}</div>
                  <div className="text-foreground font-semibold tabular-nums mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-4 py-2 text-xs"
          >
            <LineChart className="size-3.5 text-muted-foreground" />
            AI signal: accumulation phase
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}