export interface DailyBriefProps {
  userName: string;
  date: Date;
  topics: TopicSection[];
  globalEvents?: GlobalEventItem[];
  unsubscribeUrl: string;
  manageTopicsUrl: string;
}

export interface TopicSection {
  name: string;
  category: string;
  articles: ArticleSummary[];
  synthesizedSummary?: string;
  sources?: { name: string; url: string }[];
}

export interface ArticleSummary {
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  imageUrl?: string;
}

export interface GlobalEventItem {
  title: string;
  description: string;
  date: Date;
  category: string;
}

export interface MagicLinkProps {
  magicLink: string;
}

export interface WelcomeProps {
  userName: string;
  setupTopicsUrl: string;
}
