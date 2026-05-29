import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, Award, Zap, Flame,
  BarChart3, Activity, Trophy, Target, Star
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { getChallenges, getChallengeProgress } from '../services/challengeService';
import { getChallengeLogs } from '../services/logService';
import useAuthStore from '../store/authStore';

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [challenge, setChallenge] = useState(null);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const challenges = await getChallenges();
      const active = challenges.find(c => c.isActive === true);
      if (active) {
        setChallenge(active);
        const logsData = await getChallengeLogs(active._id);
        setLogs(logsData);
        const prog = await getChallengeProgress(active._id);
        setProgress(prog);
        
        // Process weekly data
        const weeks = [];
        for (let i = 0; i < 15; i++) {
          const weekStart = i * 7 + 1;
          const weekEnd = Math.min((i + 1) * 7, 100);
          const completed = logsData.filter(l => 
            l.isCompleted && l.day >= weekStart && l.day <= weekEnd
          ).length;
          weeks.push({
            week: i + 1,
            completed,
            total: weekEnd - weekStart + 1
          });
        }
        setWeeklyData(weeks);
        
        // Process mood data
        const moodCounts = {
          great: 0, good: 0, okay: 0, tired: 0, struggling: 0
        };
        logsData.forEach(log => {
          if (log.mood && moodCounts[log.mood] !== undefined) {
            moodCounts[log.mood]++;
          }
        });
        setMoodData(Object.entries(moodCounts).map(([name, value]) => ({ name, value })).filter(m => m.value > 0));
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const COLORS = ['#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track your progress and celebrate your achievements</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Current Streak', value: user?.streak || 0, color: 'text-orange-500' },
          { icon: Trophy, label: 'Total XP', value: user?.xp || 0, color: 'text-yellow-500' },
          { icon: Award, label: 'Achievements', value: user?.achievements?.length || 0, color: 'text-purple-500' },
          { icon: Target, label: 'Completion', value: progress ? `${Math.round(progress.progress)}%` : '0%', color: 'text-cyan-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-xl font-bold">{stat.value}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Progress Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-cyan" />
          Weekly Progress
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="week" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="#06B6D4" 
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-purple" />
            Mood Distribution
          </h2>
          {moodData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {moodData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm capitalize">{item.name}</span>
                    <span className="text-sm text-gray-400">({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">No mood data yet. Start logging your days!</p>
          )}
        </div>
        
        {/* Achievements */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Your Achievements
          </h2>
          <div className="space-y-3">
            {user?.achievements?.length > 0 ? (
              user.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-dark-bg rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium">{achievement}</p>
                    <p className="text-xs text-gray-400">Achievement Unlocked</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">
                Complete more days to unlock achievements!
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* XP Progression */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent-cyan" />
          Level Progression
        </h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Level {user?.level || 1}</span>
            <span>Next Level: {((user?.xp || 0) % 1000)}/1000 XP</span>
          </div>
          <div className="w-full h-3 bg-dark-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all duration-500"
              style={{ width: `${((user?.xp || 0) % 1000) / 10}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Total XP: {user?.xp || 0} • Complete daily challenges to earn more XP!
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;