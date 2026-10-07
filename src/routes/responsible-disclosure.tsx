import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/responsible-disclosure")({
  component: () => (
    <main className="pt-32 pb-20 min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">NISQ Vanguard</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Responsible Disclosure</h1>
          <p className="text-muted-foreground mt-4 text-lg">Vulnerability Reporting and Safe Harbor Program.</p>
        </div>

        <div className="nv-card p-8 md:p-12 space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Overview</h2>
            <p className="text-muted-foreground">
              At NISQ Vanguard, we believe that working with skilled security researchers across the globe is crucial in identifying weaknesses in any technology. If you believe you've found a security vulnerability in our service, we encourage you to notify us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Safe Harbor</h2>
            <p className="text-muted-foreground">
              We will not take legal action against you or ask law enforcement to investigate you if you comply with the guidelines of this policy. We ask that you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-muted-foreground">
              <li>Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our service.</li>
              <li>Only interact with accounts you own or for which you have explicit permission.</li>
              <li>Provide us a reasonable amount of time to resolve the issue before disclosing it to the public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">How to Report</h2>
            <p className="text-muted-foreground">
              If you have discovered a vulnerability, please email us directly at:
            </p>
            <div className="mt-4 p-4 bg-muted border border-border rounded-md font-mono text-primary text-center font-bold">
              security@nisqvanguard.com
            </div>
            <p className="text-muted-foreground mt-4">
              Please include detailed steps to reproduce the vulnerability, including any relevant HTTP requests, screenshots, or scripts.
            </p>
          </section>
        </div>
      </div>
    </main>
  ),
});
