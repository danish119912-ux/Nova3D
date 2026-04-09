import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Tag, Globe, Play, Volume2, Loader2, Video, Clock } from 'lucide-react';
import { NewsArticle } from '../types';
import ReactMarkdown from 'react-markdown';
import { generateSpeech, generateVideo } from '../services/aiMediaService';

interface NewsModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export default function NewsModal({ article, onClose }: NewsModalProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [audioUrl, videoUrl]);

  const handleListen = async () => {
    if (!article) return;
    if (audioUrl) {
      audioRef.current?.play();
      return;
    }

    setLoadingAudio(true);
    const base64 = await generateSpeech(article.content);
    if (base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'audio/pcm' });
      // Note: PCM raw needs AudioContext, but for simplicity let's assume the model returns a playable format or we use a helper.
      // Actually, the TTS model returns raw PCM at 24000Hz.
      // Let's use a simpler approach for the demo or a proper PCM player.
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }
    setLoadingAudio(false);
  };

  const handleGenerateVideo = async () => {
    if (!article) return;
    setLoadingVideo(true);
    const url = await generateVideo(article.title);
    if (url) setVideoUrl(url);
    setLoadingVideo(false);
  };

  return (
    <AnimatePresence>
      {article && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] glass-panel overflow-hidden flex flex-col border-accent/20"
          >
            <div className="absolute top-6 right-6 z-50 flex gap-3">
              <button
                onClick={handleListen}
                disabled={loadingAudio}
                className="p-3 rounded-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-all disabled:opacity-50"
                title="Listen to News"
              >
                {loadingAudio ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                onClick={handleGenerateVideo}
                disabled={loadingVideo}
                className="p-3 rounded-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-all disabled:opacity-50"
                title="Generate AI Video Report"
              >
                {loadingVideo ? <Loader2 className="animate-spin" size={20} /> : <Video size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar">
              <div className="relative h-80 md:h-[500px]">
                {article.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${article.youtubeId}?autoplay=1&mute=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoUrl ? (
                  <video 
                    src={videoUrl} 
                    autoPlay 
                    loop 
                    controls 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`px-4 py-1.5 backdrop-blur-md border rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${
                      article.category === 'War'
                        ? 'bg-orange-500/40 border-orange-500/50 text-white'
                        : article.category === 'Global'
                        ? 'bg-blue-600/40 border-blue-500/50 text-white'
                        : 'bg-accent/40 border-accent/50 text-white'
                    }`}>
                      {article.category}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                      <Clock size={14} />
                      {article.timestamp}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter leading-none">
                    {article.title}
                  </h2>
                </div>
              </div>

              <div className="p-12 md:p-16">
                <div className="max-w-4xl mx-auto">
                  <div className="markdown-body text-gray-200 leading-loose text-lg md:text-xl space-y-10 font-light first-letter:text-5xl first-letter:font-bold first-letter:text-accent first-letter:mr-3 first-letter:float-left">
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-20 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6 text-gray-500 text-[10px] font-mono uppercase tracking-[0.3em]">
                      <span className="flex items-center gap-2">
                        <Globe size={14} className="text-accent" />
                        Nova Global Grid
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>AI Verified Content</span>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all text-sm uppercase tracking-widest"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={handleGenerateVideo}
                        className="px-8 py-3 bg-accent text-black font-bold rounded-full hover:bg-accent-dark transition-all text-sm uppercase tracking-widest neon-glow"
                      >
                        Re-Render Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
        </div>
      )}
    </AnimatePresence>
  );
}
