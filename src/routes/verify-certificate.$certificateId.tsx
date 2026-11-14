import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, CheckCircle2, Clock, XCircle, ExternalLink, FileCheck, Copy, Check } from "lucide-react";
import { getCertificate } from "@/lib/certificate.functions";

export const Route = createFileRoute("/verify-certificate/$certificateId")({
  loader: async ({ params }) => {
    try {
      const res = await getCertificate({ data: { certificateNumber: params.certificateId } });
      if (!res.found || !res.certificate) {
        return { certificate: null, found: false };
      }
      return { certificate: res.certificate, found: true };
    } catch {
      return { certificate: null, found: false };
    }
  },
  component: VerifyCertificatePage,
});

function VerifyCertificatePage() {
  const { certificate, found } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [fileHashResult, setFileHashResult] = useState<{ matches?: boolean; calculated?: string } | null>(null);

  if (!found || !certificate) {
    return (
      <main className="min-h-screen bg-[#050b14] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full glass rounded-xl border border-red-500/30 p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Certificate Not Found</h1>
          <p className="text-sm text-slate-400 mb-6">
            The certificate identifier could not be verified in the official NISQ Vanguard Academy registry.
          </p>
          <a
            href="/academy"
            className="inline-block bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            Explore Academy Courses
          </a>
        </div>
      </main>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    setFileHashResult({
      calculated: calculatedHash,
      matches: calculatedHash.toLowerCase() === (certificate.pdfSha256 || "").toLowerCase(),
    });
  };

  const isConfirmed = certificate.status === "VALID";
  const isRevoked = certificate.status === "REVOKED";

  return (
    <main className="min-h-screen bg-[#050b14] text-white py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <p className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
            Official Credential Verification
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            NISQ Vanguard Defence Technologies Academy
          </h1>
          <p className="text-xs text-slate-400 mt-1">Cryptographic Authenticity Registry</p>
        </div>

        {/* Certificate Credential Card */}
        <div className="glass rounded-xl border border-primary/30 p-6 md:p-8 relative overflow-hidden mb-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-xs font-mono text-slate-400">CREDENTIAL STATUS</span>
            </div>
            {isRevoked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                <XCircle className="w-3.5 h-3.5" /> REVOKED
              </span>
            ) : isConfirmed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED & ON-CHAIN
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" /> ISSUED (BLOCKCHAIN CONFIRMATION PENDING)
              </span>
            )}
          </div>

          {/* Core Verified Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono">Recipient (Privacy-Preserved)</p>
              <p className="text-lg font-bold text-cyan-400 mt-1">{certificate.maskedRecipientName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono">Date Issued</p>
              <p className="text-lg font-bold text-white mt-1">
                {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-slate-400 uppercase font-mono">Course / Program Completed</p>
              <p className="text-xl font-bold text-white mt-1">{certificate.courseTitle}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono">Certificate Identifier</p>
              <p className="text-sm font-mono text-primary mt-1">{certificate.certificateNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono">Verified Score</p>
              <p className="text-sm font-bold text-white mt-1">
                {certificate.finalScore ? `${certificate.finalScore}% (Passed)` : "Course Complete"}
              </p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Digest */}
          <div className="bg-[#07101d] border border-border/60 rounded-lg p-4 mb-4">
            <p className="text-xs font-mono text-slate-400 uppercase mb-1">Deterministic PDF SHA-256 Hash</p>
            <p className="text-xs font-mono text-slate-300 break-all select-all">{certificate.pdfSha256}</p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Link" : "Copy Verification Link"}
            </button>
            <div className="text-xs text-slate-400 font-mono">Issuer: NISQ Vanguard Academy</div>
          </div>
        </div>

        {/* Optional Interactive PDF Verification */}
        <div className="glass rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Independent Document Verification
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Upload the downloaded certificate PDF to independently compute its SHA-256 digest in your browser and verify that it has not been modified.
          </p>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
          />

          {fileHashResult && (
            <div
              className={`mt-4 p-4 rounded-lg border text-xs font-mono ${
                fileHashResult.matches
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              <div className="font-bold mb-1">
                {fileHashResult.matches
                  ? "✓ HASH MATCH: Document is authentic and unmodified."
                  : "✗ HASH MISMATCH: Document does not match issued records."}
              </div>
              <div className="text-[11px] opacity-80 break-all">Calculated: {fileHashResult.calculated}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

