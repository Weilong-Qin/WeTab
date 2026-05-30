import { browser } from "wxt/browser";
import type {
  DailyFeedActivitySummary,
  DailyFeedCache,
  DailyFeedItem,
  DailyFeedPracticeItem,
  FeedSource
} from "../types/dailyFeed";
import { loadLeetCodeProfileConfig } from "./leetcodeProfileService";

const STORAGE_KEY = "vtab.dailyFeed";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FETCH_TIMEOUT_MS = 15000;
const GITHUB_PER_PAGE = 8;
const HN_TOP_COUNT = 8;
const LEETCODE_URL_BASE = "https://leetcode.com/problems/";
const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/";
const LEETCODE_HOME_URL = "https://leetcode.com/";

function leetCodeGraphQLUrl(region: string): string {
  return region === "cn" ? "https://leetcode.cn/graphql/" : "https://leetcode.com/graphql/";
}

function leetCodeHomeUrl(region: string): string {
  return region === "cn" ? "https://leetcode.cn/" : "https://leetcode.com/";
}

function leetCodeProfileUrl(region: string, username: string): string {
  return region === "cn"
    ? `https://leetcode.cn/u/${username}/`
    : `https://leetcode.com/${username}/`;
}

function leetCodeProblemUrl(region: string, link: string): string {
  return region === "cn"
    ? `https://leetcode.cn${link}`
    : `https://leetcode.com${link}`;
}

let cachedCSRFToken: string | undefined;
let cachedCSRFTokenRegion: string | undefined;

async function getLeetCodeCSRFToken(region: string): Promise<string | undefined> {
  if (cachedCSRFToken && cachedCSRFTokenRegion === region) {
    return cachedCSRFToken;
  }

  try {
    const response = await fetch(leetCodeHomeUrl(region), {
      credentials: "include"
    });
    const setCookie = response.headers.get("set-cookie");
    const match = setCookie?.match(/csrftoken=([^;]+)/);
    cachedCSRFToken = match?.[1];
    cachedCSRFTokenRegion = region;
  } catch {
    // token is optional; proceed without it
  }

  return cachedCSRFToken;
}

function leetCodeHeaders(region: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Referer: leetCodeHomeUrl(region)
  };

  if (cachedCSRFToken && cachedCSRFTokenRegion === region) {
    headers["x-csrftoken"] = cachedCSRFToken;
  }

  return headers;
}

type JsonRecord = Record<string, unknown>;

interface GithubRepository extends JsonRecord {
  description?: string | null;
  full_name?: string;
  html_url?: string;
  id?: number | string;
  stargazers_count?: number;
}

interface HackerNewsStory extends JsonRecord {
  descendants?: number;
  score?: number;
  title?: string;
  url?: string;
}

interface LeetCodeDailyResponse extends JsonRecord {
  data?: {
    activeDailyCodingChallengeQuestion?: {
      date?: string;
      link?: string;
      question?: {
        difficulty?: string;
        title?: string;
        titleSlug?: string;
        topicTags?: LeetCodeTopicTag[];
      };
    };
  };
}

interface LeetCodeActivityResponse extends JsonRecord {
  data?: {
    matchedUser?: {
      submissionCalendar?: string;
      username?: string;
    } | null;
  };
}

interface LeetCodeCNActivityResponse extends JsonRecord {
  data?: {
    userProfilePublicProfile?: {
      profile?: {
        realName?: string;
        userAvatar?: string;
      };
      siteRanking?: number;
      submissionProgress?: {
        totalSubmissions?: number;
        acTotal?: number;
        questionTotal?: number;
      };
      username?: string;
    } | null;
  };
}

interface LeetCodeTopicTag {
  name?: string;
  slug?: string;
}

interface PracticeTemplate {
  label: DailyFeedPracticeItem["label"];
  difficulty: string;
  title: string;
  slug: string;
  topic: string;
}

const DEFAULT_PRACTICE_TEMPLATES: PracticeTemplate[] = [
  { label: "warmUp", title: "Two Sum", slug: "two-sum", topic: "Hash Table", difficulty: "Easy" },
  { label: "core", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", topic: "Sliding Window", difficulty: "Medium" },
  { label: "stretch", title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", topic: "Binary Search", difficulty: "Hard" }
];

const PRACTICE_BY_TOPIC: Record<string, PracticeTemplate[]> = {
  array: [
    { label: "warmUp", title: "Contains Duplicate", slug: "contains-duplicate", topic: "Array", difficulty: "Easy" },
    { label: "core", title: "Product of Array Except Self", slug: "product-of-array-except-self", topic: "Prefix Sum", difficulty: "Medium" },
    { label: "stretch", title: "First Missing Positive", slug: "first-missing-positive", topic: "In-place", difficulty: "Hard" }
  ],
  "binary-search": [
    { label: "warmUp", title: "Binary Search", slug: "binary-search", topic: "Binary Search", difficulty: "Easy" },
    { label: "core", title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", topic: "Binary Search", difficulty: "Medium" },
    { label: "stretch", title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", topic: "Binary Search", difficulty: "Hard" }
  ],
  "dynamic-programming": [
    { label: "warmUp", title: "Climbing Stairs", slug: "climbing-stairs", topic: "DP", difficulty: "Easy" },
    { label: "core", title: "House Robber", slug: "house-robber", topic: "DP", difficulty: "Medium" },
    { label: "stretch", title: "Edit Distance", slug: "edit-distance", topic: "DP", difficulty: "Hard" }
  ],
  graph: [
    { label: "warmUp", title: "Find if Path Exists in Graph", slug: "find-if-path-exists-in-graph", topic: "Graph", difficulty: "Easy" },
    { label: "core", title: "Number of Islands", slug: "number-of-islands", topic: "DFS/BFS", difficulty: "Medium" },
    { label: "stretch", title: "Word Ladder", slug: "word-ladder", topic: "BFS", difficulty: "Hard" }
  ],
  "hash-table": [
    { label: "warmUp", title: "Two Sum", slug: "two-sum", topic: "Hash Table", difficulty: "Easy" },
    { label: "core", title: "Group Anagrams", slug: "group-anagrams", topic: "Hash Table", difficulty: "Medium" },
    { label: "stretch", title: "Minimum Window Substring", slug: "minimum-window-substring", topic: "Hash Table", difficulty: "Hard" }
  ],
  string: [
    { label: "warmUp", title: "Valid Anagram", slug: "valid-anagram", topic: "String", difficulty: "Easy" },
    { label: "core", title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", topic: "String", difficulty: "Medium" },
    { label: "stretch", title: "Regular Expression Matching", slug: "regular-expression-matching", topic: "String DP", difficulty: "Hard" }
  ],
  tree: [
    { label: "warmUp", title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", topic: "Tree", difficulty: "Easy" },
    { label: "core", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", topic: "Tree", difficulty: "Medium" },
    { label: "stretch", title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", topic: "Tree", difficulty: "Hard" }
  ],
  "two-pointers": [
    { label: "warmUp", title: "Valid Palindrome", slug: "valid-palindrome", topic: "Two Pointers", difficulty: "Easy" },
    { label: "core", title: "3Sum", slug: "3sum", topic: "Two Pointers", difficulty: "Medium" },
    { label: "stretch", title: "Trapping Rain Water", slug: "trapping-rain-water", topic: "Two Pointers", difficulty: "Hard" }
  ]
};

// ---- GitHub Trending via search API ----

async function fetchGithubTrending(): Promise<DailyFeedItem[]> {
  const since = toISODateString(daysAgo(7));
  const url = `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=${GITHUB_PER_PAGE}`;
  const data = asRecord(await fetchJson(url, FETCH_TIMEOUT_MS));
  const items = Array.isArray(data?.items) ? data.items : [];

  if (!items.length) {
    return [];
  }

  return items.slice(0, GITHUB_PER_PAGE).map((rawItem, index) => {
    const item = asGithubRepository(rawItem);

    return {
      id: `gh-${item.id ?? index}`,
      title: item.full_name ?? "Unknown repo",
      url: item.html_url ?? "",
      description: item.description ?? "",
      source: "github" as const,
      metadata: `⭐ ${formatCount(item.stargazers_count)}`
    };
  });
}

// ---- HackerNews Top Stories ----

async function fetchHackerNews(): Promise<DailyFeedItem[]> {
  const topIdsUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
  const ids = await fetchJson(topIdsUrl, FETCH_TIMEOUT_MS);

  if (!Array.isArray(ids) || !ids.length) {
    return [];
  }

  const topIds = (ids as number[]).slice(0, HN_TOP_COUNT);
  const items = await Promise.all(
    topIds.map(async (id, index) => {
      try {
        const itemUrl = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
        const item = asHackerNewsStory(await fetchJson(itemUrl, FETCH_TIMEOUT_MS));
        return {
          id: `hn-${id}`,
          title: item?.title ?? "Untitled",
          url: item?.url ?? `https://news.ycombinator.com/item?id=${id}`,
          description: "",
          source: "hackernews" as const,
          metadata: `▲ ${formatCount(item?.score)} · 💬 ${formatCount(item?.descendants)}`
        };
      } catch {
        return {
          id: `hn-${index}`,
          title: `HN item #${id}`,
          url: `https://news.ycombinator.com/item?id=${id}`,
          description: "",
          source: "hackernews" as const,
          metadata: ""
        };
      }
    })
  );

  return items.filter((item) => Boolean(item.title));
}

// ---- LeetCode Daily Challenge ----

async function fetchLeetCodeDaily(): Promise<DailyFeedItem[]> {
  const { region } = await loadLeetCodeProfileConfig();
  const graphQLUrl = leetCodeGraphQLUrl(region);

  const body = {
    query: `
      query questionOfToday {
        activeDailyCodingChallengeQuestion {
          date
          link
          question {
            title
            titleSlug
            difficulty
            topicTags {
              name
              slug
            }
          }
        }
      }
    `
  };

  const data = await fetchJson<LeetCodeDailyResponse>(graphQLUrl, FETCH_TIMEOUT_MS, {
    method: "POST",
    headers: leetCodeHeaders(region),
    body: JSON.stringify(body)
  });

  const challenge = data?.data?.activeDailyCodingChallengeQuestion;

  if (!challenge?.question) {
    return [];
  }

  const q = challenge.question;
  const topicTags = q.topicTags?.filter(isLeetCodeTopicTag) ?? [];
  const topicNames = topicTags.map((tag) => tag.name).filter((name): name is string => Boolean(name));

  return [{
    id: `lc-${q.titleSlug ?? "daily"}`,
    title: q.title ?? "LeetCode Daily Challenge",
    url: leetCodeProblemUrl(region, challenge.link ?? "/problemset/"),
    description: "",
    difficulty: q.difficulty ?? "Unknown",
    source: "leetcode" as const,
    metadata: challenge.date ?? "",
    practice: buildPracticeQueue(topicTags),
    topicNames
  }];
}

// ---- LeetCode public activity ----

async function fetchLeetCodeActivity(): Promise<DailyFeedItem[]> {
  const { region, username } = await loadLeetCodeProfileConfig();

  if (!username) {
    return [{
      id: "lc-activity-config",
      title: "Set LeetCode username",
      url: leetCodeHomeUrl(region),
      description: "",
      source: "leetcodeActivity",
      metadata: ""
    }];
  }

  await getLeetCodeCSRFToken(region);

  if (region === "cn") {
    return await fetchLeetCodeCNActivity(username);
  }

  return await fetchLeetCodeComActivity(username);
}

async function fetchLeetCodeComActivity(username: string): Promise<DailyFeedItem[]> {
  const body = {
    query: `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          username
          submissionCalendar
        }
      }
    `,
    variables: { username }
  };

  const data = await fetchJson<LeetCodeActivityResponse>(leetCodeGraphQLUrl("com"), FETCH_TIMEOUT_MS, {
    method: "POST",
    credentials: "include",
    headers: leetCodeHeaders("com"),
    body: JSON.stringify(body)
  });
  const matchedUser = data.data?.matchedUser;

  if (!matchedUser?.submissionCalendar) {
    return [{
      id: `lc-activity-${username}-missing`,
      title: username,
      url: leetCodeProfileUrl("com", username),
      description: "",
      source: "leetcodeActivity",
      metadata: ""
    }];
  }

  const summary = buildActivitySummary(
    matchedUser.submissionCalendar,
    matchedUser.username ?? username
  );

  return [{
    activity: summary,
    id: `lc-activity-${summary.username}`,
    title: summary.username,
    url: leetCodeProfileUrl("com", summary.username),
    description: "",
    source: "leetcodeActivity",
    metadata: ""
  }];
}

async function fetchLeetCodeCNActivity(username: string): Promise<DailyFeedItem[]> {
  const body = {
    query: `
      query userProfile($userSlug: String!) {
        userProfilePublicProfile(userSlug: $userSlug) {
          username
          siteRanking
          submissionProgress {
            totalSubmissions
            acTotal
            questionTotal
          }
        }
      }
    `,
    variables: { userSlug: username }
  };

  const calendarUrl = `https://leetcode.cn/api/user_submission_calendar/${encodeURIComponent(username)}/`;

  const [graphQLData, calendarText] = await Promise.all([
    fetchJson<LeetCodeCNActivityResponse>(leetCodeGraphQLUrl("cn"), FETCH_TIMEOUT_MS, {
      method: "POST",
      credentials: "include",
      headers: leetCodeHeaders("cn"),
      body: JSON.stringify(body)
    }),
    fetchLeetCodeCnCalendar(calendarUrl)
  ]);

  const profile = graphQLData.data?.userProfilePublicProfile;

  if (!profile) {
    return [{
      id: `lc-activity-${username}-missing`,
      title: username,
      url: leetCodeProfileUrl("cn", username),
      description: "",
      source: "leetcodeActivity",
      metadata: ""
    }];
  }

  const resolvedUsername = profile.username ?? username;
  const progress = profile.submissionProgress;

  if (calendarText && calendarText !== "{}") {
    const summary = buildActivitySummary(calendarText, resolvedUsername);
    summary.siteRanking = profile.siteRanking;
    summary.totalSubmissions = progress?.totalSubmissions;
    summary.acTotal = progress?.acTotal;
    summary.questionTotal = progress?.questionTotal;

    return [{
      activity: summary,
      id: `lc-activity-${resolvedUsername}`,
      title: resolvedUsername,
      url: leetCodeProfileUrl("cn", resolvedUsername),
      description: "",
      source: "leetcodeActivity",
      metadata: ""
    }];
  }

  const summary: DailyFeedActivitySummary = {
    activeDaysLast7: 0,
    days: [],
    last30Submissions: progress?.totalSubmissions ?? 0,
    streakDays: 0,
    username: resolvedUsername,
    siteRanking: profile.siteRanking,
    totalSubmissions: progress?.totalSubmissions,
    acTotal: progress?.acTotal,
    questionTotal: progress?.questionTotal
  };

  return [{
    activity: summary,
    id: `lc-activity-${resolvedUsername}`,
    title: resolvedUsername,
    url: leetCodeProfileUrl("cn", resolvedUsername),
    description: "",
    source: "leetcodeActivity",
    metadata: ""
  }];
}

async function fetchLeetCodeCnCalendar(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: { Referer: "https://leetcode.cn/" }
    });

    if (!response.ok) {
      return undefined;
    }

    const rawText = await response.text();
    const text = rawText.trim();

    if (!text || text === "{}") {
      return undefined;
    }

    // The response may be a raw JSON object or a JSON-encoded string
    // Try parsing directly first (raw JSON object)
    try {
      JSON.parse(text);
      return text;
    } catch {
      // If direct parse fails, try stripping surrounding quotes and unescaping
      try {
        const inner = text.replace(/^"|"$/g, "").replace(/\\"/g, "\"");
        JSON.parse(inner);
        return inner;
      } catch {
        return undefined;
      }
    }
  } catch {
    return undefined;
  }
}

// ---- Fetch helpers ----

async function fetchJson(
  url: string,
  timeoutMs: number,
  options?: RequestInit
): Promise<unknown>;
async function fetchJson<T>(
  url: string,
  timeoutMs: number,
  options?: RequestInit
): Promise<T>;
async function fetchJson<T = unknown>(
  url: string,
  timeoutMs: number,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal, ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json() as T;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

// ---- Cache management ----

async function loadCache(source: FeedSource, cacheKey?: string): Promise<DailyFeedCache | null> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const allCaches = result[STORAGE_KEY];

    if (!allCaches || typeof allCaches !== "object") {
      return null;
    }

    const cache = (allCaches as Record<string, unknown>)[source];

    if (!cache || typeof cache !== "object") {
      return null;
    }

    const typed = cache as DailyFeedCache;

    if (!Array.isArray(typed.items) || typeof typed.timestamp !== "number") {
      return null;
    }

    if (typeof cacheKey === "string" && typed.cacheKey !== cacheKey) {
      return null;
    }

    return typed;
  } catch {
    return null;
  }
}

async function saveCache(source: FeedSource, items: DailyFeedItem[], cacheKey?: string): Promise<void> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const allCaches = (result[STORAGE_KEY] as Record<string, DailyFeedCache> | undefined) ?? {};

    allCaches[source] = { cacheKey, timestamp: Date.now(), source, items };

    await browser.storage.local.set({ [STORAGE_KEY]: allCaches });
  } catch {
    // Silently fail on cache write
  }
}

// ---- Public API ----

const fetchers: Record<FeedSource, () => Promise<DailyFeedItem[]>> = {
  github: fetchGithubTrending,
  hackernews: fetchHackerNews,
  leetcode: fetchLeetCodeDaily,
  leetcodeActivity: fetchLeetCodeActivity
};

export async function loadDailyFeed(source: FeedSource): Promise<DailyFeedItem[]> {
  const cacheKey = await resolveCacheKey(source);
  // Try cache first
  const cache = await loadCache(source, cacheKey);

  if (cache) {
    const age = Date.now() - cache.timestamp;

    if (age < CACHE_TTL_MS) {
      return cache.items;
    }

    // Stale cache — return cached items and refresh in background
    void refreshFeed(source);
    return cache.items;
  }

  return refreshFeed(source);
}

export async function refreshFeed(source: FeedSource): Promise<DailyFeedItem[]> {
  const fetcher = fetchers[source];
  const cacheKey = await resolveCacheKey(source);

  try {
    const items = await fetcher();
    await saveCache(source, items, cacheKey);
    return items;
  } catch {
    // Try stale cache on error
    const staleCache = await loadCache(source, cacheKey);
    return staleCache?.items ?? [];
  }
}

export async function prefetchAllFeeds(): Promise<void> {
  const sources: FeedSource[] = ["github", "hackernews", "leetcode", "leetcodeActivity"];

  await Promise.allSettled(
    sources.map((source) => refreshFeed(source))
  );
}

// ---- Utility ----

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function formatCount(value: unknown): string {
  if (typeof value !== "number") {
    return "—";
  }

  if (value >= 1000) {
    const k = value / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1)}k`;
  }

  return String(value);
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? value as JsonRecord : null;
}

function asGithubRepository(value: unknown): GithubRepository {
  const item = asRecord(value);

  if (!item) {
    return {};
  }

  return {
    ...item,
    description: getNullableString(item.description),
    full_name: getString(item.full_name),
    html_url: getString(item.html_url),
    id: getString(item.id) ?? getNumber(item.id),
    stargazers_count: getNumber(item.stargazers_count)
  };
}

function asHackerNewsStory(value: unknown): HackerNewsStory {
  const item = asRecord(value);

  if (!item) {
    return {};
  }

  return {
    ...item,
    descendants: getNumber(item.descendants),
    score: getNumber(item.score),
    title: getString(item.title),
    url: getString(item.url)
  };
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNullableString(value: unknown): string | null | undefined {
  return value === null || typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

async function resolveCacheKey(source: FeedSource): Promise<string | undefined> {
  if (source !== "leetcodeActivity") {
    return undefined;
  }

  const { username, region } = await loadLeetCodeProfileConfig();
  return username ? `${username.toLowerCase()}:${region}` : "not-configured";
}

function buildPracticeQueue(topicTags: LeetCodeTopicTag[]): DailyFeedPracticeItem[] {
  const templates = topicTags
    .map((tag) => tag.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => PRACTICE_BY_TOPIC[slug])
    .find((items): items is PracticeTemplate[] => Boolean(items)) ?? DEFAULT_PRACTICE_TEMPLATES;

  return templates.map((item) => ({
    id: `lc-practice-${item.slug}`,
    difficulty: item.difficulty,
    label: item.label,
    topic: item.topic,
    title: item.title,
    url: `${LEETCODE_URL_BASE}${item.slug}/`
  }));
}

function isLeetCodeTopicTag(value: LeetCodeTopicTag | undefined): value is LeetCodeTopicTag {
  return Boolean(value?.name || value?.slug);
}

function buildActivitySummary(calendarValue: string, username: string): DailyFeedActivitySummary {
  const calendar = parseSubmissionCalendar(calendarValue);
  const days = buildRecentActivityDays(calendar, 14);

  return {
    activeDaysLast7: days.slice(-7).filter((day) => day.count > 0).length,
    days,
    last30Submissions: sumRecentSubmissions(calendar, 30),
    streakDays: countCurrentStreak(calendar),
    username
  };
}

function parseSubmissionCalendar(value: string): Map<string, number> {
  try {
    const parsedValue = JSON.parse(value) as Record<string, unknown>;
    const entries = Object.entries(parsedValue)
      .map(([timestamp, count]) => [toISODateStringFromSeconds(Number(timestamp)), Number(count)] as const)
      .filter(([date, count]) => Boolean(date) && Number.isFinite(count));

    return new Map(entries);
  } catch {
    return new Map();
  }
}

function buildRecentActivityDays(calendar: Map<string, number>, length: number) {
  const today = getUtcDateStart(new Date());

  return Array.from({ length }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (length - 1 - index));
    const isoDate = toISODateString(date);

    return {
      count: calendar.get(isoDate) ?? 0,
      date: isoDate
    };
  });
}

function sumRecentSubmissions(calendar: Map<string, number>, length: number): number {
  const today = getUtcDateStart(new Date());
  let total = 0;

  for (let offset = 0; offset < length; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    total += calendar.get(toISODateString(date)) ?? 0;
  }

  return total;
}

function countCurrentStreak(calendar: Map<string, number>): number {
  const today = getUtcDateStart(new Date());
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);

    if ((calendar.get(toISODateString(date)) ?? 0) <= 0) {
      return streak;
    }

    streak += 1;
  }

  return streak;
}

function getUtcDateStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toISODateStringFromSeconds(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  return toISODateString(new Date(value * 1000));
}
