import { useState, useEffect } from 'react';
import { Medal, Trophy, Star } from 'lucide-react';
import { wellnessAPI } from '../../services/api';

const BADGE_ICONS = {
  'Coffee Break Champion': '☕',
  'Focus Master': '🧠',
  'Productivity Pro': '🎯',
  'Trivia Winner': '🏆',
  '7-Day Streak': '🔥'
};

export default function LeaderboardAndBadges({ badges = [] }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    wellnessAPI.getLeaderboard().then(res => {
      setLeaderboard(res.data.leaderboard);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Badges Section */}
      <div className="bg-white border border-slate-200/70 rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-purple-500" />
          <h3 className="font-extrabold text-slate-800 text-lg">Your Badges</h3>
        </div>
        
        {badges.length === 0 ? (
          <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <p className="text-xs text-slate-400 font-medium">No badges earned yet. Complete sessions to earn badges!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full">
                <span className="text-base">{BADGE_ICONS[badge] || '⭐'}</span>
                <span className="text-[10px] font-bold text-purple-700">{badge}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white border border-slate-200/70 rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-800 text-lg">Company Leaderboard</h3>
        </div>

        <div className="space-y-3">
          {leaderboard.map((user, idx) => (
            <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-brand-blue/30 transition-colors">
              <div className="w-6 text-center font-bold text-slate-400 text-sm">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.department}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-brand-blue">{user.points} pts</p>
                <div className="flex gap-0.5 justify-end mt-0.5">
                  {Array(user.badges).fill(0).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p className="text-xs text-center text-slate-400 py-4">No data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
