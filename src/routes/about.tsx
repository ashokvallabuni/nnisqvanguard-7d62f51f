import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ShieldCheck, Globe, Users, ArrowRight } from "lucide-react";
import founderImg from "@/assets/founder.jpeg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — NISQ Vanguard" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const team = [
    { name: "Varun Gajula", role: "Co-Founder", bio: "Varun contributes to the development and growth of NISQ Vanguard, supporting the company's technical and operational direction as it expands its cybersecurity initiatives." },
    { name: "Sannith Reddy", role: "CPO · Product Marketer", bio: "Sannith focuses on product direction, positioning, communication, and translating NISQ Vanguard's cybersecurity capabilities into useful experiences for learners, organizations, and the wider community." }
  ];

  return (
    <main className="min-h-screen bg-[#05070B] text-[#F4F3F1] font-sans pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-[#F4F3F1]">
            About NISQ Vanguard
          </h1>
          <p className="text-lg text-[#A8B0BF] font-light leading-relaxed mb-6">
            NISQ Vanguard was created around a simple observation: cybersecurity is becoming increasingly complex, while access to practical security knowledge remains limited.
          </p>
          <p className="text-lg text-[#A8B0BF] font-light leading-relaxed">
            We are building a platform that brings together two complementary capabilities. For learners, we provide structured education and practical environments. For organizations, we provide consulting and security services. Together, these capabilities create a security ecosystem where knowledge can become practice and practice can become capability.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="p-8 bg-[#0A0D14] border border-[#20283A]">
            <Globe className="w-8 h-8 text-[#20D9F5] mb-6" />
            <h2 className="text-2xl font-medium text-[#F4F3F1] mb-4">Our Mission</h2>
            <p className="text-[#A8B0BF] font-light leading-relaxed">
              Our mission is to strengthen the security of the digital world by combining practical cybersecurity, accessible education, and research into emerging technologies. We aim to help organizations defend their digital infrastructure while helping the next generation of cybersecurity professionals develop the skills required to protect it.
            </p>
          </div>
          <div className="p-8 bg-[#0A0D14] border border-[#20283A]">
            <ShieldCheck className="w-8 h-8 text-[#20D9F5] mb-6" />
            <h2 className="text-2xl font-medium text-[#F4F3F1] mb-4">Our Vision</h2>
            <p className="text-[#A8B0BF] font-light leading-relaxed">
              A future where security is not treated as an afterthought. We envision a world where organizations build security into their infrastructure from the beginning, where individuals understand how to protect themselves digitally, and where the people building tomorrow's technology are equally committed to securing it.
            </p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="mb-20 max-w-4xl">
          <h2 className="text-3xl font-medium text-[#F4F3F1] mb-6">Security Philosophy</h2>
          <div className="text-lg text-[#A8B0BF] font-light leading-relaxed space-y-4 mb-8">
            <p>
              Security cannot be achieved through a single tool, a single assessment, or a single layer of protection. Modern defence requires understanding how systems behave, where weaknesses exist, how attackers could exploit them, and how defenders can detect and respond to those actions.
            </p>
            <div className="p-6 border border-[#20283A] bg-[#0A0D14] mt-6">
              <ul className="font-mono text-sm space-y-2 text-[#20D9F5]">
                <li>Understand the system.</li>
                <li>Identify the exposure.</li>
                <li>Test the weakness.</li>
                <li>Strengthen the defence.</li>
                <li>Monitor the environment.</li>
                <li>Learn from every incident.</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Trust Statement */}
        <div className="mb-20 max-w-4xl">
          <h2 className="text-3xl font-medium text-[#F4F3F1] mb-6">Trust & Responsibility</h2>
          <div className="text-lg text-[#A8B0BF] font-light leading-relaxed space-y-4">
            <p>
              Security work requires trust. NISQ Vanguard approaches cybersecurity with an emphasis on responsible testing, controlled environments, ethical security practices, privacy, and continuous improvement.
            </p>
            <p>
              Our educational laboratories are designed to provide safe environments where learners can experiment without affecting real systems. Our consulting approach focuses on helping organizations understand risk and strengthen their defensive capabilities.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="border-t border-[#20283A] pt-16">
          <h2 className="text-2xl font-medium text-[#F4F3F1] mb-12">The Command Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-[#0A0D14] border border-[#20283A] flex flex-col hover:border-[#20D9F5]/50 transition-colors group">
              <div className="w-20 h-20 rounded-sm bg-[#0D1220] border border-[#20283A] flex items-center justify-center mb-6 overflow-hidden">
                <img src={founderImg} alt="Ashok Vallabuni" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-medium text-[#F4F3F1] mb-2 group-hover:text-[#20D9F5] transition-colors">Ashok Vallabuni</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-[#20D9F5] mb-4">Founder · Chief Architect</p>
              <p className="text-[#A8B0BF] font-light text-sm mb-6 flex-grow">
                Founder of NISQ Vanguard, focused on cybersecurity, AI security, security engineering, and practical cybersecurity education. His work explores the intersection of modern cyber defence and emerging technologies including LLMs, AI agents, and intelligent infrastructure.
              </p>
              <Link to="/about/founder" className="inline-flex items-center gap-2 font-mono text-xs text-[#20D9F5] hover:text-white transition-colors mt-auto group/btn">
                READ FOUNDER PROFILE <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {team.map((member, i) => (
              <div key={i} className="p-8 bg-[#0A0D14] border border-[#20283A] flex flex-col">
                <div className="w-16 h-16 rounded-sm bg-[#0D1220] border border-[#20283A] flex items-center justify-center mb-6">
                  <span className="font-mono text-lg text-[#8B5CF6]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-[#F4F3F1] mb-2">{member.name}</h3>
                <p className="font-mono text-xs uppercase tracking-widest text-[#8B5CF6] mb-4">{member.role}</p>
                <p className="text-[#A8B0BF] font-light text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
