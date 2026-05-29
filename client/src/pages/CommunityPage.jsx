import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Send, UserPlus, UserCheck,
  ThumbsUp, Award, Flame, Image as ImageIcon
} from 'lucide-react';
import { getFeed, toggleLike, addComment, followUser } from '../services/communityService';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchFeed();
    
    // Socket listeners
    socketService.on('like-update', (data) => {
      setPosts(prev => prev.map(post => {
        if (post._id === data.targetId) {
          return {
            ...post,
            userLiked: !post.userLiked,
            likeCount: post.userLiked ? post.likeCount - 1 : post.likeCount + 1
          };
        }
        return post;
      }));
    });
    
    socketService.on('new-comment', (data) => {
      setPosts(prev => prev.map(post => {
        if (post._id === data.logId) {
          return {
            ...post,
            commentCount: post.commentCount + 1,
            comments: [data.comment, ...(post.comments || [])]
          };
        }
        return post;
      }));
    });
    
    return () => {
      socketService.on = () => {};
    };
  }, []);
  
  const fetchFeed = async () => {
    try {
      const data = await getFeed();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      toast.error('Failed to load community feed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLike = async (postId) => {
    try {
      const result = await toggleLike(postId, 'log');
      socketService.likePost(postId);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };
  
  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    
    try {
      const comment = await addComment(postId, text);
      setCommentText({ ...commentText, [postId]: '' });
      socketService.newComment({ logId: postId, comment });
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };
  
  const handleFollow = async (userId) => {
    try {
      const result = await followUser(userId);
      setPosts(prev => prev.map(post => {
        if (post.user._id === userId) {
          return {
            ...post,
            user: { ...post.user, isFollowing: result.following }
          };
        }
        return post;
      }));
      toast.success(result.following ? 'Started following' : 'Unfollowed');
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };
  
  const getMoodEmoji = (mood) => {
    const moods = {
      great: '😄', good: '🙂', okay: '😐', tired: '😴', struggling: '😟'
    };
    return moods[mood] || '🙂';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading community feed...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6 text-center">
        <h1 className="text-2xl font-bold gradient-text mb-2">Community Feed</h1>
        <p className="text-gray-400">Get inspired by others on their 100-day journey</p>
      </div>
      
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6"
          >
            {/* User Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={post.user.avatar} 
                  alt={post.user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{post.user.name}</h3>
                    <span className="text-xs text-gray-400">Level {post.user.level}</span>
                    {post.user.streak > 0 && (
                      <span className="flex items-center gap-1 text-xs text-orange-500">
                        <Flame className="w-3 h-3" />
                        {post.user.streak}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Day {post.day} • {getMoodEmoji(post.mood)} {post.mood}
                  </p>
                </div>
              </div>
              
              {post.user._id !== user?._id && (
                <button
                  onClick={() => handleFollow(post.user._id)}
                  className="flex items-center gap-1 text-sm text-accent-cyan hover:underline"
                >
                  {post.user.isFollowing ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            
            {/* Challenge Info */}
            <div className="mb-3">
              <span className="text-xs px-2 py-1 bg-accent-cyan/20 rounded-full">
                {post.challenge?.title || '100 Days Challenge'}
              </span>
            </div>
            
            {/* Journal Entry */}
            {post.journal && (
              <p className="text-gray-300 mb-4">{post.journal}</p>
            )}
            
            {/* Proof Image */}
            {post.proofImage && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <img 
                  src={post.proofImage} 
                  alt="Proof" 
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-6 pt-3 border-t border-dark-border">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-2 transition-colors ${
                  post.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.userLiked ? 'fill-current' : ''}`} />
                <span>{post.likeCount}</span>
              </button>
              
              <button
                onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                className="flex items-center gap-2 text-gray-400 hover:text-accent-cyan transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.commentCount}</span>
              </button>
            </div>
            
            {/* Comments Section */}
            <AnimatePresence>
              {showComments[post._id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3"
                >
                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                      placeholder="Write a comment..."
                      className="flex-1 input-field py-2"
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="p-2 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Comments List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {post.comments?.map(comment => (
                      <div key={comment._id} className="flex gap-2 p-2 bg-dark-bg rounded-lg">
                        <img 
                          src={comment.user.avatar} 
                          alt="" 
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.user.name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">No posts yet. Follow more people to see their progress!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;