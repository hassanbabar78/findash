// import { Github, Twitter, Linkedin } from "lucide-react";

const cols = [
  { title: "Product", items: ["Markets", "Portfolio", "Watchlist", "Insights"] },
  { title: "Company", items: ["About", "Careers", "Press", "Contact"] },
  { title: "Resources", items: ["Docs", "API", "Status", "Blog"] },
  { title: "Legal", items: ["Privacy Policy", "Terms", "Cookies", "Disclosure"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 grid lg:grid-cols-6 gap-12">
        <div className="lg:col-span-2">
          <a href="/" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-foreground text-background grid place-items-center font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>F</div>
            <span className="font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Findash</span>
          </a>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            A professional crypto dashboard for prices, portfolios, AI signals, and market intelligence.
          </p>
          {/* <div className="mt-6 flex gap-3">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="size-9 rounded-md border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <Icon className="size-4" />
              </a>
            ))}
          </div> */}
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{col.title}</div>
            <ul className="mt-4 space-y-3 text-sm">
              {col.items.map((i) => (
                <li key={i}>
                  <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Findash. All rights reserved.</div>
          <div>Prices are indicative and not financial advice.</div>
        </div>
      </div>
    </footer>
  );
}