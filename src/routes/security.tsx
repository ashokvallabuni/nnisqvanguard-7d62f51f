import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/security")({
  component: () => (
    <main className="pt-32 pb-20 min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">NISQ Vanguard</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Security Policy</h1>
          <p className="text-muted-foreground mt-4 text-lg">Our commitment to platform and data security.</p>
        </div>

        <div className="nv-card p-8 md:p-12 space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Infrastructure Security</h2>
            <p className="text-muted-foreground mb-3">
              We employ military-grade security controls to ensure our training infrastructure remains secure and isolated:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Container Isolation:</strong> All IVVAB LABS run in strictly isolated containers with restricted network access.</li>
              <li><strong>Encryption in Transit:</strong> All data transmitted between your browser and our servers is encrypted using TLS 1.3.</li>
              <li><strong>Encryption at Rest:</strong> Database volumes and backups are encrypted at rest using industry-standard AES-256.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Authentication & Access Control</h2>
            <p className="text-muted-foreground">
              Access to the platform requires strong authentication. We support multi-factor authentication (MFA) and enforce strict password policies. Access to administrative functions and lab environments operates on a strict principle of least privilege.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Continuous Monitoring</h2>
            <p className="text-muted-foreground">
              Our Security Operations Center (SOC) monitors the platform 24/7 for suspicious activity, anomalous login patterns, and potential infrastructure abuse. Automated alerting is configured for immediate incident response.
            </p>
          </section>
        </div>
      </div>
    </main>
  ),
});
