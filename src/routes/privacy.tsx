import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <main className="pt-32 pb-20 min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">NISQ Vanguard</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-4 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="nv-card p-8 md:p-12 space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground">
              At NISQ Vanguard, we are committed to protecting your personal data and respecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
              our platform, including the Academy and IVVAB LABS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Personal Data:</strong> Name, email address, institutional affiliation.</li>
              <li><strong className="text-foreground">Telemetry Data:</strong> Interactions within IVVAB LABS, assessment scores, and completion metrics.</li>
              <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, operating system, and access times.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Create and manage your account.</li>
              <li>Deliver targeted cybersecurity training and labs.</li>
              <li>Monitor and analyze usage and trends to improve your experience.</li>
              <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Data Security</h2>
            <p className="text-muted-foreground">
              We use administrative, technical, and physical security measures to help protect your personal information. 
              While we have taken reasonable steps to secure the personal information you provide to us, please be aware that 
              despite our efforts, no security measures are perfect or impenetrable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions or comments about this Privacy Policy, please contact our Data Protection Officer at 
              <span className="text-primary ml-1 font-mono">privacy@nisqvanguard.com</span>
            </p>
          </section>
        </div>
      </div>
    </main>
  ),
});
