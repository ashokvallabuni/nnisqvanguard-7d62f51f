import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ShieldCheck, Globe, Users, ArrowRight } from "lucide-react";
import { teamData } from "@/data/team";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — NISQ Vanguard" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen bg-nisq-white text-nisq-text font-sans pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-nisq-text">
            About NISQ Vanguard
          </h1>
          <p className="text-lg text-nisq-text font-light leading-relaxed mb-6">
            NISQ Vanguard was created around a simple observation: cybersecurity is becoming increasingly complex, while access to practical security knowledge remains limited.
          </p>
          <p className="text-lg text-nisq-text font-light leading-relaxed">
            We are building a platform that brings together two complementary capabilities. For learners, we provide structured education and practical environments. For organizations, we provide consulting and security services. Together, these capabilities create a security ecosystem where knowledge can become practice and practice can become capability.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="p-8 bg-nisq-white border border-nisq-border">
            <Globe className="w-8 h-8 text-nisq-text mb-6" />
            <h2 className="text-2xl font-medium text-nisq-text mb-4">Our Mission</h2>
            <p className="text-nisq-text font-light leading-relaxed">
              Our mission is to strengthen the security of the digital world by combining practical cybersecurity, accessible education, and research into emerging technologies. We aim to help organizations defend their digital infrastructure while helping the next generation of cybersecurity professionals develop the skills required to protect it.
            </p>
          </div>
          <div className="p-8 bg-nisq-white border border-nisq-border">
            <ShieldCheck className="w-8 h-8 text-nisq-text mb-6" />
            <h2 className="text-2xl font-medium text-nisq-text mb-4">Our Vision</h2>
            <p className="text-nisq-text font-light leading-relaxed">
              A future where security is not treated as an afterthought. We envision a world where organizations build security into their infrastructure from the beginning, where individuals understand how to protect themselves digitally, and where the people building tomorrow's technology are equally committed to securing it.
            </p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="mb-20 max-w-4xl">
          <h2 className="text-3xl font-medium text-nisq-text mb-6">Security Philosophy</h2>
          <div className="text-lg text-nisq-text font-light leading-relaxed space-y-4 mb-8">
            <p>
              Security cannot be achieved through a single tool, a single assessment, or a single layer of protection. Modern defence requires understanding how systems behave, where weaknesses exist, how attackers could exploit them, and how defenders can detect and respond to those actions.
            </p>
            <div className="p-6 border border-nisq-border bg-nisq-white mt-6">
              <ul className="font-mono text-sm space-y-2 text-nisq-text">
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
          <h2 className="text-3xl font-medium text-nisq-text mb-6">Trust & Responsibility</h2>
          <div className="text-lg text-nisq-text font-light leading-relaxed space-y-4">
            <p>
              Security work requires trust. NISQ Vanguard approaches cybersecurity with an emphasis on responsible testing, controlled environments, ethical security practices, privacy, and continuous improvement.
            </p>
            <p>
              Our educational laboratories are designed to provide safe environments where learners can experiment without affecting real systems. Our consulting approach focuses on helping organizations understand risk and strengthen their defensive capabilities.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="border-t border-nisq-border pt-16">
          <h2 className="text-2xl font-medium text-nisq-text mb-12">The Command Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:1000px]">
            {teamData.map((member, i) => (
              <div 
                key={i} 
                className="group relative h-96 w-full cursor-pointer"
                tabIndex={0}
                aria-label={`Team member: ${member.name}, ${member.role}`}
              >
                <div className="absolute inset-0 w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
                  
                  {/* Front of Card */}
                  <div className="absolute inset-0 w-full h-full p-8 bg-nisq-navy text-nisq-white border border-nisq-border flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
                    <div className="w-32 h-32 rounded-full bg-nisq-navy-2 border border-nisq-border flex items-center justify-center mb-6 overflow-hidden shadow-sm">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <span className="font-mono text-4xl text-nisq-blue font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-medium text-nisq-white mb-2">{member.name}</h3>
                    <p className="font-mono text-xs uppercase tracking-widest text-nisq-blue">{member.role}</p>
                  </div>
                  
                  {/* Back of Card */}
                  <div className="absolute inset-0 w-full h-full p-8 bg-nisq-navy text-nisq-white border border-nisq-border flex flex-col [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
                    <h3 className="text-xl font-medium text-nisq-white mb-1">{member.name}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-nisq-blue-soft mb-4 border-b border-nisq-border/30 pb-2">{member.role}</p>
                    
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-nisq-offwhite font-light text-sm leading-relaxed mb-4">
                        {member.bio}
                      </p>
                      
                      {member.skills && member.skills.length > 0 && (
                        <div className="mt-4">
                          <p className="font-mono text-[10px] text-nisq-ash mb-2 uppercase">Core Focus</p>
                          <div className="flex flex-wrap gap-1.5">
                            {member.skills.map(skill => (
                              <span key={skill} className="text-[9px] font-mono px-2 py-1 bg-nisq-navy-2 border border-nisq-border/50 text-nisq-blue-soft">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {member.name === "Ashok Vallabuni" && (
                      <Link to={"/about/founder" as any} className="mt-4 pt-4 border-t border-nisq-border/30 inline-flex items-center gap-2 font-mono text-xs text-nisq-blue-soft hover:text-nisq-white transition-colors group/btn">
                        FOUNDER PROFILE <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
