import React from "react";
import { Home, Dumbbell, TrendingUp, User, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Profile from "../pages/Profile";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  }

  const location = useLocation();

  const isActive = (path:string) => location.pathname === path;

  return (
    <header className="border-b border-neutral-900/80 bg-black/40 backdrop-blur px-6 py-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="text-xl font-semibold text-brand-gold">Gym AI</div>
        
        <nav className="flex items-center space-x-6 text-sm">
          
          <Link 
            to="/home"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
              isActive("/home")
                ? "bg-brand-gold text-black font-medium"
                : "text-zinc-400 hover:text-brand-gold"
              }`}
            >
              <Home size={16} />
              Home
          </Link>

          <a className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors">
            <Dumbbell size={16} />
            Workouts
          </a>
          <a className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors">
            <TrendingUp size={16} />
            Progress
          </a>

          <Link 
            to="/profile"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
              isActive("/profile")
                ? "bg-brand-gold text-black font-medium"
                : "text-zinc-400 hover:text-brand-gold"
              }`}
            >
              <User size={16} />
              Profile
          </Link>
          
        </nav>

        <div className="flex items-center space-x-4 text-sm">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;