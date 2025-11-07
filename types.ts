
export interface BusinessProfile {
  name: string;
  description: string;
  targetAudience: string;
}

export interface TrendingKeyword {
  keyword: string;
  explanation: string;
  score: number;
}

export interface SEOSuggestions {
  metaDescriptions: string[];
  metaKeywords: string[];
}

export interface SocialPost {
  text: string;
  interactiveQuestion: string;
  ctaSuggestion: string;
  imageUrl: string;
  imagePrompt: string;
}

export interface DailyActivity {
  date: string;
  keywords: TrendingKeyword[];
  seo: SEOSuggestions;
  post: SocialPost;
}

export enum AppStatus {
  CONFIG,
  LOADING,
  READY,
  ERROR,
}

export type Theme = 'dark' | 'light' | 'synthwave' | 'forest';
