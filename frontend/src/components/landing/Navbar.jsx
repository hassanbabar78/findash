import { motion } from "framer-motion";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router'

const links = ["Markets", "Portfolio", "Watchlist", "AI Analyst", "Insights"];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-foreground text-background grid place-items-center font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>F</div>
          <span className="font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Findash</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <a key={l} href="#" className="relative hover:text-foreground transition-colors group">
              {l}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
       
          <Link to="/auth">
            <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">Login</Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-foreground text-background hover:bg-foreground/90">Sign up</Button>
          </Link>
          <button className="md:hidden text-foreground">
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}