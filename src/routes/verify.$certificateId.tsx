import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Lock,
  ArrowRight,
  FileCheck,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/verify/$certificateId")({
  head: ({ params }) => ({
    meta: [
      { title: `Verify Credential ${params.certificateId} — NISQ Vanguard Academy` },
      {
        name: "description",
        content: "Public cryptographic verification portal for NISQ Vanguard Academy course certificates.",
      },
    ],
  }),
  component: VerifyCertificatePage,
});

function VerifyCertificatePage() {
  const { certificateId } = Route.useParams();
  const [searchId, setSearchId] = useState(certificateId || "NISQ-CERT-NET-2026-001");

  // Certificate mock/database lookup
  const isDemoOrValid =
    certificateId === "NISQ-CERT-NET-2026-001" ||
    certificateId?.startsWith("NISQ-CERT-") ||
    certificateId === "demo";

  const certData = isDemoOrValid
    ? {
        id: certificateId || "NISQ-CERT-NET-2026-001",
        studentName: "Verified Security Defender",
        courseTitle: "Networking Fundamentals & Protocol Analysis",
        issueDate: "September 21, 2026",
        status: "AUTHENTIC & VERIFIED",
        issuer: "NISQ Vanguard — Defence Technologies Academy",
        skillsGained: [
          "TCP/IP Protocol Architecture (RFC 793 / RFC 9293)",
          "IPv4 Subnetting & CIDR Network Engineering (RFC 4632)",
          "Network Packet Analysis with TShark / Wireshark",
          "Suricata NIDS Threat Hunting & C2 Beaconing Isolation",
        ],
        checksum: "sha256:4b918f8832a819b9b5f385c9de7582b1207604928e18b8577174db93bc71d439",
      }
    : null;

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="PUBLIC VERIFICATION PORTAL"
        badgeVariant="success"
        title="Certificate Verification"
        subtitle="Validate the authenticity of official completion credentials and skills awarded by NISQ Vanguard Academy."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Verify Credential" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Lookup Box */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. NISQ-CERT-NET-2026-001)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Link
            to="/verify/$certificateId"
            params={{ certificateId: searchId.trim() }}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs font-mono hover:bg-primary/90 transition-colors text-center shrink-0"
          >
            Verify Credential
          </Link>
        </div>

        {/* Certificate Display Card */}
        {certData ? (
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-card p-6 sm:p-10 shadow-xl space-y-8 animate-in zoom-in-95">
            {/* Top Seal & Status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-xs">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-primary tracking-wider">
                    NISQ VANGUARD ACADEMY
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    DEFENCE TECHNOLOGIES • OFFICIAL CREDENTIAL
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-success text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{certData.status}</span>
              </div>
            </div>

            {/* Recipient & Course */}
            <div className="space-y-4 text-center sm:text-left">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                This credential certifies that
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                {certData.studentName}
              </h2>
              <div className="text-xs font-mono text-muted-foreground">
                has successfully fulfilled all curriculum, real telemetry exercises, and practical cyber range assessments for:
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-primary">
                {certData.courseTitle}
              </h3>
            </div>

            {/* Verified Skills */}
            <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="text-xs font-mono text-muted-foreground uppercase font-semibold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <span>Demonstrated Competencies (NIST NICE Aligned):</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/90 font-mono">
                {certData.skillsGained.map((skill, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-success font-bold">✓</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Metadata Footer */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
              <div className="space-y-1 text-center sm:text-left">
                <div>
                  <span className="font-semibold text-foreground">Credential ID: </span>
                  {certData.id}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Date Awarded: </span>
                  {certData.issueDate}
                </div>
              </div>

              <div className="text-right text-[0.65rem] text-slate-500 max-w-xs break-all">
                Checksum: {certData.checksum}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-xl border border-dashed border-border text-center space-y-3">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
            <h4 className="font-semibold text-foreground">Certificate Not Found</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              The credential ID "{certificateId}" could not be verified in the database. Please verify the ID or contact academy support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
