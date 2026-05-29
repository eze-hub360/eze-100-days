import { Menu, Bell, Search } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socketService from '../services/socket';

const Navbar = ({ toggleSidebar, isMobile }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Listen for socket events
  socketService.on('streak-event', (data) => {
    if (data.userId !== localStorage.getItem('userId')) {
      setNotifications(prev => [{
        id: Date.now(),
        message: `${data.userName} achieved ${data.achievements.join(', ')}! 🎉`,
        time: new Date()
      }, ...prev]);
    }
  });
  
  return (
    <nav className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-dark-card transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-card rounded-xl border border-dark-border">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-dark-card transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-xl z-50"
                >
                  <div className="p-3 border-b border-dark-border">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-400 text-center">No notifications yet</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 border-b border-dark-border hover:bg-dark-hover">
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.time).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;