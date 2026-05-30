import { useCallback, useEffect, useMemo, useState } from "react";
import { cx } from "../utils/classNames";
import { Icon, type IconName } from "./Icon";
import type { DailyFeedActivitySummary, DailyFeedItem, DailyFeedPracticeItem, FeedSource } from "../types/dailyFeed";
import { loadDailyFeed, refreshFeed } from "../services/dailyFeedService";
import { browser } from "wxt/browser";

const DAILY_FEED_COLLAPSED_KEY = "vtab.dailyFeedCollapsed";

export interface DailyFeedSourceMeta {
  source: FeedSource;
  label: string;
  icon: IconName;
}

export const DAILY_FEED_SOURCES: DailyFeedSourceMeta[] = [
  { source: "github", label: "GitHub Trending", icon: "code" },
  { source: "hackernews", label: "HackerNews", icon: "rss" },
  { source: "leetcode", label: "LeetCode Daily", icon: "flask" },
  { source: "leetcodeActivity", label: "LeetCode Activity", icon: "check" }
];

export interface FeedGroupConfig {
  id: string;
  label: string;
  icon: IconName;
  sources: FeedSource[];
}

export const DAILY_FEED_GROUPS: FeedGroupConfig[] = [
  { id: "github", label: "GitHub Trending", icon: "code", sources: ["github"] },
  { id: "hackernews", label: "HackerNews", icon: "rss", sources: ["hackernews"] },
  { id: "leetcode", label: "LeetCode", icon: "flask", sources: ["leetcode", "leetcodeActivity"] }
];

interface SourceColumnState {
  items: DailyFeedItem[];
  isLoading: boolean;
  error: boolean;
}

const INITIAL_COLUMN: SourceColumnState = { items: [], isLoading: true, error: false };

export interface DailyFeedLabels {
  activity: {
    activeDays: (count: number) => string;
    acTotal: (ac: number, total: number) => string;
    configureDescription: string;
    last30: (count: number) => string;
    notFoundDescription: string;
    siteRanking: (ranking: string) => string;
    streak: (count: number) => string;
    totalSubmissions: (count: number) => string;
  };
  collapse: string;
  difficulty: (difficulty: string, topics: string[]) => string;
  expand: string;
  practiceLabels: Record<DailyFeedPracticeItem["label"], string>;
  practiceMetadata: (topic: string, difficulty: string) => string;
  relatedPracticeSubtitle: string;
  relatedPracticeTitle: string;
  groups: Record<string, string>;
  retry: string;
  sources: Record<FeedSource, string>;
  title: string;
  topicName: (topic: string) => string;
  unknownDifficulty: string;
}

const DEFAULT_LABELS: DailyFeedLabels = {
  activity: {
    activeDays: (count) => `${count}/7 active days`,
    acTotal: (ac, total) => `${ac}/${total} solved`,
    configureDescription: "Set a LeetCode username in settings to show public activity.",
    last30: (count) => `${count} submissions in 30d`,
    notFoundDescription: "No public activity found for this username.",
    siteRanking: (ranking) => `Ranking #${ranking}`,
    streak: (count) => `${count} day streak`,
    totalSubmissions: (count) => `${count} total submissions`
  },
  collapse: "Collapse",
  difficulty: (difficulty, topics) => [`Difficulty: ${difficulty}`, ...topics.slice(0, 2)].join(" · "),
  expand: "Expand",
  practiceLabels: {
    core: "Core",
    stretch: "Stretch",
    warmUp: "Warm-up"
  },
  practiceMetadata: (topic, difficulty) => `${topic} · ${difficulty}`,
  relatedPracticeSubtitle: "Warm-up · Core · Stretch",
  relatedPracticeTitle: "Related Practice",
  groups: {
    leetcode: "LeetCode"
  },
  retry: "Retry",
  sources: {
    github: "GitHub Trending",
    hackernews: "HackerNews",
    leetcode: "LeetCode Daily",
    leetcodeActivity: "LeetCode Activity"
  },
  title: "Daily Feed",
  topicName: (topic) => topic,
  unknownDifficulty: "Unknown"
};

function buildInitialColumnsForSources(sourceList: FeedSource[]): Record<FeedSource, SourceColumnState> {
  const initial: Partial<Record<FeedSource, SourceColumnState>> = {};

  for (const source of sourceList) {
    initial[source] = { ...INITIAL_COLUMN };
  }

  return initial as Record<FeedSource, SourceColumnState>;
}

export interface DailyFeedProps {
  labels?: DailyFeedLabels;
  groups?: FeedGroupConfig[];
  title?: string;
  collapseLabel?: string;
  expandLabel?: string;
  retryLabel?: string;
}

function getPracticeItems(items: DailyFeedItem[]): DailyFeedPracticeItem[] {
  return items.flatMap((item) => item.practice ?? []);
}

function getItemDescription(item: DailyFeedItem, labels: DailyFeedLabels): string {
  if (item.source === "leetcode" && item.difficulty) {
    return labels.difficulty(
      item.difficulty === "Unknown" ? labels.unknownDifficulty : item.difficulty,
      (item.topicNames ?? []).map((topic) => labels.topicName(topic))
    );
  }

  return item.description;
}

export function DailyFeed({
  labels = DEFAULT_LABELS,
  groups = DAILY_FEED_GROUPS,
  title = labels.title,
  collapseLabel = labels.collapse,
  expandLabel = labels.expand,
  retryLabel = labels.retry
}: DailyFeedProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(DAILY_FEED_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    async function loadCollapsedState() {
      try {
        const result = await browser.storage.local.get(DAILY_FEED_COLLAPSED_KEY);

        if (typeof result[DAILY_FEED_COLLAPSED_KEY] === "boolean") {
          setIsCollapsed(result[DAILY_FEED_COLLAPSED_KEY]);
        }
      } catch {
        // keep localStorage fallback value
      }
    }

    void loadCollapsedState();
  }, []);

  const persistCollapsedState = useCallback((next: boolean) => {
    try {
      void browser.storage.local.set({ [DAILY_FEED_COLLAPSED_KEY]: next });
    } catch {
      // ignore
    }

    try {
      window.localStorage.setItem(DAILY_FEED_COLLAPSED_KEY, String(next));
    } catch {
      // ignore
    }
  }, []);

  const handleToggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      persistCollapsedState(!prev);
      return !prev;
    });
  }, [persistCollapsedState]);

  const allSources = useMemo(() => groups.flatMap((g) => g.sources), [groups]);

  const [columns, setColumns] = useState<Record<FeedSource, SourceColumnState>>(
    () => buildInitialColumnsForSources(allSources)
  );

  useEffect(() => {
    let isMounted = true;

    const timers = allSources.map((source) =>
      globalThis.setTimeout(() => {
        void loadDailyFeed(source)
          .then((result) => {
            if (!isMounted) {
              return;
            }

            setColumns((prev) => ({
              ...prev,
              [source]: { items: result, isLoading: false, error: !result.length }
            }));
          })
          .catch(() => {
            if (!isMounted) {
              return;
            }

            setColumns((prev) => ({
              ...prev,
              [source]: { items: [], isLoading: false, error: true }
            }));
          });
      }, 0)
    );

    return () => {
      isMounted = false;

      for (const timer of timers) {
        globalThis.clearTimeout(timer);
      }
    };
  }, [allSources]);

  const handleRetry = useCallback(async (source: FeedSource) => {
    setColumns((prev) => ({
      ...prev,
      [source]: { ...(prev[source] ?? INITIAL_COLUMN), isLoading: true, error: false }
    }));

    try {
      const result = await refreshFeed(source);
      setColumns((prev) => ({
        ...prev,
        [source]: { items: result, isLoading: false, error: !result.length }
      }));
    } catch {
      setColumns((prev) => ({
        ...prev,
        [source]: { items: [], isLoading: false, error: true }
      }));
    }
  }, []);

  const gridStyle: React.CSSProperties = { "--daily-feed-columns": String(groups.length) } as React.CSSProperties;

  return (
    <section className={cx("daily-feed", isCollapsed && "daily-feed--collapsed")}>
      <div className="daily-feed__header">
        <div className="daily-feed__title-row">
          <Icon className="daily-feed__title-icon" name="flame" size={16} />
          <h3 className="type-label-md">{title}</h3>
        </div>
        <button
          className="daily-feed__collapse-btn"
          aria-label={isCollapsed ? expandLabel : collapseLabel}
          onClick={handleToggleCollapsed}
          title={isCollapsed ? expandLabel : collapseLabel}
          type="button"
        >
          <Icon
            name={isCollapsed ? "chevronDown" : "chevronRight"}
            size={14}
          />
        </button>
      </div>

      {!isCollapsed && (
        <div className="daily-feed__body">
          <div
            className="daily-feed__grid"
            style={gridStyle}
          >
            {groups.map((group) => {
              const groupLabel = labels.groups[group.id] ?? group.label;
              const isMultiSource = group.sources.length > 1;

              return (
                <article className="daily-feed__column" key={group.id}>
                  <div className="daily-feed__column-header">
                    <Icon name={group.icon} size={13} />
                    <span>{groupLabel}</span>
                  </div>
                  <div className="daily-feed__column-body">
                    {group.sources.map((source, sourceIndex) => {
                      const col = columns[source] ?? INITIAL_COLUMN;
                      const sourceLabel = labels.sources[source] ?? source;

                      return (
                        <div
                          className={cx(
                            "daily-feed__sub-module",
                            isMultiSource && "daily-feed__sub-module--grouped"
                          )}
                          key={source}
                        >
                          {isMultiSource && (
                            <div className="daily-feed__sub-module-header">
                              <span>{sourceLabel}</span>
                            </div>
                          )}
                          <div className="daily-feed__sub-module-body">
                            {col.isLoading ? (
                              <div className="daily-feed__skeleton">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div className="daily-feed__skeleton-row" key={i}>
                                    <div className="daily-feed__skeleton-line" />
                                  </div>
                                ))}
                              </div>
                            ) : col.error || !col.items.length ? (
                              <div className="daily-feed__empty">
                                <p>—</p>
                                <button
                                  className="daily-feed__retry-btn"
                                  onClick={() => void handleRetry(source)}
                                  type="button"
                                >
                                  <Icon name="refresh" size={10} />
                                  {retryLabel}
                                </button>
                              </div>
                            ) : (
                              <SubModuleContent
                                items={col.items}
                                labels={labels}
                                source={source}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function SubModuleContent({
  items,
  labels,
  source
}: {
  items: DailyFeedItem[];
  labels: DailyFeedLabels;
  source: FeedSource;
}) {
  if (source === "leetcodeActivity") {
    const item = items[0];

    return item?.activity ? (
      <LeetCodeActivity activity={item.activity} labels={labels} profileUrl={item.url} />
    ) : (
      <LeetCodeActivityEmpty item={item} labels={labels} />
    );
  }

  return (
    <>
      <ul className="daily-feed__list">
        {items.map((item) => {
          const description = getItemDescription(item, labels);

          return (
            <li className="daily-feed__item" key={item.id}>
              <a
                className="daily-feed__item-link"
                href={item.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="daily-feed__item-content">
                  <span className="daily-feed__item-title">{item.title}</span>
                  {description && (
                    <span className="daily-feed__item-desc">{description}</span>
                  )}
                </div>
                {item.metadata && (
                  <span className="daily-feed__item-meta">{item.metadata}</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
      {source === "leetcode" && (
        <RelatedPractice items={getPracticeItems(items)} labels={labels} />
      )}
    </>
  );
}

function LeetCodeActivity({
  activity,
  labels,
  profileUrl
}: {
  activity: DailyFeedActivitySummary;
  labels: DailyFeedLabels;
  profileUrl: string;
}) {
  const isCNStyle = activity.days.length === 0;

  return (
    <div className="daily-feed__activity">
      <a className="daily-feed__activity-profile" href={profileUrl} rel="noopener noreferrer" target="_blank">
        <span>{activity.username}</span>
        <Icon name="external" size={12} />
      </a>
      {isCNStyle ? (
        <div className="daily-feed__activity-stats">
          {activity.siteRanking !== undefined && (
            <span>{labels.activity.siteRanking(String(activity.siteRanking))}</span>
          )}
          {activity.totalSubmissions !== undefined && (
            <span>{labels.activity.totalSubmissions(activity.totalSubmissions)}</span>
          )}
          {activity.acTotal !== undefined && (
            <span>{labels.activity.acTotal(activity.acTotal, activity.questionTotal ?? 0)}</span>
          )}
        </div>
      ) : (
        <div className="daily-feed__activity-row">
          <div className="daily-feed__activity-stats">
            <span>{labels.activity.activeDays(activity.activeDaysLast7)}</span>
            <span>{labels.activity.last30(activity.last30Submissions)}</span>
            <span>{labels.activity.streak(activity.streakDays)}</span>
          </div>
          <div className="daily-feed__activity-strip">
            {activity.days.map((day) => {
              const intensity = day.count <= 0 ? 0 : day.count <= 2 ? 1 : day.count <= 6 ? 2 : day.count <= 14 ? 3 : 4;

              return (
                <span
                  aria-label={`${day.date}: ${day.count}`}
                  className={cx(
                    "daily-feed__activity-day",
                    `daily-feed__activity-day--l${intensity}`
                  )}
                  key={day.date}
                  title={`${day.date}: ${day.count}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LeetCodeActivityEmpty({
  item,
  labels
}: {
  item?: DailyFeedItem;
  labels: DailyFeedLabels;
}) {
  const description = item?.id.endsWith("-missing")
    ? labels.activity.notFoundDescription
    : labels.activity.configureDescription;

  return (
    <div className="daily-feed__activity daily-feed__activity--empty">
      <p>{description}</p>
    </div>
  );
}

function RelatedPractice({
  items,
  labels
}: {
  items: DailyFeedPracticeItem[];
  labels: DailyFeedLabels;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="daily-feed__practice">
      <div className="daily-feed__practice-header">
        <span>{labels.relatedPracticeTitle}</span>
        <span>{labels.relatedPracticeSubtitle}</span>
      </div>
      <ul className="daily-feed__practice-list">
        {items.map((item) => (
          <li className="daily-feed__practice-item" key={item.id}>
            <a
              className="daily-feed__practice-link"
              href={item.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="daily-feed__practice-label">{labels.practiceLabels[item.label]}</span>
              <span className="daily-feed__practice-content">
                <span className="daily-feed__practice-title">{item.title}</span>
                <span className="daily-feed__practice-meta">
                  {labels.practiceMetadata(labels.topicName(item.topic), item.difficulty)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
