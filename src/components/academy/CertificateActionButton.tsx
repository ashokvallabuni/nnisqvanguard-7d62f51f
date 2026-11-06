import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Download,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getCourseCertificateStatus,
  issueCertificate,
  getCertificateDownloadUrl,
} from "@/lib/certificate.functions";
import { toast } from "sonner";

interface CertificateActionButtonProps {
  courseSlug: string;
  courseTitle?: string;
  className?: string;
  compact?: boolean;
}

export function CertificateActionButton({
  courseSlug,
  courseTitle,
  className = "",
  compact = false,
}: CertificateActionButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isIssuing, setIsIssuing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: statusData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["course-certificate-status", courseSlug, user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await getCourseCertificateStatus({ data: { courseSlug } });
    },
    enabled: !!user && !!courseSlug,
    staleTime: 5000,
  });

  const handleClaim = async () => {
    if (!user) {
      toast.error("Please sign in to claim your certificate.");
      return;
    }

    try {
      setIsIssuing(true);
      setActionError(null);

      const res = await issueCertificate({ data: { courseSlug } });
      if (res.error) {
        throw new Error(res.detail || res.error);
      }

      toast.success(
        `🎓 Certificate Issued! ID: ${res.certificateNumber || "NISQ-CERT"}`,
        { duration: 7000 }
      );

      // Invalidate queries to refresh UI and My Certificates
      await queryClient.invalidateQueries({
        queryKey: ["course-certificate-status", courseSlug],
      });
      await queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
      refetch();
    } catch (err: any) {
      const msg = err?.message || "Failed to issue certificate. Please try again.";
      setActionError(msg);
      toast.error(msg);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleDownload = async (certNumber: string) => {
    try {
      setIsDownloading(true);
      setActionError(null);

      const res = await getCertificateDownloadUrl({
        data: { certificateNumber: certNumber },
      });

      if (res.error) {
        throw new Error(
          res.error === "CERTIFICATE_REVOKED"
            ? "This certificate has been revoked and cannot be downloaded."
            : "Unable to generate download link. Please try again."
        );
      }

      if (res.downloadUrl) {
        // Open download link in a new window/tab
        const a = document.createElement("a");
        a.href = res.downloadUrl;
        a.download = `${certNumber}.pdf`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Downloading official PDF certificate...");
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to download certificate.";
      setActionError(msg);
      toast.error(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!user) {
    return (
      <div
        className={`p-4 rounded-xl border border-border bg-muted/20 text-center ${className}`}
      >
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
          <Award className="w-4 h-4 text-primary" />
          <span>Sign in to earn and download your official certificate</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`p-4 rounded-xl border border-border bg-card/50 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Evaluating certification requirements…</span>
      </div>
    );
  }

  if (isError || !statusData) {
    return (
      <div
        className={`p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3 ${className}`}
      >
        <span className="text-xs text-destructive font-mono">
          Failed to load certificate status.
        </span>
        <button
          onClick={() => refetch()}
          className="text-xs font-mono text-primary flex items-center gap-1 hover:underline cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  // State 1: Revoked Certificate
  if (statusData.status === "REVOKED") {
    return (
      <div
        className={`p-4 rounded-xl border border-red-500/40 bg-red-500/5 space-y-2 text-left ${className}`}
      >
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase font-mono">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Certificate Revoked</span>
        </div>
        <p className="text-xs text-slate-300">
          This credential was revoked by NISQ Vanguard Academy administration.
          Downloads are disabled.
        </p>
        {statusData.revokedReason && (
          <p className="text-[11px] font-mono text-muted-foreground">
            Reason: {statusData.revokedReason}
          </p>
        )}
      </div>
    );
  }

  // State 2: Certificate Exists (ISSUED)
  if (statusData.status === "ISSUED" && statusData.certificateNumber) {
    const isChainConfirmed = statusData.blockchainStatus === "CONFIRMED";
    return (
      <div
        className={`p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
              Official Credential Awarded
            </span>
          </div>

          {/* Blockchain Badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border border-border bg-background/80">
            {isChainConfirmed ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> On-Chain Verified (Polygon)
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Blockchain Verification Pending
              </span>
            )}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <span>ID: <strong className="text-primary">{statusData.certificateNumber}</strong></span>
          {statusData.finalScore && <span>Score: {statusData.finalScore}%</span>}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => handleDownload(statusData.certificateNumber!)}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 px-5 min-h-[44px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Link…</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Certificate</span>
              </>
            )}
          </button>

          <Link
            to="/verify-certificate/$certificateId"
            params={{ certificateId: statusData.certificateNumber }}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-lg border border-border bg-card/60 hover:bg-muted text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Verify Credential</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {actionError && (
          <div className="flex items-center justify-between gap-2 p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
            <span>{actionError}</span>
            <button
              onClick={() => handleDownload(statusData.certificateNumber!)}
              className="underline text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // State 3: Ready to Claim (Complete, No Certificate Yet)
  if (statusData.status === "READY_TO_CLAIM") {
    return (
      <div
        className={`p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3 ${className}`}
      >
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
          <Award className="w-4 h-4 text-primary shrink-0" />
          <span>Course Requirements Met!</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          You have passed all modules and required knowledge checks. Your official certificate is ready to issue.
        </p>

        <div className="pt-1">
          <button
            onClick={handleClaim}
            disabled={isIssuing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 min-h-[46px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs font-mono shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isIssuing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Issuing Certificate…</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Get Certificate</span>
              </>
            )}
          </button>
        </div>

        {actionError && (
          <div className="flex items-center justify-between gap-2 p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
            <span>{actionError}</span>
            <button
              onClick={handleClaim}
              className="underline text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // State 4: Incomplete (Button Visible But Disabled)
  const missingText = statusData.missingReason || "Requirements incomplete";
  return (
    <div
      className={`p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2.5 text-left ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          disabled
          aria-disabled="true"
          className="inline-flex items-center justify-center gap-2 px-5 min-h-[44px] rounded-lg bg-muted text-muted-foreground/60 font-mono font-semibold text-xs border border-border/60 cursor-not-allowed opacity-70 select-none"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Get Certificate</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Certificate Unlocked Upon Completion
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400/90 pt-0.5">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span>Incomplete: {missingText}</span>
      </div>
    </div>
  );
}

