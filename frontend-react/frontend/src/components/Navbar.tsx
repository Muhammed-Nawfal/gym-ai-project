import React from "react";
import { Home, Dumbbell, TrendingUp, User, LogOut } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <header className="border-b border-neutral-900/80 bg-black/40 backdrop-blur px-6 py-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="text-xl font-semibold text-brand-gold">Gym AI</div>
        
        <nav className="flex items-center space-x-6 text-sm">
          <a className="flex items-center gap-2 bg-brand-gold text-black font-medium px-3 py-1.5 rounded-full">
            <Home size={16} />
            Home
          </a>
          <a className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors">
            <Dumbbell size={16} />
            Workouts
          </a>
          <a className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors">
            <TrendingUp size={16} />
            Progress
          </a>
          <a className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors">
            <User size={16} />
            Profile
          </a>
        </nav>

        <div className="flex items-center space-x-4 text-sm">
          <button className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;