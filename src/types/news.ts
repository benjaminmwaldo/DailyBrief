export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: Date;
}

export interface FetchNewsOptions {
  keywords: string[];
  from?: Date;
  to?: Date;
  maxResults?: number;
  language?: string;
}

export interface TopicNews {
  topicId: string;
  topicName: string;
  articles: NewsArticle[];
}

export interface ScoredArticle extends NewsArticle {
  score: number;
}
