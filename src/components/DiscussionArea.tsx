'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiHash, FiUsers, FiThumbsUp, FiTrendingUp, FiBookmark, FiCheck } from 'react-icons/fi';
import { useIssues } from '@/hooks/useIssues';

const categoryList = [
  { name: 'Education', icon: '📚', count: 234 },
  { name: 'Roads', icon: '🛣️', count: 189 },
  { name: 'Jobs', icon: '💼', count: 156 },
  { name: 'Corruption', icon: '🔍', count: 312 },
  { name: 'Technology', icon: '💻', count: 98 },
  { name: 'Healthcare', icon: '🏥', count: 145 },
  { name: 'Environment', icon: '🌿', count: 87 },
];

const initialDiscussions = [
  {
    id: 1,
    user: 'Priya Sharma',
    avatar: 'PS',
    category: 'Education',
    message: 'We need to revamp the mid-day meal scheme with better nutrition tracking. Our schools need digital monitoring systems to ensure transparency. Who else thinks we should pilot this in 5 districts first?',
    time: '5m ago',
    likes: 45,
    replies: 12,
    badge: 'Teacher',
  },
  {
    id: 2,
    user: 'Rahul Verma',
    avatar: 'RV',
    category: 'Roads',
    message: 'Just uploaded evidence of the broken stretch on NH-44. This has caused 3 accidents in the past week. The local administration needs to be held accountable. Tagging the NHAI officials.',
    time: '12m ago',
    likes: 89,
    replies: 34,
    badge: 'Verified Reporter',
  },
  {
    id: 3,
    user: 'Ananya Patel',
    avatar: 'AP',
    category: 'Technology',
    message: 'What if we create a crowdsourced app for real-time pothole mapping using smartphone sensors? We have the tech — let\'s build it together. Looking for developers to collaborate!',
    time: '18m ago',
    likes: 156,
    replies: 67,
    badge: 'Tech Lead',
  },
  {
    id: 4,
    user: 'Vikram Singh',
    avatar: 'VS',
    category: 'Corruption',
    message: 'The RTI data on MPLAD fund utilization is alarming. Only 34% utilized in the last quarter. We should demand a public dashboard showing real-time fund allocation.',
    time: '25m ago',
    likes: 234,
    replies: 89,
    badge: 'Activist',
  },
];

const trendingTopics = [
  { tag: '#FixOurRoads', posts: 1234 },
  { tag: '#EducationForAll', posts: 987 },
  { tag: '#StopCorruption', posts: 2341 },
  { tag: '#DigitalIndia', posts: 756 },
  { tag: '#YouthEmpowerment', posts: 543 },
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

let nextId = 5;

export default function DiscussionArea() {
  const [activeCategory, setActiveCategory] = useState('Education');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'input' | 'category'>('input');
  const [selectedCat, setSelectedCat] = useState('');
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [categories, setCategories] = useState(categoryList);
  const { addIssue } = useIssues();

  const handleFirstSend = () => {
    if (!message.trim()) return;
    setStep('category');
  };

  const handleCategorySend = () => {
    if (!selectedCat) return;
    const cat = categories.find(c => c.name === selectedCat);
    const newDisc = {
      id: nextId++,
      user: 'You',
      avatar: 'YO',
      category: selectedCat,
      message: message.trim(),
      time: 'Just now',
      likes: 0,
      replies: 0,
      badge: 'New',
    };
    setDiscussions(prev => [newDisc, ...prev]);
    setCategories(prev => prev.map(c =>
      c.name === selectedCat ? { ...c, count: c.count + 1 } : c
    ));
    // Also add to shared issues store (appears on Issues section)
    addIssue({ title: message.trim(), category: selectedCat, location: 'Citizen Report' });
    setMessage('');
    setSelectedCat('');
    setStep('input');
  };

  const handleBack = () => {
    setStep('input');
    setSelectedCat('');
  };

  const filteredDiscussions = discussions.filter(
    d => activeCategory === 'All' || d.category === activeCategory
  );

  return (
    <section id="discuss" className="py-20 lg:py-28 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent dark:via-blue-500/[0.02] scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
            <FiMessageSquare className="w-4 h-4 text-primary dark:text-blue-400" />
            Public Discussion
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            Join the Conversation
          </h2>
          <p className="text-muted dark:text-muted-dark text-lg">
            Every voice matters. Share your thoughts, debate solutions, and build consensus.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-5 rounded-2xl glass border border-border dark:border-border-dark"
            >
              <h3 className="font-semibold text-primary dark:text-white text-sm flex items-center gap-2 mb-4">
                <FiHash className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      activeCategory === cat.name
                        ? 'gradient-bg text-white shadow-lg shadow-primary/25'
                        : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.name}
                    </span>
                    <span className="text-xs opacity-70">{cat.count}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-2xl glass border border-border dark:border-border-dark"
            >
              <h3 className="font-semibold text-primary dark:text-white text-sm flex items-center gap-2 mb-4">
                <FiTrendingUp className="w-4 h-4" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div key={topic.tag} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary dark:text-white hover:text-primary-light dark:hover:text-blue-400 cursor-pointer transition-colors">
                      {topic.tag}
                    </span>
                    <span className="text-xs text-muted dark:text-muted-dark">{topic.posts} posts</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1: Message Input */}
            {step === 'input' && (
              <motion.div
                key="input-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl glass border border-border dark:border-border-dark"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
                    Yo
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleFirstSend(); }}
                      placeholder="Share your thoughts on this topic..."
                      className="w-full bg-transparent border-0 outline-none text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark"
                    />
                  </div>
                  <button
                    onClick={handleFirstSend}
                    disabled={!message.trim()}
                    className="p-2.5 rounded-xl gradient-bg text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-40"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border dark:border-border-dark">
                  {['📷', '🎥', '📎', '📍'].map((emoji) => (
                    <button key={emoji} className="text-sm hover:scale-110 transition-transform">
                      {emoji}
                    </button>
                  ))}
                  <span className="text-xs text-muted dark:text-muted-dark ml-auto">
                    Be respectful. Follow community guidelines.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Step 2: Thank You + Category Picker */}
            {step === 'category' && (
              <motion.div
                key="category-step"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-6 rounded-2xl glass border border-border dark:border-border-dark"
              >
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <FiCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary dark:text-white text-sm">
                      Thank you for sharing your problem
                    </h3>
                    <p className="text-xs text-muted dark:text-muted-dark mt-0.5">
                      Select a category so it reaches the right people
                    </p>
                  </div>
                </div>

                {/* Message preview */}
                <div className="mb-5 p-3 rounded-xl bg-black/5 dark:bg-white/5 text-sm text-muted dark:text-muted-dark italic border border-border dark:border-border-dark">
                  &ldquo;{message}&rdquo;
                </div>

                <p className="text-xs font-medium text-muted dark:text-muted-dark mb-3">
                  Choose a category:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCat(cat.name)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        selectedCat === cat.name
                          ? 'border-primary dark:border-blue-500 bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400'
                          : 'border-border dark:border-border-dark text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2.5 rounded-xl glass border border-border dark:border-border-dark text-sm font-medium text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleCategorySend}
                    disabled={!selectedCat}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-40"
                  >
                    <FiSend className="w-4 h-4" />
                    Send to {selectedCat || 'category'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Live Discussions */}
            <AnimatePresence>
              {filteredDiscussions.map((disc, index) => (
                <motion.div
                  key={disc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-5 rounded-2xl glass border border-border dark:border-border-dark card-hover"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {disc.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-primary dark:text-white">{disc.user}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          disc.badge === 'New'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400'
                        }`}>
                          {disc.badge}
                        </span>
                        <span className="text-xs text-muted dark:text-muted-dark ml-auto">{disc.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-saffron/10 text-accent-saffron">
                          {disc.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
                        {disc.message}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted dark:text-muted-dark">
                        <button className="flex items-center gap-1 hover:text-primary dark:hover:text-white transition-colors">
                          <FiThumbsUp className="w-3.5 h-3.5" />
                          {disc.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary dark:hover:text-white transition-colors">
                          <FiMessageSquare className="w-3.5 h-3.5" />
                          {disc.replies}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary dark:hover:text-white transition-colors ml-auto">
                          <FiBookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredDiscussions.length === 0 && (
              <div className="text-center py-12 text-sm text-muted dark:text-muted-dark">
                No discussions in this category yet. Be the first to share!
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
