import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Flame, 
  BarChart3, 
  Users, 
  Trophy, 
  Settings,
  LogOut,
  X,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { logout, user } = useAuthStore();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tracker', icon: Target, label: 'Challenge Tracker' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/profile', icon: Settings, label: 'Profile' },
  ];
  
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };
  
  const content = (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">EZE 100 DAYS</h1>
            <p className="text-xs text-gray-400">Build better habits</p>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <img 
            src={user?.avatar || 'https://ui-avatars.com/api/?background=8B5CF6&color=fff&name=' + (user?.name || 'User')} 
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-accent-cyan"
          />
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-400">Level {user?.level} • {user?.xp} XP</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-white border border-accent-cyan/30' 
                : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-dark-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 w-full transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
        <motion.div
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={sidebarVariants}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border z-50"
        >
          {content}
        </motion.div>
      </>
    );
  }
  
  return (
    <div className={`fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border transition-all duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {content}
    </div>
  );
};

export default Sidebar;