import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Home, Shield, BookOpen, Terminal, Radar, Calendar, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, profile, isAdmin, adminView } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const publicRoutes = [
    { label: "Home", to: "/", icon: Home },
    { label: "Academy", to: "/academy", icon: BookOpen },
    { label: "Services", to: "/services", icon: Shield },
    { label: "Threat Intelligence", to: "/intelligence", icon: Radar },
    { label: "Reporting", to: "/reporting", icon: Shield },
  ];

  const studentRoutes = [
    { label: "Dashboard", to: "/", icon: Home },
    { label: "Academy", to: "/academy", icon: BookOpen },
    { label: "Cyber Labs", to: "/cyber-range/labs", icon: Terminal },
    { label: "Reporting", to: "/reporting", icon: Shield },
  ];

  const orgRoutes = [
    { label: "Dashboard", to: "/", icon: Home },
    { label: "Defense Services", to: "/services", icon: Shield },
    { label: "Appointments", to: "/appointments", icon: Calendar },
    { label: "Threat Intelligence", to: "/intelligence", icon: Radar },
    { label: "Reporting", to: "/reporting", icon: Shield },
  ];

  const rawRole = profile?.role?.toString()?.toUpperCase();
  const isOrg = profile?.account_type === "ORGANIZATION" || rawRole === "ORGANIZATION" || !!profile?.organization;
  const isStudent = !isOrg && !isAdmin;

  let routes = publicRoutes;
  if (!user) routes = publicRoutes;
  else if (isStudent) routes = studentRoutes;
  else if (isOrg) routes = orgRoutes;

  const filteredRoutes = routes.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (to: string) => {
    setIsOpen(false);
    navigate({ to });
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 font-mono text-sm"
            placeholder="Search tactical operations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-[0.6rem] font-mono font-semibold text-slate-400 bg-slate-800 rounded border border-slate-700">ESC</kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredRoutes.map((route) => (
            <button
              key={route.to}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-left text-sm font-semibold text-slate-300 hover:text-white"
              onClick={() => handleSelect(route.to)}
            >
              <route.icon className="w-4 h-4 text-slate-400" />
              {route.label}
            </button>
          ))}
          {filteredRoutes.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-500 text-sm font-mono">
              No tactical operations found.
            </div>
          )}
          
          {user && (
            <>
              <div className="h-px bg-slate-800 my-2" />
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-950/30 hover:text-red-400 transition-colors text-left text-sm font-semibold text-slate-400"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
