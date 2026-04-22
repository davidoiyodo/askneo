import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UrineResult = 'negative' | 'trace' | 'positive';
export type BinaryResult = 'negative' | 'positive';
export type HIVStatus = 'non-reactive' | 'reactive';

export interface ANCVisit {
  id: string;
  date: string;                      // YYYY-MM-DD
  gestationalWeek: number | null;
  weight: number | null;             // kg
  bloodPressureSys: number | null;   // mmHg
  bloodPressureDia: number | null;   // mmHg
  fundalHeight: number | null;       // cm
  babyHeartRate: number | null;      // bpm
  urineProtein: UrineResult | null;
  urineGlucose: UrineResult | null;
  // Blood & lab
  pcv: number | null;                // Packed Cell Volume %
  malariaTest: BinaryResult | null;
  // Booking tests (typically first visit only)
  bloodGroup?: string | null;        // e.g. "O+", "A-"
  hivStatus?: HIVStatus | null;
  hbsAg?: BinaryResult | null;
  vdrl?: BinaryResult | null;
  genotype?: string | null;          // e.g. "AA", "AS"
  classTopics: string[];
  prescriptions: string;
  concernFlagged: boolean;
  referredToDoctor: boolean;
  nextAppointmentDate: string | null; // YYYY-MM-DD
  notes: string;
  addedAt: string;                   // ISO timestamp
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VISITS_KEY    = 'askneo_anc_visits';
const SETUP_KEY     = 'askneo_anc_setup_count';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useANCVisits() {
  const [visits, setVisits]       = useState<ANCVisit[]>([]);
  const [setupCount, setSetupCount] = useState<number | null | undefined>(undefined); // undefined = not yet loaded
  const [loaded, setLoaded]       = useState(false);

  const load = useCallback(() => {
    Promise.all([
      AsyncStorage.getItem(VISITS_KEY),
      AsyncStorage.getItem(SETUP_KEY),
    ]).then(([visitsVal, setupVal]) => {
      setVisits(visitsVal ? (() => { const p: ANCVisit[] = JSON.parse(visitsVal); p.sort((a, b) => b.date.localeCompare(a.date)); return p; })() : []);
      setSetupCount(setupVal !== null ? parseInt(setupVal, 10) : null);
      setLoaded(true);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const reload = load;

  const saveVisit = useCallback((visit: ANCVisit) => {
    setVisits(prev => {
      const idx = prev.findIndex(v => v.id === visit.id);
      const next = idx >= 0
        ? prev.map(v => v.id === visit.id ? visit : v)
        : [...prev, visit];
      next.sort((a, b) => b.date.localeCompare(a.date));
      AsyncStorage.setItem(VISITS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteVisit = useCallback((id: string) => {
    setVisits(prev => {
      const next = prev.filter(v => v.id !== id);
      AsyncStorage.setItem(VISITS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveSetupCount = useCallback((count: number) => {
    setSetupCount(count);
    AsyncStorage.setItem(SETUP_KEY, String(count));
  }, []);

  // Most recent visit's nextAppointmentDate (if set)
  const nextAppointment = visits.find(v => v.nextAppointmentDate)?.nextAppointmentDate ?? null;

  // Total visits including pre-app ones
  const totalVisitCount = (setupCount ?? 0) + visits.length;

  return {
    visits,
    setupCount,
    loaded,
    nextAppointment,
    totalVisitCount,
    saveVisit,
    deleteVisit,
    saveSetupCount,
    reload,
  };
}
