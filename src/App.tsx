import Background3D from './components/Background3D';
import NewsFeed from './components/NewsFeed';
import { motion } from 'motion/react';

export default function App() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      <Background3D />
      
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 z-50" />
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      
      <div className="relative z-20">
        <NewsFeed />
      </div>

      {/* Footer Info */}
      <footer className="fixed bottom-6 left-6 z-30 hidden lg:block">
        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 tracking-widest uppercase">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span>4K High Fidelity Render</span>
          <span className="w-px h-4 bg-white/10" />
          <span>v2.0.30</span>
        </div>
      </footer>

      {/* Side HUD Elements */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-8">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="w-1 h-12 bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              animate={{ y: [-48, 48] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              className="w-full h-full bg-accent"
            />
          </motion.div>
        ))}
      </div>
    </main>
  );
}
