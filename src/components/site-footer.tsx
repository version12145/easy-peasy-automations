import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import logo from "@/assets/veducate-mark.png.asset.json";

const COLS = [
  {
    heading: "Knowledge",
    links: [
      { label: "Articles", to: "/articles" },
      { label: "Latest Updates", to: "/articles" },
      { label: "Trending Topics", to: "/categories" },
      { label: "Editor's Picks", to: "/articles" },
      { label: "Learning Collections", to: "/articles" },
    ],
  },
  {
    heading: "Categories",
    links: [
      { label: "Artificial Intelligence", to: "/categories" },
      { label: "Programming", to: "/categories" },
      { label: "Cloud Computing", to: "/categories" },
      { label: "Cybersecurity", to: "/categories" },
      { label: "Engineering", to: "/categories" },
      { label: "Career Development", to: "/categories" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/" },
      { label: "Contact", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Terms of Service", to: "/" },
      { label: "Careers", to: "/" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Knowledge Hub", to: "/articles" },
      { label: "Learning Platform", to: "/articles" },
      { label: "Documentation", to: "/" },
      { label: "Community", to: "/" },
      { label: "Support", to: "/" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface-2/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="VEducate Academy" className="h-9 w-auto shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold tracking-tight text-navy">VEducate Academy</div>
                <div className="text-sm text-muted-foreground italic">Don't just learn tech, build it.</div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              A modern knowledge hub for engineers, students and creators. In-depth guides on AI, cloud, security and career craft.
            </p>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              VEducate Academy is a modern AI-powered education and technology platform dedicated to helping students and professionals learn faster, build stronger technical skills, and stay ahead in an ever-changing digital world.
            </p>

            <div className="mt-8 glass rounded-2xl p-5">
              <div className="text-sm font-semibold text-foreground">Stay Ahead with Technology</div>
              <p className="mt-1 text-xs text-muted-foreground">Curated tutorials, AI research and engineering insights — every week.</p>
              <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="flex-1 min-w-0 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="rounded-full grad-navy px-4 py-2 text-sm font-semibold text-white shadow-navy hover:opacity-90"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map((c) => (
              <div key={c.heading}>
                <div className="text-xs font-semibold uppercase tracking-widest text-foreground">{c.heading}</div>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VEducate Academy. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
