import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, CheckCircle, Upload, Send, AlertCircle, 
  Target, Flame, Award, Sparkles, BookOpen,
  Image, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const ChallengeTracker = () => {
  const [challenge, setChallenge] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [journal, setJournal] = useState('');
  const [mood, setMood] = useState('good');
  const [proofImage, setProofImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const challengesRes = await api.get('/challenges');
      const challenges = challengesRes.data;
      const activeChallenge = challenges.find(c => c.isActive === true);
      
      if (!activeChallenge) {
        toast.error('No active challenge found');
        navigate('/dashboard');
        return;
      }
      
      setChallenge(activeChallenge);
      
      const logsRes = await api.get(`/logs/challenge/${activeChallenge._id}`);
      setLogs(logsRes.data || []);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load challenge');
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProofImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    
    const completedDays = logs.filter(l => l.isCompleted === true).length;
    const nextDay = completedDays + 1;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('challengeId', challenge._id);
    formData.append('day', nextDay);
    formData.append('journal', journal);
    formData.append('mood', mood);
    
    if (proofImage) {
      formData.append('proofImage', proofImage);
    }
    
    try {
      const response = await api.post('/logs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`Day ${nextDay} completed! +${response.data.xpEarned || 10} XP! 🎉`);
      
      if (response.data.newLevel) {
        toast.success(`🎊 Level ${response.data.newLevel} achieved! 🎊`);
      }
      
      setJournal('');
      setMood('good');
      setProofImage(null);
      setPreviewUrl('');
      
      if (updateUser && response.data.xpEarned) {
        updateUser({
          xp: (user?.xp || 0) + response.data.xpEarned,
          level: response.data.newLevel || user?.level,
          streak: (user?.streak || 0) + 1
        });
      }
      
      await fetchData();
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to log progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodEmoji = (moodValue) => {
    const moods = {
      great: '😄', good: '🙂', okay: '😐', tired: '😴', struggling: '😟'
    };
    return moods[moodValue] || '🙂';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-20">
        <Target className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Challenge</h2>
        <p className="text-gray-400 mb-6">Start a 100-day challenge to begin your journey!</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Start a Challenge
        </button>
      </div>
    );
  }

  const completedDays = logs.filter(l => l.isCompleted === true).length;
  const progress = (completedDays / 100) * 100;
  const nextDay = completedDays + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-2">{challenge.title}</h1>
            {challenge.description && (
              <p className="text-gray-400">{challenge.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-dark-bg rounded-full">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm">Day {completedDays}/100</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-3 bg-dark-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Day Selector */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-cyan" />
            Your Journey
          </h2>
          
          <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto p-2">
            {Array.from({ length: Math.min(100, completedDays + 15) }, (_, i) => i + 1).map(day => {
              const log = logs.find(l => l.day === day);
              const isCompleted = log?.isCompleted === true;
              
              return (
                <div
                  key={day}
                  className={`
                    relative p-2 rounded-lg text-center text-sm font-medium
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50' 
                      : day === nextDay
                        ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan animate-pulse'
                        : 'bg-dark-card border border-dark-border opacity-50'
                    }
                  `}
                >
                  {day}
                  {isCompleted && (
                    <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-dark-border text-center text-sm text-gray-400">
            <span className="flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              {completedDays} days completed • {100 - completedDays} days to go!
            </span>
          </div>
        </div>

        {/* Log Form */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-purple" />
            Log Day {nextDay}
          </h2>
          
          <div className="space-y-5">
            {/* Mood */}
            <div>
              <label className="block text-sm font-medium mb-3">How are you feeling today?</label>
              <div className="grid grid-cols-5 gap-2">
                {['great', 'good', 'okay', 'tired', 'struggling'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`
                      p-3 rounded-xl text-center transition-all capitalize
                      ${mood === m 
                        ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan scale-105' 
                        : 'bg-dark-card border border-dark-border hover:border-accent-cyan'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{getMoodEmoji(m)}</div>
                    <span className="text-xs">{m}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Journal */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Journal Entry
              </label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className="input-field"
                rows="4"
                placeholder="What did you accomplish today?"
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Upload Proof (Optional)
              </label>
              <div className="border-2 border-dashed border-dark-border rounded-xl p-4 text-center">
                {previewUrl ? (
                  <div className="relative inline-block">
                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setProofImage(null);
                        setPreviewUrl('');
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Complete Day {nextDay}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-cyan" />
          Your Stats
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-accent-cyan">{completedDays}</div>
            <div className="text-xs text-gray-400">Days Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent-purple">{user?.streak || 0}</div>
            <div className="text-xs text-gray-400">Current Streak</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-500">{user?.xp || 0}</div>
            <div className="text-xs text-gray-400">Total XP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeTracker;