import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog } from '../types/symptomLog';

const STORAGE_KEY = 'askneo_daily_logs';

export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// ─── Migration: array format → map format ────────────────────────────────────

function migrateIfNeeded(raw: any): Record<string, DailyLog> {
  if (!Array.isArray(raw)) return raw as Record<string, DailyLog>;

  const map: Record<string, DailyLog> = {};
  for (const log of raw) {
    const key = ((log.date ?? log.dateKey ?? new Date().toISOString()) as string).slice(0, 10);
    const existing = map[key];
    if (!existing) {
      map[key] = {
        ...log,
        dateKey: key,
        lastUpdated: log.date ?? new Date().toISOString(),
        babySymptoms: log.babySymptoms ?? [],
        babySymptomSeverity: log.babySymptomSeverity ?? null,
        babyFeedings: log.babyFeedings ?? null,
        babyNappies: log.babyNappies ?? null,
        babySleepHours: log.babySleepHours ?? null,
        babyMood: log.babyMood ?? null,
      };
    } else {
      // Multiple entries for same day — merge: counts add, scalars latest-wins, arrays union
      map[key] = {
        ...existing,
        lastUpdated: log.date ?? existing.lastUpdated,
        mood: log.mood ?? existing.mood,
        energy: log.energy ?? existing.energy,
        symptoms: Array.from(new Set([...existing.symptoms, ...(log.symptoms ?? [])])),
        symptomSeverity: log.symptomSeverity ?? existing.symptomSeverity,
        medications: log.medications?.length ? log.medications : existing.medications,
        sleepHours: log.sleepHours ?? existing.sleepHours,
        sleepQuality: log.sleepQuality ?? existing.sleepQuality,
        kickCount: log.kickCount ?? existing.kickCount,
        babyFeedings: sumNullable(existing.babyFeedings, log.babyFeedings),
        babyNappies: sumNullable(existing.babyNappies, log.babyNappies),
        babySleepHours: log.babySleepHours ?? existing.babySleepHours,
        babyMood: log.babyMood ?? existing.babyMood,
        babySymptoms: Array.from(new Set([...(existing.babySymptoms ?? []), ...(log.babySymptoms ?? [])])),
        babySymptomSeverity: log.babySymptomSeverity ?? existing.babySymptomSeverity,
        notes: [existing.notes, log.notes].filter(Boolean).join('\n\n'),
      };
    }
  }
  return map;
}

function sumNullable(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DailyLogsContextType {
  logs: Record<string, DailyLog>;
  todayLog: DailyLog | null;
  saveDayLog: (log: DailyLog) => Promise<void>;
  incrementField: (field: 'babyFeedings' | 'babyNappies', by?: number) => void;
  getLogForDate: (dateKey: string) => DailyLog | null;
}

const DailyLogsContext = createContext<DailyLogsContextType>({
  logs: {},
  todayLog: null,
  saveDayLog: async () => {},
  incrementField: () => {},
  getLogForDate: () => null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const DailyLogsProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (!val) return;
      try {
        const parsed = JSON.parse(val);
        const migrated = migrateIfNeeded(parsed);
        setLogs(migrated);
        // Persist migrated format back
        if (Array.isArray(parsed)) {
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      } catch {}
    });
  }, []);

  const todayKey = toDateKey();
  const todayLog = useMemo(() => logs[todayKey] ?? null, [logs, todayKey]);

  const saveDayLog = async (log: DailyLog) => {
    setLogs(prev => {
      const next = { ...prev, [log.dateKey]: log };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const incrementField = (field: 'babyFeedings' | 'babyNappies', by: number = 1) => {
    const key = toDateKey();
    setLogs(prev => {
      const today = prev[key];
      const updated: DailyLog = today
        ? { ...today, [field]: (today[field] ?? 0) + by, lastUpdated: new Date().toISOString() }
        : {
            dateKey: key,
            lastUpdated: new Date().toISOString(),
            stage: 'newmom',
            mood: null, energy: null,
            symptoms: [], symptomSeverity: null,
            medications: [],
            sleepHours: null, sleepQuality: null,
            kickCount: null,
            babyFeedings: field === 'babyFeedings' ? by : null,
            babyNappies: field === 'babyNappies' ? by : null,
            babySleepHours: null, babyMood: null,
            babySymptoms: [], babySymptomSeverity: null,
            notes: '',
          };
      const next = { ...prev, [key]: updated };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getLogForDate = (dateKey: string) => logs[dateKey] ?? null;

  return (
    <DailyLogsContext.Provider value={{ logs, todayLog, saveDayLog, incrementField, getLogForDate }}>
      {children}
    </DailyLogsContext.Provider>
  );
};

export const useDailyLogs = () => useContext(DailyLogsContext);
