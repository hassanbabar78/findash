import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-32 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50 mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-4xl px-6 text-center"
      >
        <h2
          className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Start trading smarter <br />
          <span className="text-shimmer">with AI today.</span>
        </h2>
        <p className="mt-6 text-muted-foreground text-lg max-w-xl mx-auto">
          Free forever for personal portfolios. Get AI trading signals, portfolio guidance, and live market sentiment — no card required.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group">
            Create Free Account
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button size="lg" variant="outline" className="border-border bg-transparent hover:bg-secondary text-foreground">
            View Demo
          </Button>
        </div>
      </motion.div>
    </section>
  );
}