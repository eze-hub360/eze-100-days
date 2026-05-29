import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Trophy, Target, Calendar, TrendingUp, Award,
  Plus, ChevronRight, Star, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getChallenges, createChallenge } from '../services/challengeService';
import { getChallengeProgress } from '../services/challengeService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateUser } = useAuthStore();
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', category: 'other' });
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  
  useEffect(() => {
    fetchChallenges();
  }, []);
  
  const fetchChallenges = async () => {
    try {
      const data = await getChallenges();
      setChallenges(data);
      const active = data.find(c => c.isActive);
      setActiveChallenge(active);
      
      if (active) {
        const prog = await getChallengeProgress(active._id);
        setProgress(prog);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      const challenge = await createChallenge(newChallenge);
      setChallenges([challenge, ...challenges]);
      setActiveChallenge(challenge);
      setShowCreateModal(false);
      setNewChallenge({ title: '', description: '', category: 'other' });
      toast.success('Challenge created! Your 100-day journey begins now! 🎯');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create challenge');
    }
  };
  
//   const stats = [
//     { icon: Flame, label: 'Current Streak', value: user?.streak || 0, color: 'text-orange-500' },
//     { icon: Trophy, label: 'Total XP', value: user?.xp || 0, color: 'text-yellow-500' },
//     { icon: Award, label: 'Achievements', value: user?.achievements?.length || 0, color: 'text-purple-500' },
//     { icon: Star, label: 'Level', value: user?.level || 1, color: 'text-cyan-500' },
//   ];
const stats = [
    { icon: Flame, label: 'Current Streak', value: user?.streak || 0, color: 'text-orange-500' },
    { icon: Trophy, label: 'Total XP', value: user?.xp || 0, color: 'text-yellow-500' },
    { icon: Award, label: 'Achievements', value: user?.achievements?.length || 0, color: 'text-purple-500' },
    { icon: Star, label: 'Level', value: user?.level || 1, color: 'text-cyan-500' },
];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card p-8">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{user?.name}!</span>
            </h1>
            <p className="text-gray-400">Ready to crush your goals today?</p>
          </div>
          {!activeChallenge && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Start New Challenge
            </button>
          )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Active Challenge Section */}
      {activeChallenge && progress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Active Challenge</h2>
              <p className="text-2xl font-bold gradient-text">{activeChallenge.title}</p>
            </div>
            <Link to="/tracker" className="text-accent-cyan hover:underline flex items-center gap-1">
              Continue Journey <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Day {progress.completedDays} of 100</span>
              <span>{Math.round(progress.progress)}% Complete</span>
            </div>
            <div className="w-full h-3 bg-dark-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all duration-500"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-4">
            <Link to="/tracker" className="btn-primary flex-1 text-center">
              Log Today's Progress
            </Link>
          </div>
        </motion.div>
      )}
      
      {/* Recent Activity / Tips */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-cyan" />
            Daily Motivation
          </h3>
          <p className="text-gray-300 italic">
            "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one."
          </p>
          <p className="text-accent-cyan text-sm mt-3">— Mark Twain</p>
        </div>
        
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-purple" />
            Quick Tips
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>✓ Log your progress daily to maintain streak</li>
            <li>✓ Upload proof photos to earn bonus XP</li>
            <li>✓ Write journals to reflect on your journey</li>
            <li>✓ Engage with community for motivation</li>
          </ul>
        </div>
      </div>
      
      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Start Your 100-Day Challenge</h2>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Challenge Title</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Learn to Code, Get Fit, Read 100 Books"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Describe your challenge goals..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newChallenge.category}
                  onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value })}
                  className="input-field"
                >
                  <option value="fitness">Fitness</option>
                  <option value="learning">Learning</option>
                  <option value="productivity">Productivity</option>
                  <option value="meditation">Meditation</option>
                  <option value="coding">Coding</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Start Challenge
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;