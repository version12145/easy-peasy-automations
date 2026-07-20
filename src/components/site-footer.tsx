import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import logo from "@/assets/veducate-mark-only.png.asset.json";

const SOCIALS = [
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
  { Icon: Github, href: "#", label: "GitHub" },
  { Icon: Youtube, href: "#", label: "YouTube" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Twitter, href: "#", label: "X (Twitter)" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-32">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />

      <div className="mx-auto max-w-5xl px-6 pb-16 pt-20 sm:pb-20">
        {/* SECTION 1 — Newsletter glass card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-white/80 via-white/60 to-primary/10 p-8 shadow-[0_20px_60px_-20px_rgba(15,42,92,0.25)] backdrop-blur-2xl sm:p-12">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-navy/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-medium text-navy backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Weekly Newsletter
            </div>
            <h3 className="mt-5 font-serif text-3xl leading-tight text-navy sm:text-4xl">
              Stay Ahead with Technology
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join thousands of students, developers and professionals receiving weekly AI, engineering and technology insights from VEducate Academy.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="Email Address"
                aria-label="Email Address"
                className="flex-1 min-w-0 rounded-full border border-white/60 bg-white/70 px-5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring backdrop-blur"
              />
              <button
                type="submit"
                className="rounded-full grad-navy px-6 py-3 text-sm font-semibold text-white shadow-navy transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Subscribe Free
              </button>
            </form>
          </div>
        </div>

        {/* SECTION 2 — Brand identity, compact */}
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="VEducate Academy" className="h-10 w-auto" />
            <span className="font-serif text-2xl text-navy">VEducate Academy</span>
          </div>
          <div className="mt-3 text-sm font-medium text-navy/80">
            Empowering Learning with AI
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            VEducate Academy is an AI-powered education and technology platform helping students, engineers and professionals learn faster through expert tutorials, practical learning resources and industry insights.
          </p>

          {/* SECTION 3 — Social icons */}
          <div className="mt-8 flex items-center gap-3">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="group relative grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-white/60 text-muted-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:text-navy hover:shadow-[0_10px_25px_-10px_rgba(15,42,92,0.4)]"
              >
                <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>

        {/* SECTION 4 — Bottom bar */}
        <div className="mt-16 border-t border-border/60 pt-6">
          <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <div>© {new Date().getFullYear()} VEducate Academy</div>
            <div className="hidden sm:block">
              Built for Students • Engineers • Professionals
            </div>
            <div className="flex items-center gap-5">
              <Link to="/" className="transition-colors hover:text-navy">Privacy</Link>
              <Link to="/" className="transition-colors hover:text-navy">Terms</Link>
              <Link to="/" className="transition-colors hover:text-navy">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
