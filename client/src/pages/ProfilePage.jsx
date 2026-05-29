import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Award, Edit2, Save, X, Calendar, Target, Zap, Camera } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { updateUserProfile, getUserProfile } from '../services/userService';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, updateUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', bio: '' });
    const [stats, setStats] = useState({ totalDays: 0, completedChallenges: 0 });
    
    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', bio: user.bio || '' });
            fetchUserStats();
        }
    }, [user]);
    
    const fetchUserStats = async () => {
        if (!user?._id) return;
        try {
            const data = await getUserProfile(user._id);
            setStats({ totalDays: data.totalDays || 0, completedChallenges: data.completedChallenges || 0 });
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updated = await updateUserProfile(formData);
            updateUser(updated);
            toast.success('Profile updated!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        setIsUploading(true);
        try {
            const response = await api.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                updateUser({ avatar: response.data.avatar });
                toast.success('Profile picture updated!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload');
        } finally {
            setIsUploading(false);
        }
    };
    
    const statCards = [
        { icon: Flame, label: 'Current Streak', value: user?.streak || 0, color: 'text-orange-500' },
        { icon: Trophy, label: 'Total XP', value: user?.xp || 0, color: 'text-yellow-500' },
        { icon: Award, label: 'Achievements', value: user?.achievements?.length || 0, color: 'text-purple-500' },
        { icon: Calendar, label: 'Total Days', value: stats.totalDays || 0, color: 'text-cyan-500' },
        { icon: Target, label: 'Challenges', value: stats.completedChallenges || 0, color: 'text-green-500' },
        { icon: Zap, label: 'Level', value: user?.level || 1, color: 'text-pink-500' },
    ];
    
    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?background=8B5CF6&color=fff&name=${user?.name || 'User'}`;
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="glass-card p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="relative group">
                        <img src={avatarUrl} alt={user?.name} className="w-32 h-32 rounded-full object-cover border-4 border-accent-cyan" />
                        <label className="absolute bottom-0 right-0 p-2 bg-dark-card rounded-full border border-accent-cyan cursor-pointer hover:bg-dark-hover">
                            <Camera className="w-4 h-4 text-accent-cyan" />
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
                        </label>
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        {isEditing ? (
                            <div className="space-y-3">
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Your name" />
                                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="input-field" rows="2" placeholder="Tell us about yourself..." />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold gradient-text">{user?.name}</h1>
                                <p className="text-gray-400 mt-1">{user?.email}</p>
                                {user?.bio && <p className="text-gray-300 mt-3">{user.bio}</p>}
                            </>
                        )}
                    </div>
                    
                    {/* Edit Button */}
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={isLoading} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
                            <button onClick={() => setIsEditing(false)} className="btn-secondary"><X className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Profile</button>
                    )}
                </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card p-4 text-center">
                        <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
            
            {/* Achievements */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" /> Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['7 Day Streak', '30 Day Warrior', '100 Days Legend'].map(achievement => (
                        <div key={achievement} className={`p-3 rounded-xl text-center ${user?.achievements?.includes(achievement) ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50' : 'bg-dark-card border border-dark-border opacity-50'}`}>
                            <Award className={`w-6 h-6 mx-auto mb-1 ${user?.achievements?.includes(achievement) ? 'text-yellow-500' : 'text-gray-500'}`} />
                            <p className="text-sm">{achievement}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Account Info */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-dark-border"><span className="text-gray-400">Member Since</span><span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="flex justify-between py-2 border-b border-dark-border"><span className="text-gray-400">Longest Streak</span><span className="text-accent-cyan">{user?.longestStreak || 0} days</span></div>
                    <div className="flex justify-between py-2"><span className="text-gray-400">Account Type</span><span>{user?.isAdmin ? 'Admin' : 'Standard'}</span></div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;