export type FeedSource = "github" | "hackernews" | "leetcode" | "leetcodeActivity";

export interface DailyFeedActivityDay {
  count: number;
  date: string;
}

export interface DailyFeedActivitySummary {
  activeDaysLast7: number;
  days: DailyFeedActivityDay[];
  last30Submissions: number;
  streakDays: number;
  username: string;
  siteRanking?: number;
  totalSubmissions?: number;
  acTotal?: number;
  questionTotal?: number;
}

export interface DailyFeedItem {
  activity?: DailyFeedActivitySummary;
  id: string;
  title: string;
  url: string;
  description: string;
  difficulty?: string;
  source: FeedSource;
  metadata: string;
  practice?: DailyFeedPracticeItem[];
  topicNames?: string[];
}

export interface DailyFeedPracticeItem {
  id: string;
  difficulty: string;
  label: "warmUp" | "core" | "stretch";
  topic: string;
  title: string;
  url: string;
}

export interface DailyFeedCache {
  cacheKey?: string;
  timestamp: number;
  source: FeedSource;
  items: DailyFeedItem[];
}
