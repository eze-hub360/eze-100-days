import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Flame, Award } from 'lucide-react';
import { getLeaderboard } from '../services/userService';

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [type, setType] = useState('xp');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchLeaderboard();
  }, [type]);
  
  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard(type);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-400">#{index + 1}</span>;
  };
  
  const tabs = [
    { id: 'xp', label: 'Top XP', icon: TrendingUp },
    { id: 'streak', label: 'Longest Streak', icon: Flame },
    { id: 'level', label: 'Highest Level', icon: Award },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6 text-center">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold gradient-text mb-2">Leaderboard</h1>
        <p className="text-gray-400">Top performers in the EZE 100 DAYS community</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 p-1 glass-card">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setType(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
              ${type === tab.id 
                ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-white border border-accent-cyan/30' 
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Leaderboard List */}
      <div className="space-y-2">
        {users.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 text-center">
              {getRankIcon(index)}
            </div>
            
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold">{user.name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                {type === 'xp' && <span>{user.xp.toLocaleString()} XP</span>}
                {type === 'streak' && <span>🔥 {user.longestStreak} day streak</span>}
                {type === 'level' && <span>⭐ Level {user.level}</span>}
              </div>
            </div>
            
            {index < 3 && (
              <div className="text-right">
                {index === 0 && <span className="text-yellow-500">🥇 Gold</span>}
                {index === 1 && <span className="text-gray-400">🥈 Silver</span>}
                {index === 2 && <span className="text-amber-600">🥉 Bronze</span>}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">No users found.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;