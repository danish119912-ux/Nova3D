export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: 'Global' | 'Tech' | 'Science' | 'Finance' | 'Entertainment' | 'War';
  timestamp: string;
  content: string;
  imageUrl?: string;
  youtubeId?: string;
}

export const CATEGORIES = ['Global', 'Tech', 'Science', 'Finance', 'Entertainment', 'War'] as const;
