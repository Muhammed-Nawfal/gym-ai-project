import React, { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import QuickActionItem from "../components/QuickActionItem";
import { Zap, Calendar, Target, TrendingUp, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Home: React.FC = () => {

  const[user, setUser] = useState<any>(null);

  const { token } = useAuth();

  useEffect(() => {
    axios.get(
      "/api/users/me", 
      {headers: { Authorization: `Bearer ${token}` }}
    )
    .then(
      res => {
        setUser(res.data);
      }
    )
    .catch(err => {
       console.error("Failed to fetch profile:", err);
    });
  }, [] );

  const goalLabels: Record<string, string> = {
    CUTTING: "Cutting",
    BULKING: "Bulking (Muscle Gain)",
    BODY_RECOMPOSITION: "Body Recomposition",
  };
  
  
  return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Greeting */}
        <section>
          <h1 className="h1">Welcome back, {user?.firstName} {user?.lastName}!</h1>
          <p className="muted mt-1">Ready to crush your fitness goals?</p>
        </section>

        {/* Stats row */}
        <section className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Workouts" 
            value={<span className="text-brand-gold">0</span>}
            icon={<Zap className="text-brand-gold" size={30} />}
          />
          <StatsCard 
            title="This Week" 
            value={<span className="text-brand-gold">0</span>}
            icon={<Calendar className="text-brand-gold" size={30} />}
          />
          <StatsCard 
            title="Current Goal" 
            value={
              <span className="text-brand-gold"> 
                {goalLabels[user?.userGoal as keyof typeof goalLabels] || user?.userGoal}
              </span>
            }
            icon={<Target className="text-brand-gold" size={30} />}
          />
          <StatsCard
            title="Streak"
            value={<span className="text-brand-gold">7 days</span>}
            icon={<TrendingUp className="text-brand-gold" size={30} />}
          />
        </section>

        {/* Two-column layout */}
        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Left: Recent Workouts */}
          <div className="lg:col-span-7">
            <div className="card p-6 min-h-80 flex flex-col">
              <div className="h2 text-brand-gold mb-6">Recent Workouts</div>
               <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center mb-4 hover:border-brand-gold transition-colors cursor-pointer">
                  <Plus className="text-zinc-400 hover:text-brand-gold transition-colors" size={32} />
                </div>
                <div className="muted text-center">
                  <div className="text-lg mb-1">Add a workout</div>
                  <div className="text-sm">Start your fitness journey!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <aside className="lg:col-span-5">
            <div className="card p-6">
              <div className="h2 text-brand-gold mb-4">Quick Actions</div>
              <div className="space-y-3">
                <QuickActionItem
                  title="Start New Workout"
                  description="Begin logging your exercises"
                  onClick={() => {}}
                />
                <QuickActionItem
                  title="View Progress"
                  description="Check your fitness journey"
                  onClick={() => {}}
                />
                <QuickActionItem
                  title="Update Profile"
                  description="Edit your fitness goals"
                  onClick={() => {}}
                />
              </div>
            </div>
          </aside>
        </section>
      </main>
  );
};

export default Home;
