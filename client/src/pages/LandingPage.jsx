import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Target, Trophy, Users, ArrowRight, Zap, Shield, Award } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-purple/10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-card rounded-full border border-accent-cyan/30 mb-8">
              <Zap className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm">Transform your life in 100 days</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">EZE 100 DAYS</span>
              <br />
              <span className="text-white">Challenge Yourself</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join thousands of users committed to building better habits, tracking progress, 
              and achieving their goals with our gamified 100-day challenge platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-dark-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EZE 100 DAYS?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to stay motivated and track your progress
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Track Daily Progress',
                description: 'Log your daily achievements, upload proof, and watch your streak grow'
              },
              {
                icon: Trophy,
                title: 'Gamified Experience',
                description: 'Earn XP, level up, unlock achievements, and compete on leaderboards'
              },
              {
                icon: Users,
                title: 'Community Support',
                description: 'Connect with others, share progress, and stay motivated together'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-accent-cyan" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '10K+', label: 'Active Users', icon: Users },
              { number: '500K+', label: 'Days Tracked', icon: Flame },
              { number: '50K+', label: 'Achievements', icon: Award }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <stat.icon className="w-10 h-10 text-accent-cyan mx-auto mb-4" />
                <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Life?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join the community and start your 100-day journey today
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Get Started Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;