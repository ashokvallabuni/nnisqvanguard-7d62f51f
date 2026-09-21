import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Crosshair,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import wolfHero from "@/assets/cyber-wolf-hero.jpg";
import logoAsset from "@/assets/nisq-logo.asset.json";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const QUOTES = [
  "Security is not a product. It is a process.",
  "Cybersecurity begins with awareness.",
  "Every system has a surface. Every surface deserves protection.",
  "Defence begins before the attack.",
  "Trust must be engineered.",
  "Technology moves fast. Security must move faster.",
  "Secure today. Defend tomorrow.",
];

const PARTICLES = Array.from({ length: 22 }, (_, index) => ({
  left: `${7 + ((index * 37) % 88)}%`,
  top: `${9 + ((index * 53) % 78)}%`,
  delay: `${(index % 7) * 0.32}s`,
  duration: `${3.8 + (index % 5) * 0.55}s`,
}));

export function CinematicHero() {
  const heroRef = useRef<HTMLElement>(null);
  const targetRef = useRef({ x: 0, y: 0, energy: 0 });
  const currentRef = useRef({ x: 0, y: 0, energy: 0 });
  const frameRef = useRef<number | null>(null);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const timer = window.setInterval(
      () => setQuoteIndex((index) => (index + 1) % QUOTES.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const animatePointer = () => {
    const current = currentRef.current;
    const target = targetRef.current;
    current.x += (target.x - current.x) * 0.075;
    current.y += (target.y - current.y) * 0.075;
    current.energy += (target.energy - current.energy) * 0.065;
    const hero = heroRef.current;
    if (hero) {
      hero.style.setProperty("--pointer-x", current.x.toFixed(3));
      hero.style.setProperty("--pointer-y", current.y.toFixed(3));
      hero.style.setProperty("--pointer-energy", current.energy.toFixed(3));
    }
    const moving =
      Math.abs(target.x - current.x) +
        Math.abs(target.y - current.y) +
        Math.abs(target.energy - current.energy) >
      0.01;
    frameRef.current = moving ? window.requestAnimationFrame(animatePointer) : null;
  };

  const updatePointer = (clientX: number, clientY: number) => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = hero.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((clientX - bounds.left) / bounds.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((clientY - bounds.top) / bounds.height) * 2 - 1));
    const wolfX = bounds.left + bounds.width * 0.34;
    const wolfY = bounds.top + bounds.height * 0.47;
    const distance = Math.hypot(clientX - wolfX, clientY - wolfY);
    targetRef.current = { x, y, energy: Math.max(0, 1 - distance / (bounds.width * 0.58)) };
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(animatePointer);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" && event.buttons === 0) return;
    updatePointer(event.clientX, event.clientY);
  };

  const onPointerLeave = () => {
    targetRef.current = { x: 0, y: 0, energy: 0 };
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(animatePointer);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    updatePointer(event.clientX, event.clientY);
    const bounds = event.currentTarget.getBoundingClientRect();
    setRipple({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, key: Date.now() });
  };

  const enterLabs = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void navigate({ to: "/cyber-range/labs" });
      return;
    }
    setTransitioning(true);
    window.setTimeout(() => void navigate({ to: "/cyber-range/labs" }), 720);
  };

  const googleSignIn = async () => {
    setAuthBusy(true);
    const result = await signInWithGoogle("/cyber-range/labs");
    if (result.error) setAuthBusy(false);
  };

  return (
    <section
      ref={heroRef}
      className={cn("cinematic-hero", transitioning && "is-transitioning")}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      aria-label="NISQ Vanguard cyber defence introduction"
    >
      <div className="hero-environment" aria-hidden="true">
        <img src={wolfHero} width={1920} height={1080} alt="" className="hero-wolf-image" />
        <div className="hero-atmosphere" />
        <div className="hero-security-grid" />
        <div className="hero-network-lines" />
        <div className="hero-scan-ring" />
        <div className="hero-eye-glow hero-eye-left" />
        <div className="hero-eye-glow hero-eye-right" />
        {PARTICLES.map((particle, index) => (
          <i key={index} className="hero-particle" style={particle} />
        ))}
        {ripple && (
          <i
            key={ripple.key}
            className="hero-pointer-ripple"
            style={{ left: ripple.x, top: ripple.y }}
          />
        )}
      </div>

      <div className="hero-hud hero-hud-left" aria-hidden="true">
        <Crosshair />
        <span>
          <b>Threat visualization</b>Active · Demo interface
        </span>
      </div>
      <div className="hero-hud hero-hud-right" aria-hidden="true">
        <Network />
        <span>
          <b>Network simulation</b>Secure · Visual mode
        </span>
      </div>

      <div className="hero-content">
        <div className="hero-quote" key={quoteIndex}>
          <span aria-hidden="true">“</span>
          <p>{QUOTES[quoteIndex]}</p>
        </div>

        <div className="hero-brand-block">
          <img
            src={logoAsset.url}
            width={220}
            height={220}
            alt="NISQ Vanguard official logo"
            className="hero-official-logo"
          />
          <p className="mono hero-kicker">Cybersecurity · Defence · Intelligence</p>
          <h1>NISQ VANGUARD</h1>
          <div className="hero-division">DEFENCE TECHNOLOGIES</div>
          <p className="hero-motto">Educate. Assess. Defend.</p>
          <p className="hero-statement">
            Cybersecurity built around people, organizations and the threats of tomorrow.
          </p>
          <div className="hero-actions">
            <Link
              to="/solutions/consulting"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "hero-action border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white",
              )}
            >
              Book a consultation <ArrowRight />
            </Link>
            <Link
              to="/cyber-range"
              className={cn(buttonVariants({ size: "lg" }), "hero-action glow-cyber")}
            >
              Explore Cyber Range <Radar />
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="hero-action border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              onClick={enterLabs}
            >
              Enter Cyber Labs <ArrowRight />
            </Button>
          </div>
        </div>

        <div className="hero-pillars" aria-label="NISQ Vanguard principles">
          <div>
            <BookOpen />
            <b>Educate</b>
            <span>Build knowledge</span>
          </div>
          <div>
            <ShieldCheck />
            <b>Assess</b>
            <span>Find vulnerabilities</span>
          </div>
          <div>
            <Sparkles />
            <b>Defend</b>
            <span>Stay secure</span>
          </div>
        </div>
      </div>

      <div className="hero-transition-curtain" aria-hidden="true">
        <ShieldCheck />
      </div>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-md glass glow-cyber">
          <DialogHeader>
            <DialogTitle className="display text-2xl text-cyber">
              Secure Cyber Labs Access
            </DialogTitle>
            <DialogDescription>
              Sign in with your existing NISQ Vanguard account. You’ll return directly to Cyber
              Labs.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={googleSignIn} disabled={authBusy} size="lg" className="w-full">
            {authBusy ? "Connecting…" : "Continue with Google"}
          </Button>
          <Link
            to="/login"
            search={{ next: "/cyber-range/labs" }}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            Use email instead
          </Link>
        </DialogContent>
      </Dialog>
    </section>
  );
}
