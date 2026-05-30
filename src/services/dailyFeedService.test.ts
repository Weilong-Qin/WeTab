import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { refreshFeed } from "./dailyFeedService";

const storageMock = vi.hoisted(() => ({
  get: vi.fn<(key: string) => Promise<Record<string, unknown>>>(),
  set: vi.fn<(value: Record<string, unknown>) => Promise<void>>()
}));

vi.mock("wxt/browser", () => ({
  browser: {
    storage: {
      local: storageMock
    }
  }
}));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-29T12:00:00Z"));
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  storageMock.get.mockReset();
  storageMock.get.mockImplementation(async (key) => {
    if (key === "vtab.leetcodeProfile") {
      return { "vtab.leetcodeProfile": { username: "alice" } };
    }

    return {};
  });
  storageMock.set.mockReset();
  storageMock.set.mockResolvedValue();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("dailyFeedService", () => {
  it("builds public LeetCode activity stats without submission code", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            matchedUser: {
              username: "alice",
              submissionCalendar: JSON.stringify({
                [toUnixDay("2026-05-29")]: 2,
                [toUnixDay("2026-05-28")]: 1,
                [toUnixDay("2026-05-26")]: 4,
                [toUnixDay("2026-05-01")]: 3
              })
            }
          }
        }),
        { status: 200 }
      )
    );

    const items = await refreshFeed("leetcodeActivity");

    expect(fetchMock).toHaveBeenCalledWith("https://leetcode.com/graphql/", expect.objectContaining({
      body: expect.stringContaining("submissionCalendar")
    }));
    expect(items[0]?.activity).toMatchObject({
      activeDaysLast7: 3,
      last30Submissions: 10,
      streakDays: 2,
      username: "alice"
    });
    expect(items[0]?.activity?.days).toHaveLength(14);
    expect(storageMock.set).toHaveBeenCalledWith({
      "vtab.dailyFeed": {
        leetcodeActivity: expect.objectContaining({
          cacheKey: "alice:com",
          source: "leetcodeActivity"
        })
      }
    });
  });

  it("returns a configuration prompt when no LeetCode username is set", async () => {
    storageMock.get.mockResolvedValue({});

    const items = await refreshFeed("leetcodeActivity");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(items[0]).toMatchObject({
      id: "lc-activity-config",
      source: "leetcodeActivity"
    });
  });
});

function toUnixDay(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
}
