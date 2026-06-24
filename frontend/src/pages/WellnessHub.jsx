import { useState, useEffect } from 'react';
import { Activity, Flame, Target, Award } from 'lucide-react';
import Layout from '../components/Layout';
import { wellnessAPI } from '../services/api';
import QuickBreakGames from '../components/wellness/QuickBreakGames';
import ProductivityTimers from '../components/wellness/ProductivityTimers';
import MindfulnessZone from '../components/wellness/MindfulnessZone';
import WellnessAnalytics from '../components/wellness/WellnessAnalytics';
import LeaderboardAndBadges from '../components/wellness/LeaderboardAndBadges';

export default function WellnessHub() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = () => {
    wellnessAPI.getProfile()
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return (
    <Layout title="Wellness Hub">
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading…</span>
      </div>
    </Layout>
  );

  const { total_points, current_streak, focus_hours_weekly, wellness_score } = profile.profile;

  const STATS = [
    { label: 'Wellness Score', value: wellness_score,        icon: Activity, color: '#14B8A6' },
    { label: 'Break Streak',   value: `${current_streak}d`, icon: Flame,    color: '#F59E0B' },
    { label: 'Focus (week)',   value: `${focus_hours_weekly}h`, icon: Target, color: '#2563EB' },
    { label: 'Total Points',   value: total_points,          icon: Award,    color: '#7C3AED' },
  ];

  return (
    <Layout
      title="Wellness Hub"
      subtitle="Recharge, refocus, and return stronger"
    >
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 border-l-4" style={{ borderLeftColor: color }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
              </div>
              <Icon className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Tools */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4">
            <ProductivityTimers onSessionComplete={fetchProfile} />
          </div>
          <div className="card p-4">
            <QuickBreakGames onGameComplete={fetchProfile} />
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          <div className="card p-4">
            <MindfulnessZone />
          </div>
          <div className="card p-4">
            <WellnessAnalytics profileData={profile} />
          </div>
          <div className="card p-4">
            <LeaderboardAndBadges badges={profile.badges} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
