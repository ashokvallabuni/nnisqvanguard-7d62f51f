import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
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
    { name: "Varun Gajula", role: "Co-Founder", bio: "" },
    { name: "Sannith Reddy", role: "CPO · Product Marketer", bio: "" }
  ];

  return (
    <main className="min-h-screen bg-[#05070B] text-[#F4F3F1] font-sans pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-[#F4F3F1]">
            About NISQ Vanguard
          </h1>
          <p className="text-lg text-[#A8B0BF] font-light leading-relaxed">
            We are defenders, architects, and educators united by a singular mission: equipping the next generation with practical cyber readiness for the threats of tomorrow.
          </p>
        </div>

        {/* Team Section */}
        <div className="border-t border-[#20283A] pt-16">
          <h2 className="text-2xl font-medium text-[#F4F3F1] mb-12">The Vanguard Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="p-8 bg-[#0A0D14] border border-[#20283A] flex flex-col">
                <div className="w-16 h-16 rounded-sm bg-[#0D1220] border border-[#20283A] flex items-center justify-center mb-6">
                  <span className="font-mono text-lg text-[#20D9F5]">
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
