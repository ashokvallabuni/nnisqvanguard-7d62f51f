import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
 component: () => (
 <main className="pt-32 pb-20 min-h-screen px-6">
 <div className="max-w-4xl mx-auto">
 <div className="mb-12">
 <p className="font-mono text-sm text-primary tracking-widest uppercase mb-4">NISQ Vanguard</p>
 <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Terms of Service</h1>
 <p className="text-muted-foreground mt-4 text-lg">Effective Date: {new Date().toLocaleDateString()}</p>
 </div>

 <div className="nv-card p-8 md:p-12 space-y-8 text-foreground/90 leading-relaxed">
 <section>
 <h2 className="text-2xl font-bold mb-4 text-foreground">1. Acceptance of Terms</h2>
 <p className="text-muted-foreground">
 By accessing and using the NISQ Vanguard platform, including the Academy and IVVAB LABS, you accept and agree to be bound by the terms and provision of this agreement.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-bold mb-4 text-foreground">2. Authorized Use & Acceptable Behavior</h2>
 <p className="text-muted-foreground mb-3">Our platform provides isolated, containerized environments for cybersecurity training. You agree to:</p>
 <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
 <li>Use the provided infrastructure solely for authorized learning and evaluation.</li>
 <li>Not attempt to breach, compromise, or attack any infrastructure outside the designated lab environments.</li>
 <li>Not share account credentials, flags, or proprietary course material with unauthorized parties.</li>
 </ul>
 </section>

 <section>
 <h2 className="text-2xl font-bold mb-4 text-foreground">3. Intellectual Property</h2>
 <p className="text-muted-foreground">
 All content included on the platform, such as text, graphics, logos, images, lab topologies, and software, is the property of NISQ Vanguard or its content suppliers and protected by international copyright laws.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-bold mb-4 text-foreground">4. Termination</h2>
 <p className="text-muted-foreground">
 We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-bold mb-4 text-foreground">5. Limitation of Liability</h2>
 <p className="text-muted-foreground">
 In no event shall NISQ Vanguard, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
 </p>
 </section>
 </div>
 </div>
 </main>
 ),
});
