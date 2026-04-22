import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser, GoalId } from './useAppContext';
import { RoutineItem, ROUTINE_ITEMS } from '../data/routineItems';

const STORAGE_KEY = 'askneo_routine_completions';

// ─── Types ────────────────────────────────────────────────────────────────────

// Record<YYYY-MM-DD, string[]> — date key → array of completed item IDs
type CompletionStore = Record<string, string[]>;

export interface WeekStats {
  activeDays:           number;  // days Mon→today with ≥1 item done
  daysInWeek:           number;  // days elapsed since Monday (1–7)
  proportionalProgress: number;  // 0–1 effort-quality ring fill
  streak:               number;  // max consecutive days across goal's items
  todayAllDone:         boolean; // every eligible item completed today
}

interface RoutineContextType {
  // Raw store (all history)
  completions: CompletionStore;
  // Today
  todayCompletions: string[];
  completeItem: (id: string) => void;
  uncompleteItem: (id: string) => void;
  isItemDoneToday: (id: string) => boolean;
  // Filtering
  getTodayItems: (user: AppUser) => RoutineItem[];
  getGoalItems: (user: AppUser, goalId: GoalId) => RoutineItem[];
  // Progress
  getGoalProgress:     (user: AppUser, goalId: GoalId, days?: number) => number; // 0–1
  getWeekStats:        (user: AppUser, goalId: GoalId) => WeekStats;
  getItemStreak:       (id: string) => number; // consecutive days completed
  // Aggregate streak / activity
  getOverallStreak:     (user: AppUser) => number;
  // [Mon…Sun] 0-1 intensity per day (0 = future or missed, 0-1 = completion ratio)
  getWeekIntensity:     (user: AppUser) => number[];
  getGoalWeekIntensity: (user: AppUser, goalId: GoalId) => number[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getGestationalWeek(dueDateISO?: string): number | null {
  if (!dueDateISO) return null;
  const msLeft = new Date(dueDateISO).getTime() - Date.now();
  const weeksLeft = msLeft / (7 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.round(40 - weeksLeft));
}

function getPostnatalWeek(babyDOBISO?: string): number | null {
  if (!babyDOBISO) return null;
  const diffMs = Date.now() - new Date(babyDOBISO).getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Like getEligibleItems but applies primary-goal deduplication:
 * each item is "owned" by the first of its goalIds that appears in user.goals.
 * Universal items are owned by the first goal.
 * This matches the HomeScreen / GoalStoryScreen deduplication so that shared
 * items are only counted in one goal's progress stats.
 */
function getPrimaryEligibleItems(
  user: AppUser,
  completions: CompletionStore,
  goalId: GoalId,
): RoutineItem[] {
  const eligible = getEligibleItems(user, completions, goalId);
  const goals    = user.goals ?? [];
  return eligible.filter(it => {
    if (it.universalItem) return goals[0] === goalId;
    const primary = it.goalIds.find(g => goals.includes(g as any));
    return primary === goalId;
  });
}

/**
 * Filter routine items to those eligible for a given user right now.
 * Eligibility checks:
 *   1. Correct stage
 *   2. Correct gestational/postnatal week window
 *   3. Matches goal selection (if user has goals set)
 *   4. Matches intent flags (birthIntention, feedingIntention)
 *   5. trimester-once items that have already been completed (any date) are excluded
 */
function getEligibleItems(
  user: AppUser,
  completions: CompletionStore,
  goalFilter?: GoalId,
): RoutineItem[] {
  const week =
    user.stage === 'pregnancy'
      ? getGestationalWeek(user.dueDate)
      : user.stage === 'newmom'
      ? getPostnatalWeek(user.babyDOB)
      : null;

  // All completion IDs across all time (for trimester-once check)
  const allCompleted = new Set(Object.values(completions).flat());

  return ROUTINE_ITEMS.filter(item => {
    // Stage
    if (!item.stage.includes(user.stage)) return false;

    // Week range
    if (week !== null) {
      if (item.weekRange?.min !== undefined && week < item.weekRange.min) return false;
      if (item.weekRange?.max !== undefined && week > item.weekRange.max) return false;
    }

    // Goal filter — universal items always pass; otherwise must match a selected goal
    const userGoals = goalFilter ? [goalFilter] : (user.goals ?? []);
    if (userGoals.length > 0 && !item.universalItem) {
      const matchesGoal = item.goalIds.some(g => userGoals.includes(g));
      const matchesSubGoal =
        item.subGoalIds?.some(sg => (user.subGoals ?? []).includes(sg)) ?? false;
      // For baby-development goal, also match via sub-goals
      if (!matchesGoal && !matchesSubGoal) return false;
    }

    // Intent filters
    if (item.requiresBirthIntention) {
      if (user.birthIntention !== item.requiresBirthIntention) return false;
    }
    if (item.requiresFeedingIntention) {
      if (user.feedingIntention !== item.requiresFeedingIntention) return false;
    }

    // trimester-once: hide if already completed at any point
    if (item.frequency === 'trimester-once' && allCompleted.has(item.id)) return false;

    return true;
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────

const RoutineContext = createContext<RoutineContextType>({
  completions: {},
  todayCompletions: [],
  completeItem: () => {},
  uncompleteItem: () => {},
  isItemDoneToday: () => false,
  getTodayItems: () => [],
  getGoalItems: () => [],
  getGoalProgress: () => 0,
  getWeekStats:        () => ({ activeDays: 0, daysInWeek: 1, proportionalProgress: 0, streak: 0, todayAllDone: false }),
  getItemStreak:       () => 0,
  getOverallStreak:     () => 0,
  getWeekIntensity:     () => Array(7).fill(0),
  getGoalWeekIntensity: () => Array(7).fill(0),
});

export const RoutineProvider = ({ children }: { children: React.ReactNode }) => {
  const [completions, setCompletions] = useState<CompletionStore>({});
  const todayKey = toDateKey();

  // ── Load from storage ──────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) setCompletions(JSON.parse(val));
    });
  }, []);

  // ── Persist whenever completions change ───────────────────────────────
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
  }, [completions]);

  const todayCompletions = completions[todayKey] ?? [];

  // ── Completion actions ─────────────────────────────────────────────────
  const completeItem = useCallback((id: string) => {
    setCompletions(prev => {
      const today = prev[todayKey] ?? [];
      if (today.includes(id)) return prev;
      return { ...prev, [todayKey]: [...today, id] };
    });
  }, [todayKey]);

  const uncompleteItem = useCallback((id: string) => {
    setCompletions(prev => {
      const today = prev[todayKey] ?? [];
      return { ...prev, [todayKey]: today.filter(x => x !== id) };
    });
  }, [todayKey]);

  const isItemDoneToday = useCallback(
    (id: string) => todayCompletions.includes(id),
    [todayCompletions],
  );

  // ── Filtering ──────────────────────────────────────────────────────────

  /**
   * Returns today's surface items (max 5) for the home card and check-in.
   * Priority:
   *   1. Not yet done today
   *   2. Daily items before weekly before trimester-once
   *   3. Items with a broken streak are boosted
   */
  const getTodayItems = useCallback(
    (user: AppUser): RoutineItem[] => {
      const eligible = getEligibleItems(user, completions);

      const scored = eligible.map(item => {
        let score = 0;
        // Not done today: highest priority
        if (!todayCompletions.includes(item.id)) score += 100;
        // Daily items are more time-sensitive
        if (item.frequency === 'daily') score += 30;
        if (item.frequency === 'weekly') score += 10;
        // Boost items with a streak going (don't break it)
        const streak = getStreakFor(item.id, completions);
        if (streak > 0) score += Math.min(streak * 5, 20);
        return { item, score };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, 6).map(s => s.item);
    },
    [completions, todayCompletions],
  );

  /** All eligible items for a specific goal (for the full routine screen). */
  const getGoalItems = useCallback(
    (user: AppUser, goalId: GoalId): RoutineItem[] =>
      getEligibleItems(user, completions, goalId),
    [completions],
  );

  // ── Progress ───────────────────────────────────────────────────────────

  /**
   * Returns a 0–1 completion ratio for a goal over the last N days.
   * Counts: (days with at least one goal item completed) / (total eligible days)
   */
  const getGoalProgress = useCallback(
    (user: AppUser, goalId: GoalId, days = 7): number => {
      const eligible = getEligibleItems(user, completions, goalId);
      if (eligible.length === 0) return 0;
      const eligibleIds = new Set(eligible.map(i => i.id));
      let completedDays = 0;
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        const dayCompletions = completions[key] ?? [];
        if (dayCompletions.some(id => eligibleIds.has(id))) completedDays++;
      }
      return completedDays / days;
    },
    [completions],
  );

  /**
   * Returns rich weekly stats for the WeeklyRingsWidget.
   * Uses the calendar week (Mon → today) rather than a rolling 7-day window.
   */
  const getWeekStats = useCallback(
    (user: AppUser, goalId: GoalId): WeekStats => {
      const eligible = getPrimaryEligibleItems(user, completions, goalId);
      if (eligible.length === 0) {
        return { activeDays: 0, daysInWeek: 1, proportionalProgress: 0, streak: 0, todayAllDone: false };
      }
      const eligibleIds = new Set(eligible.map(i => i.id));

      // How many days have elapsed since Monday (Mon=1 … Sun=7)
      const dow = new Date().getDay();               // 0=Sun … 6=Sat
      const daysSinceMon = dow === 0 ? 6 : dow - 1; // Mon→0, Tue→1 … Sun→6
      const daysInWeek   = daysSinceMon + 1;

      let activeDays      = 0;
      let proportionalSum = 0;

      for (let i = 0; i < daysInWeek; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayDone = (completions[toDateKey(d)] ?? []).filter(id => eligibleIds.has(id));
        if (dayDone.length > 0) activeDays++;
        proportionalSum += dayDone.length / eligible.length;
      }

      const todayDone  = (completions[toDateKey()] ?? []).filter(id => eligibleIds.has(id));
      const streak     = Math.max(0, ...eligible.map(it => getStreakFor(it.id, completions)));

      return {
        activeDays,
        daysInWeek,
        proportionalProgress: proportionalSum / daysInWeek,
        streak,
        todayAllDone: todayDone.length >= eligible.length,
      };
    },
    [completions],
  );

  /** Consecutive days the user completed ≥1 eligible item across ANY goal. */
  const getOverallStreak = useCallback(
    (user: AppUser): number => {
      const eligible = getEligibleItems(user, completions);
      if (eligible.length === 0) return 0;
      const eligibleIds = new Set(eligible.map(i => i.id));
      let streak = 0;
      let d = new Date();
      const activeToday = (completions[toDateKey(d)] ?? []).some(id => eligibleIds.has(id));
      if (!activeToday) d.setDate(d.getDate() - 1); // allow gap: streak survives until tomorrow
      while (true) {
        const key = toDateKey(d);
        if ((completions[key] ?? []).some(id => eligibleIds.has(id))) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }
      return streak;
    },
    [completions],
  );

  /**
   * Returns a 7-element intensity array [Mon…Sun] for the current calendar week.
   * Value is 0 for future days OR days with no completions.
   * Rendering should distinguish future (i > todayIndex) from past-zero visually.
   * Value is 0–1 (dayDone / eligible) for days with at least one completion.
   */
  const getWeekIntensity = useCallback(
    (user: AppUser): number[] => {
      const eligible = getEligibleItems(user, completions);
      if (eligible.length === 0) return Array(7).fill(0);
      const eligibleIds = new Set(eligible.map(i => i.id));
      const dow = new Date().getDay();
      const daysSinceMon = dow === 0 ? 6 : dow - 1;
      return Array.from({ length: 7 }, (_, i) => {
        if (i > daysSinceMon) return 0;
        const d = new Date();
        d.setDate(d.getDate() - (daysSinceMon - i));
        const dayDone = (completions[toDateKey(d)] ?? []).filter(id => eligibleIds.has(id));
        return dayDone.length / eligible.length;
      });
    },
    [completions],
  );

  /** Same as getWeekIntensity but filtered to a single goal (with primary-goal deduplication). */
  const getGoalWeekIntensity = useCallback(
    (user: AppUser, goalId: GoalId): number[] => {
      const eligible = getPrimaryEligibleItems(user, completions, goalId);
      if (eligible.length === 0) return Array(7).fill(0);
      const eligibleIds = new Set(eligible.map(i => i.id));
      const dow = new Date().getDay();
      const daysSinceMon = dow === 0 ? 6 : dow - 1;
      return Array.from({ length: 7 }, (_, i) => {
        if (i > daysSinceMon) return 0;
        const d = new Date();
        d.setDate(d.getDate() - (daysSinceMon - i));
        const dayDone = (completions[toDateKey(d)] ?? []).filter(id => eligibleIds.has(id));
        return dayDone.length / eligible.length;
      });
    },
    [completions],
  );

  /** Consecutive days a specific item has been completed ending today. */
  const getItemStreak = useCallback(
    (id: string): number => getStreakFor(id, completions),
    [completions],
  );

  return (
    <RoutineContext.Provider
      value={{
        completions,
        todayCompletions,
        completeItem,
        uncompleteItem,
        isItemDoneToday,
        getTodayItems,
        getGoalItems,
        getGoalProgress,
        getWeekStats,
        getItemStreak,
        getOverallStreak,
        getWeekIntensity,
        getGoalWeekIntensity,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = () => useContext(RoutineContext);

// ─── Pure helper (outside context for use inside callbacks) ──────────────────

function getStreakFor(id: string, completions: CompletionStore): number {
  let streak = 0;
  let d = new Date();
  // Start from yesterday if not done today (streak continues until tomorrow)
  // Start from today if done today
  const todayKey = toDateKey(d);
  const doneTodayAlready = (completions[todayKey] ?? []).includes(id);
  if (!doneTodayAlready) {
    d.setDate(d.getDate() - 1); // check from yesterday backwards
  }
  while (true) {
    const key = toDateKey(d);
    if ((completions[key] ?? []).includes(id)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
