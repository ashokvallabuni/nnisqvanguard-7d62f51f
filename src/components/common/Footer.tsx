import { Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

type FooterLink = { to: string; label: string };

const PRODUCT: FooterLink[] = [
  { to: "/academy", label: "Academy" },
  { to: "/cyber-range/labs", label: "IVVAB LABS" },
  { to: "/cyber-range/datasets", label: "Datasets" },
  { to: "/services", label: "Services" },
  { to: "/programs", label: "Programs" },
];

const COMPANY: FooterLink[] = [
  { to: "/about", label: "About" },
  { to: "/team", label: "Team" },
  { to: "/contact", label: "Contact Us" },
  { to: "/support", label: "Support" },
  { to: "/faq", label: "FAQ & Help Center" },
];

const LEGAL: FooterLink[] = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/refund-policy", label: "Refund & Cancellation" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/acceptable-use", label: "Acceptable Use" },
  { to: "/security", label: "Data Protection & Security" },
  { to: "/accessibility", label: "Accessibility" },
];

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-nisq-ink tracking-normal">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to as any}
              className="text-sm text-nisq-muted hover:text-nisq-blue transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-nisq-offwhite border-t border-nisq-border">
      <div className="container-nv py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="NISQ Vanguard home">
              <img
                src={nisqLogoUrl}
                alt="NISQ Vanguard logo"
                className="w-10 h-10 rounded-lg object-cover border border-nisq-border"
              />
              <span className="text-base font-bold tracking-tight text-nisq-ink">
                NISQ Vanguard
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-nisq-muted">
              Practical cybersecurity education, hands-on labs and defence technology for
              students, campuses and organisations.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com/ashokvallabuni"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="NISQ Vanguard on GitHub"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-nisq-blue-tint text-nisq-blue hover:bg-nisq-blue hover:text-nisq-white transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@nisqvanguard.com"
                aria-label="Email NISQ Vanguard"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-nisq-blue-tint text-nisq-blue hover:bg-nisq-blue hover:text-nisq-white transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <Column title="Product" links={PRODUCT} />
          <Column title="Company" links={COMPANY} />
          <Column title="Legal" links={LEGAL} />
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-nisq-border pt-6 text-xs text-nisq-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NISQ Vanguard Defence Technologies. All rights reserved.</p>
          <p>Built for learners, defenders and organisations.</p>
        </div>
      </div>
    </footer>
  );
}
