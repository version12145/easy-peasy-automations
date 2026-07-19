import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">VEducate Academy</div>
              <div className="text-xs text-muted-foreground">
                Empowering Learning with AI
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            The official knowledge hub of VEducate Academy — expert tutorials, engineering
            insights, and educational innovation for the next generation of builders.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explore
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/articles" className="text-foreground/80 hover:text-foreground">
                Articles
              </Link>
            </li>
            <li>
              <Link to="/categories" className="text-foreground/80 hover:text-foreground">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/search" className="text-foreground/80 hover:text-foreground">
                Search
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="text-foreground/80">Learning platform</li>
            <li className="text-foreground/80">AI & Technology</li>
            <li className="text-foreground/80">Powered by WordPress</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>© {new Date().getFullYear()} VEducate Academy. All rights reserved.</div>
          <div>Knowledge Hub · v1.0</div>
        </div>
      </div>
    </footer>
  );
}
