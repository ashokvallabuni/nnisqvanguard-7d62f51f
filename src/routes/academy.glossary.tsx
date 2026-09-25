import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Database,
  ArrowRight,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { GLOSSARY_TERMS, GlossaryTerm } from "@/data/glossary-terms";

export const Route = createFileRoute("/academy/glossary")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Glossary & Technical Lexicon — NISQ Vanguard Academy" },
      {
        name: "description",
        content:
          "Searchable cybersecurity dictionary mapping definitions to first-principles lessons, real-world datasets, and practical IVVAB LABS labs.",
      },
    ],
  }),
  component: AcademyGlossaryPage,
});

function AcademyGlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    "Networking",
    "Defensive Ops",
    "Threat Intel",
    "Linux",
    "Web Security",
  ];

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchesSearch =
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.technicalDetails.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "all" ||
        term.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="Technical Lexicon"
        badgeVariant="primary"
        title="Searchable Cybersecurity Glossary"
        subtitle="Explore core cybersecurity concepts mapped directly to structured theory lessons, authentic telemetry datasets, and hands-on Cyber Labs."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Academy", to: "/academy" },
          { label: "Glossary" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search terms (e.g. TCP, CIDR, SUID, SYN Flood)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Terms Listing */}
        <div className="space-y-4">
          {filteredTerms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No glossary terms found matching your query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTerms.map((t) => (
                <div
                  key={t.slug}
                  className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.65rem] font-mono uppercase px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 font-semibold">
                        {t.category}
                      </span>
                      {t.rfcOrStandard && (
                        <span className="text-[0.65rem] font-mono text-muted-foreground">
                          {t.rfcOrStandard}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-lg text-foreground">{t.term}</h3>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      {t.definition}
                    </p>

                    <div className="p-3 rounded-lg bg-muted/20 border border-border/60 text-xs space-y-1">
                      <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
                        Technical Architecture
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{t.technicalDetails}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-xs space-y-1">
                      <span className="font-mono text-[0.65rem] uppercase text-destructive font-semibold">
                        Security Relevance & Threat Vector
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{t.securityImpact}</p>
                    </div>
                  </div>

                  {/* Connected Links: Lesson, Dataset, Lab */}
                  <div className="pt-3 border-t border-border/60 flex items-center gap-2 flex-wrap text-xs font-mono">
                    {t.relatedLessonSlug && (
                      <Link
                        to="/academy"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Lesson</span>
                      </Link>
                    )}
                    {t.relatedLabSlug && (
                      <Link
                        to="/cyber-range/labs"
                        className="inline-flex items-center gap-1 text-success hover:underline"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Cyber Lab</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
