import { NewsArticle } from '../types';
import { Calendar, Tag, ChevronRight, PlayCircle } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  isBreaking?: boolean;
}

export default function NewsCard({ article, isBreaking }: NewsCardProps) {
  return (
    <div className="glass-panel group overflow-hidden cursor-pointer hover:border-accent/50 transition-all duration-500 h-full relative">
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          {isBreaking && (
            <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm shadow-lg animate-pulse uppercase tracking-tighter">
              Breaking
            </span>
          )}
          <div className="flex gap-2">
            <span className={`px-3 py-1 backdrop-blur-md border rounded-full text-[10px] font-bold uppercase tracking-widest ${
              article.category === 'War' 
                ? 'bg-orange-500/40 border-orange-500/50 text-white' 
                : article.category === 'Global'
                ? 'bg-blue-600/40 border-blue-500/50 text-white'
                : 'bg-accent/40 border-accent/50 text-white'
            }`}>
              {article.category}
            </span>
            {article.youtubeId && (
              <span className="px-3 py-1 bg-red-500/40 backdrop-blur-md border border-red-500/50 rounded-full text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1">
                <PlayCircle size={10} />
                Video
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
        <h3 className="text-xl md:text-2xl font-display font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {article.timestamp}
            </span>
            {article.content.includes("Source:") && (
              <span className="text-accent/60">
                {article.content.split("Source:")[1].trim()}
              </span>
            )}
          </div>
          <ChevronRight size={16} className="text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </div>
      </div>
    </div>
  );
}
