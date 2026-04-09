import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Clock, Zap } from 'lucide-react';
import { NewsArticle } from '../types';
import { fetchLatestNews } from '../services/newsService';
import NewsCard from './NewsCard';
import NewsModal from './NewsModal';

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextRefresh, setNextRefresh] = useState(300); // 5 minutes in seconds
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [initializing, setInitializing] = useState(true);

  const loadNews = async (isInitial = false) => {
    if (loading && !isInitial) return;

    // Check cache for instant load
    const cached = localStorage.getItem('nova_news_cache');
    if (isInitial && cached) {
      const { data } = JSON.parse(cached);
      setArticles(data);
      setLoading(false);
      setInitializing(false);
    } else {
      setLoading(true);
    }

    const data = await fetchLatestNews();
    
    if (data.length > 0) {
      setArticles(data);
    }
    
    setLoading(false);
    setNextRefresh(300);
    
    if (isInitial) {
      setInitializing(false);
    }
  };

  useEffect(() => {
    loadNews(true);
    
    const timer = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1) {
          return 0; // Trigger refresh in another effect to avoid side effects in state setter
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle auto-refresh separately
  useEffect(() => {
    if (nextRefresh === 0 && !loading) {
      loadNews();
    }
  }, [nextRefresh, loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <AnimatePresence>
        {initializing && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full border-2 border-accent border-t-transparent animate-spin mb-8"
            />
            <div className="font-mono text-accent tracking-[0.5em] uppercase text-sm animate-pulse">
              System Initializing...
            </div>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-12 h-1 bg-accent/30 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-accent mb-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap size={16} fill="currentColor" />
            </motion.span>
            <span className="text-xs font-bold tracking-[0.3em] uppercase">Live Broadcast</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold tracking-tighter"
          >
            NOVA <span className="text-accent">3D</span> NEWS
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-6 glass-panel px-6 py-3"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-accent"
              />
              Next Sync
            </span>
            <span className="text-xl font-mono font-bold text-accent">{formatTime(nextRefresh)}</span>
          </div>
          <button
            onClick={() => loadNews()}
            disabled={loading}
            className="p-3 rounded-full bg-accent/10 hover:bg-accent/20 text-accent transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            {loading && (
              <motion.div
                layoutId="refresh-ring"
                className="absolute inset-0 border-2 border-accent rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </button>
        </motion.div>
      </header>

      <div className="mb-8 overflow-hidden glass-panel py-2 border-y border-accent/20 relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
        <div className="flex items-center gap-4 whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-tighter ml-4 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Live
          </div>
          {[...articles, ...articles].map((a, i) => (
            <span key={`ticker-${a.id}-${i}`} className="text-xs font-mono text-gray-400 flex items-center gap-4">
              {a.title}
              <span className="text-accent/30">•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {loading && articles.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel h-[400px] animate-pulse bg-white/5"
              />
            ))
          ) : (
            articles.map((article, index) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
                onClick={() => setSelectedArticle(article)}
              >
                <NewsCard article={article} isBreaking={index < 3 && !loading} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
        
        {loading && articles.length > 0 && (
          <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-12">
            <div className="px-4 py-2 glass-panel bg-accent/10 border-accent/30 flex items-center gap-3">
              <RefreshCw size={14} className="animate-spin text-accent" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Updating Grid...</span>
            </div>
          </div>
        )}
      </div>

      <NewsModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
      
      {!loading && articles.length === 0 && (
        <div className="text-center py-24">
          <p className="text-gray-500 font-mono">Unable to establish connection to news grid.</p>
          <button onClick={() => loadNews()} className="mt-4 text-accent underline">Retry Sync</button>
        </div>
      )}
    </div>
  );
}
