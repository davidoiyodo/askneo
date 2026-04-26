import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'askneo_cycle_logs';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CMType = 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white';
export type OPKResult = 'negative' | 'positive' | 'peak';
export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';
export type HPTResult = 'negative' | 'faint-positive' | 'positive';

export interface CycleEntry {
  dateKey: string;         // YYYY-MM-DD
  isPeriodStart: boolean;  // CD1 of a new cycle
  isPeriodFlow: boolean;   // any flow day (including CD2+)
  flowIntensity?: FlowIntensity; // granular flow level
  bbtTemp: number | null;  // °C, basal body temperature
  cmType: CMType | null;   // cervical mucus observation
  opkResult: OPKResult | null;
  notes: string;
  hptResult?: HPTResult;   // home pregnancy test result
  hadSex?: boolean;
  usedProtection?: boolean;
  mood?: string;           // single mood selection
  symptoms?: string[];     // multi-select symptom list
}

export interface CompletedCycle {
  startKey: string;
  length: number; // days
}

export interface FertileWindowPrediction {
  /** ISO date key — first day of the fertile window (CD 10 of predicted cycle) */
  startKey: string;
  /** ISO date key — last day of the fertile window (CD 16) */
  endKey: string;
  /** ISO date key — peak fertility midpoint (CD 14) */
  peakKey: string;
  /** ISO date key — predicted period start of the cycle containing this window */
  periodStartKey: string;
  /** Days from today until the start of the fertile window (0 = starts today, negative = already in it) */
  daysUntilStart: number;
  /** true when today falls inside this window */
  isCurrentWindow: boolean;
}

interface CycleLogsContextType {
  logs: Record<string, CycleEntry>;
  getEntry: (dateKey: string) => CycleEntry | null;
  todayEntry: CycleEntry | null;
  saveEntry: (entry: CycleEntry) => Promise<void>;
  /** ISO date key of the most recent period start, or null */
  lastPeriodStartKey: string | null;
  /** All period start keys, sorted ascending */
  allCycleStartKeys: string[];
  /** 1-based cycle day from the last period start (or LMP seed) */
  cycleDay: (seedLmpKey?: string) => number;
  /** true if today is in the estimated fertile window (CD 10–16) */
  isFertileToday: (seedLmpKey?: string) => boolean;
  /** true if today is estimated peak fertility (CD 13–15) */
  isPeakToday: (seedLmpKey?: string) => boolean;
  /** Days until the next expected test day (end of TWW) */
  daysUntilTestDay: (seedLmpKey?: string) => number;
  /** Entries from the current cycle anchor to today, each paired with their CD */
  getCurrentCycleData: (seedLmpKey?: string) => Array<{ cd: number; entry: CycleEntry }>;
  /** Completed cycles with their lengths */
  completedCycles: CompletedCycle[];
  /** Average cycle length from completed cycles, fallback 28 */
  avgCycleLength: number;
  /** CD of confirmed ovulation in the current cycle from OPK, or null */
  confirmedOvulationCD: (seedLmpKey?: string) => number | null;
  /**
   * Predicts the next (or current) fertile window from the last known period start.
   * Returns null if there is no anchor date at all.
   */
  nextFertileWindow: (seedLmpKey?: string) => FertileWindowPrediction | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(from + 'T12:00:00').getTime();
  const b = new Date(to   + 'T12:00:00').getTime();
  return Math.round((b - a) / 86400000);
}

function addDays(dateKey: string, n: number): string {
  const d = new Date(dateKey + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CycleLogsContext = createContext<CycleLogsContextType>({
  logs: {},
  getEntry: () => null,
  todayEntry: null,
  saveEntry: async () => {},
  lastPeriodStartKey: null,
  allCycleStartKeys: [],
  cycleDay: () => 1,
  isFertileToday: () => false,
  isPeakToday: () => false,
  daysUntilTestDay: () => 14,
  getCurrentCycleData: () => [],
  completedCycles: [],
  avgCycleLength: 28,
  confirmedOvulationCD: () => null,
  nextFertileWindow: () => null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CycleLogsProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<Record<string, CycleEntry>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (!val) return;
      try { setLogs(JSON.parse(val)); } catch {}
    });
  }, []);

  const todayKey = toDateKey();
  const todayEntry = logs[todayKey] ?? null;

  // All period start keys sorted ascending
  const allCycleStartKeys = useMemo(() =>
    Object.values(logs)
      .filter(e => e.isPeriodStart)
      .map(e => e.dateKey)
      .sort(),
    [logs]
  );

  // Most recent period start key
  const lastPeriodStartKey: string | null = allCycleStartKeys[allCycleStartKeys.length - 1] ?? null;

  // Completed cycles: each pair of adjacent period starts
  const completedCycles: CompletedCycle[] = useMemo(() => {
    const result: CompletedCycle[] = [];
    for (let i = 0; i < allCycleStartKeys.length - 1; i++) {
      const length = daysBetween(allCycleStartKeys[i], allCycleStartKeys[i + 1]);
      if (length >= 18 && length <= 45) { // sanity check
        result.push({ startKey: allCycleStartKeys[i], length });
      }
    }
    return result;
  }, [allCycleStartKeys]);

  // Average cycle length
  const avgCycleLength: number = useMemo(() => {
    if (completedCycles.length === 0) return 28;
    const sum = completedCycles.reduce((acc, c) => acc + c.length, 0);
    return Math.round(sum / completedCycles.length);
  }, [completedCycles]);

  const saveEntry = async (entry: CycleEntry) => {
    setLogs(prev => {
      const next = { ...prev, [entry.dateKey]: entry };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getEntry = (dateKey: string) => logs[dateKey] ?? null;

  /** Returns 1-based cycle day. Falls back to seedLmpKey if no period start logged. */
  const cycleDay = (seedLmpKey?: string): number => {
    const anchor = lastPeriodStartKey ?? seedLmpKey ?? null;
    if (!anchor) return 1;
    const diff = daysBetween(anchor, todayKey);
    return Math.max(1, diff + 1);
  };

  const isFertileToday = (seedLmpKey?: string): boolean => {
    const cd = cycleDay(seedLmpKey);
    return cd >= 10 && cd <= 16;
  };

  const isPeakToday = (seedLmpKey?: string): boolean => {
    const cd = cycleDay(seedLmpKey);
    return cd >= 13 && cd <= 15;
  };

  /** Days until the expected test window (end of TWW = cycle length + 1 day) */
  const daysUntilTestDay = (seedLmpKey?: string): number => {
    const anchor = lastPeriodStartKey ?? seedLmpKey ?? null;
    if (!anchor) return 14;
    const testDateKey = addDays(anchor, avgCycleLength);
    const diff = daysBetween(todayKey, testDateKey);
    return Math.max(0, diff);
  };

  /** All entries from the current cycle anchor to today, paired with their CD */
  const getCurrentCycleData = (seedLmpKey?: string): Array<{ cd: number; entry: CycleEntry }> => {
    const anchor = lastPeriodStartKey ?? seedLmpKey ?? null;
    if (!anchor) return todayEntry ? [{ cd: 1, entry: todayEntry }] : [];
    const result: Array<{ cd: number; entry: CycleEntry }> = [];
    let cursor = anchor;
    let cd = 1;
    while (cursor <= todayKey) {
      const entry = logs[cursor];
      if (entry) result.push({ cd, entry });
      cursor = addDays(cursor, 1);
      cd++;
    }
    return result;
  };

  /** CD of confirmed ovulation in the current cycle from OPK peak or positive */
  const confirmedOvulationCD = (seedLmpKey?: string): number | null => {
    const anchor = lastPeriodStartKey ?? seedLmpKey ?? null;
    if (!anchor) return null;
    const data = getCurrentCycleData(seedLmpKey);
    // Prefer OPK peak first
    const peakEntry = data.find(d => d.entry.opkResult === 'peak');
    if (peakEntry) return peakEntry.cd;
    const positiveEntry = data.find(d => d.entry.opkResult === 'positive');
    if (positiveEntry) return positiveEntry.cd;
    // Simple BBT thermal shift: find the lowest temp, then the first day with a rise >=0.2°C
    const bbtData = data.filter(d => d.entry.bbtTemp != null).map(d => ({ cd: d.cd, temp: d.entry.bbtTemp as number }));
    if (bbtData.length >= 4) {
      for (let i = 3; i < bbtData.length; i++) {
        const prev3avg = (bbtData[i - 1].temp + bbtData[i - 2].temp + bbtData[i - 3].temp) / 3;
        if (bbtData[i].temp - prev3avg >= 0.18) return bbtData[i].cd - 1; // ovulation day before rise
      }
    }
    return null;
  };

  /**
   * Returns the next (or current) fertile window.
   *
   * Strategy:
   *   - anchor = last period start (or LMP seed)
   *   - predicted period start of cycle N = anchor + N * avgCycleLength
   *   - fertile window = CD 10–16 of that cycle
   *   - iterate N = 0, 1, 2, ... until we find a window whose end >= today
   */
  const nextFertileWindow = (seedLmpKey?: string): FertileWindowPrediction | null => {
    const anchor = lastPeriodStartKey ?? seedLmpKey ?? null;
    if (!anchor) return null;

    for (let n = 0; n <= 3; n++) {
      const periodStart = addDays(anchor, n * avgCycleLength);
      const windowStart = addDays(periodStart, 9);  // CD 10
      const windowEnd   = addDays(periodStart, 15); // CD 16
      const peakKey     = addDays(periodStart, 13); // CD 14
      if (windowEnd >= todayKey) {
        const daysUntilStart = daysBetween(todayKey, windowStart);
        const isCurrentWindow = todayKey >= windowStart && todayKey <= windowEnd;
        return { startKey: windowStart, endKey: windowEnd, peakKey, periodStartKey: periodStart, daysUntilStart, isCurrentWindow };
      }
    }
    return null;
  };

  return (
    <CycleLogsContext.Provider value={{
      logs, getEntry, todayEntry, saveEntry,
      lastPeriodStartKey, allCycleStartKeys,
      cycleDay, isFertileToday, isPeakToday,
      daysUntilTestDay, getCurrentCycleData,
      completedCycles, avgCycleLength, confirmedOvulationCD,
      nextFertileWindow,
    }}>
      {children}
    </CycleLogsContext.Provider>
  );
};

export const useCycleLogs = () => useContext(CycleLogsContext);
