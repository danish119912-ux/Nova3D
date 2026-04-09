import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function fetchSpaceNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch("https://api.spaceflightnewsapi.net/v4/articles/?limit=15");
    const data = await response.json();
    return data.results.map((item: any) => ({
      id: `space-${item.id}`,
      title: item.title,
      summary: item.summary,
      category: 'Science',
      content: item.summary + "\n\nSource: " + item.news_site,
      timestamp: new Date(item.published_at).toLocaleDateString(),
      imageUrl: item.image_url
    }));
  } catch (error) {
    console.error("Space News API error:", error);
    return [];
  }
}

async function fetchYouTubeNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const rapidKey = process.env.RAPIDAPI_KEY;

  // Prefer RapidAPI if available as requested
  if (rapidKey && rapidKey !== "YOUR_RAPIDAPI_KEY") {
    try {
      const response = await fetch("https://youtube138.p.rapidapi.com/channel/videos/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'youtube138.p.rapidapi.com',
          'x-rapidapi-key': rapidKey
        },
        body: JSON.stringify({
          id: "UCJ5v_MCY6GNUBTO8-D3XoAg", // Al Jazeera English (Great for War/Global news)
          filter: "videos_latest",
          hl: "en",
          gl: "US"
        })
      });
      const data = await response.json();
      
      if (!data.contents) return [];

      return data.contents.map((item: any) => {
        const video = item.video;
        if (!video) return null;
        return {
          id: `rapid-yt-${video.videoId}`,
          title: video.title,
          summary: video.descriptionSnippet || video.title,
          category: 'Global',
          content: video.descriptionSnippet || video.title,
          timestamp: video.publishedTimeText || "Today",
          imageUrl: video.thumbnails?.[0]?.url || "",
          youtubeId: video.videoId
        };
      }).filter(Boolean);
    } catch (error) {
      console.error("RapidAPI YouTube error:", error);
    }
  }

  // Fallback to standard YouTube API
  if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") return [];

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=breaking+news+global+tech+trending&type=video&videoEmbeddable=true&key=${apiKey}`
    );
    const data = await response.json();
    
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: `yt-${item.id.videoId}`,
      title: item.snippet.title,
      summary: item.snippet.description,
      category: 'Global',
      content: item.snippet.description + "\n\nSource: YouTube - " + item.snippet.channelTitle,
      timestamp: new Date(item.snippet.publishedAt).toLocaleDateString(),
      imageUrl: item.snippet.thumbnails.high.url,
      youtubeId: item.id.videoId
    }));
  } catch (error) {
    console.error("YouTube API error:", error);
    return [];
  }
}

const CACHE_KEY = 'nova_news_cache';
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

async function fetchRapidSearchNews(query: string): Promise<NewsArticle[]> {
  const rapidKey = process.env.RAPIDAPI_KEY;
  if (!rapidKey || rapidKey === "YOUR_RAPIDAPI_KEY") return [];

  try {
    const response = await fetch(`https://youtube138.p.rapidapi.com/search/?q=${encodeURIComponent(query)}&hl=en&gl=US`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'youtube138.p.rapidapi.com',
        'x-rapidapi-key': rapidKey
      }
    });
    const data = await response.json();
    
    if (!data.contents) return [];

    return data.contents.map((item: any) => {
      const video = item.video;
      if (!video) return null;
      return {
        id: `rapid-search-${video.videoId}`,
        title: video.title,
        summary: video.descriptionSnippet || video.title,
        category: query.includes('war') ? 'Global' : 'Trending',
        content: video.descriptionSnippet || video.title,
        timestamp: video.publishedTimeText || "Today",
        imageUrl: video.thumbnails?.[0]?.url || "",
        youtubeId: video.videoId
      };
    }).filter(Boolean);
  } catch (error) {
    console.error("RapidAPI Search error:", error);
    return [];
  }
}

async function fetchGuardianNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey || apiKey === "YOUR_GUARDIAN_API_KEY") return [];

  try {
    const response = await fetch(`https://content.guardianapis.com/search?api-key=${apiKey}&show-fields=thumbnail,trailText,bodyText&page-size=10`);
    const data = await response.json();
    if (!data.response?.results) return [];

    return data.response.results.map((item: any) => ({
      id: `guardian-${item.id}`,
      title: item.webTitle,
      summary: item.fields?.trailText || item.webTitle,
      category: 'Global',
      content: item.fields?.bodyText || item.fields?.trailText || item.webTitle,
      timestamp: new Date(item.webPublicationDate).toLocaleDateString(),
      imageUrl: item.fields?.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(item.id)}/1920/1080`
    }));
  } catch (error) {
    console.error("Guardian API error:", error);
    return [];
  }
}

async function fetchNewsOrgNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_ORG_API_KEY;
  if (!apiKey || apiKey === "YOUR_NEWS_ORG_API_KEY") return [];

  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&apiKey=${apiKey}&pageSize=10`);
    const data = await response.json();
    if (!data.articles) return [];

    return data.articles.map((item: any, idx: number) => ({
      id: `newsorg-${idx}-${Date.now()}`,
      title: item.title,
      summary: item.description || item.title,
      category: 'Global',
      content: item.content || item.description || item.title,
      timestamp: new Date(item.publishedAt).toLocaleDateString(),
      imageUrl: item.urlToImage || `https://picsum.photos/seed/newsorg-${idx}/1920/1080`
    }));
  } catch (error) {
    console.error("NewsOrg API error:", error);
    return [];
  }
}

async function fetchMediastackNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.MEDIASTACK_API_KEY;
  if (!apiKey || apiKey === "YOUR_MEDIASTACK_API_KEY") return [];

  try {
    const response = await fetch(`http://api.mediastack.com/v1/news?access_key=${apiKey}&languages=en&limit=10`);
    const data = await response.json();
    if (!data.data) return [];

    return data.data.map((item: any, idx: number) => ({
      id: `mediastack-${idx}-${Date.now()}`,
      title: item.title,
      summary: item.description || item.title,
      category: 'Global',
      content: item.description || item.title,
      timestamp: new Date(item.published_at).toLocaleDateString(),
      imageUrl: item.image || `https://picsum.photos/seed/mediastack-${idx}/1920/1080`
    }));
  } catch (error) {
    console.error("Mediastack API error:", error);
    return [];
  }
}

async function fetchGNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey || apiKey === "YOUR_GNEWS_API_KEY") return [];

  try {
    const response = await fetch(`https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=en&max=10`);
    const data = await response.json();
    if (!data.articles) return [];

    return data.articles.map((item: any, idx: number) => ({
      id: `gnews-${idx}-${Date.now()}`,
      title: item.title,
      summary: item.description || item.title,
      category: 'Global',
      content: item.content || item.description || item.title,
      timestamp: new Date(item.publishedAt).toLocaleDateString(),
      imageUrl: item.image || `https://picsum.photos/seed/gnews-${idx}/1920/1080`
    }));
  } catch (error) {
    console.error("GNews API error:", error);
    return [];
  }
}

export async function fetchLatestNews(): Promise<NewsArticle[]> {
  // 1. Try to get from cache first for instant load
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TIME) {
      return data;
    }
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const rapidKey = process.env.RAPIDAPI_KEY;
    const hasYouTubeKey = apiKey && apiKey !== "YOUR_YOUTUBE_API_KEY";
    const hasRapidKey = rapidKey && rapidKey !== "YOUR_RAPIDAPI_KEY";

    // Fetch from multiple sources in parallel
    const tasks = [
      fetchSearchNews(), 
      fetchSpaceNews(),
      fetchGuardianNews(),
      fetchNewsOrgNews(),
      fetchMediastackNews(),
      fetchGNews()
    ];
    if (hasYouTubeKey || hasRapidKey) {
      tasks.push(fetchYouTubeNews());
    }
    
    if (hasRapidKey) {
      tasks.push(fetchRapidSearchNews("war news global"));
      tasks.push(fetchRapidSearchNews("breaking news trending"));
    }

    const results = await Promise.all(tasks);
    let combined = results.flat();
    
    // If we have less than 50, expand using AI to reach the target volume
    if (combined.length < 50) {
      const expansion = await fetchExpansionNews(50 - combined.length);
      combined = [...combined, ...expansion];
    }

    // Shuffle and limit
    const finalNews = combined.slice(0, 50).sort(() => Math.random() - 0.5);
    
    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: finalNews,
      timestamp: Date.now()
    }));

    return finalNews;
  } catch (error) {
    console.error("Error in fetchLatestNews:", error);
    if (cached) return JSON.parse(cached).data;
    return fetchFallbackNews(50);
  }
}

async function fetchExpansionNews(count: number): Promise<NewsArticle[]> {
  if (count <= 0) return [];
  return fetchFallbackNews(count);
}

async function fetchFallbackNews(count: number = 50): Promise<NewsArticle[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} high-impact, trending news articles for a global news portal. 
      - Topics: War News (Ukraine, Gaza, etc.), Tech, Space, Global Politics, Finance, and Entertainment.
      - Language: Provide a mix of Hindi and English articles.
      - Detail: For each article, the 'content' field must be a VERY LONG, detailed report (at least 500-800 words) with multiple paragraphs covering the background, current situation, and future implications. 
      - Summary: A concise 2-sentence summary.
      - Current Year: 2026.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Global', 'Tech', 'Science', 'Finance', 'Entertainment', 'War'] },
              content: { type: Type.STRING, description: "Detailed long-form news report with multiple paragraphs" },
              timestamp: { type: Type.STRING }
            },
            required: ["id", "title", "summary", "category", "content", "timestamp"]
          }
        }
      }
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text).map((a: any) => ({
      ...a,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(a.id + a.title)}/1920/1080`
    }));
  } catch (e) {
    return [];
  }
}

async function fetchSearchNews(): Promise<NewsArticle[]> {
  try {
    // Using Google Search grounding to get REAL current news
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Search for the top 20 most impactful and trending global news headlines from the last 24 hours. Provide detailed reports for each, including background and full context. Mix of English and Hindi is preferred.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Global', 'Tech', 'Science', 'Finance', 'Entertainment', 'War'] },
              content: { type: Type.STRING, description: "Detailed long-form news report" },
              timestamp: { type: Type.STRING }
            },
            required: ["id", "title", "summary", "category", "content", "timestamp"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    let articles = JSON.parse(text) as NewsArticle[];
    
    return articles.map((article) => ({
      ...article,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(article.id || article.title)}/1920/1080`
    }));
  } catch (error) {
    console.error("Search News error:", error);
    return [];
  }
}
