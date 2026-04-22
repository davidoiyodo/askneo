import { UserStage } from '../hooks/useAppContext';

export interface DailyReminder {
  id: string;
  label: string;
  note?: string;
  stages: UserStage[];
  minWeek?: number;        // pregnancy only — only show from this gestational week
  icon: string;
  resetAfterHours?: number; // auto-uncheck after this many hours and notify
  navigateTo?: string;     // if set, tapping navigates to this screen instead of just ticking
}

export const dailyReminders: DailyReminder[] = [
  // ── Daily check-in (all stages) ────────────────────────────────────────
  {
    id: 'daily-checkin',
    label: 'Write your wellness diary entry',
    note: 'Log your mood, energy, symptoms, hydration, and sleep',
    stages: ['pregnancy', 'newmom', 'ttc', 'partner'],
    icon: '📋',
    resetAfterHours: 24,
    navigateTo: 'SymptomLog',
  },

  // ── New mum ────────────────────────────────────────────────────────────
  {
    id: 'log-feed',
    label: 'Log a feeding session',
    note: 'Tap again to log the next one',
    stages: ['newmom'],
    icon: '🍼',
    resetAfterHours: 2,
  },
  {
    id: 'log-nappy',
    label: 'Log a nappy change',
    stages: ['newmom'],
    icon: '🚼',
    resetAfterHours: 3,
  },
  {
    id: 'newmom-water',
    label: 'Have a glass of water',
    note: 'Breastfeeding needs extra fluids — aim for a glass every couple of hours',
    stages: ['newmom'],
    icon: '💧',
    resetAfterHours: 2,
  },
  {
    id: 'log-baby-sleep',
    label: 'Log a baby sleep',
    stages: ['newmom'],
    icon: '😴',
    resetAfterHours: 4,
  },
  {
    id: 'newmom-rest',
    label: 'Take a rest when baby sleeps',
    note: 'Even 20 minutes matters',
    stages: ['newmom'],
    icon: '🛏️',
    resetAfterHours: 8,
  },

  // ── Pregnancy ──────────────────────────────────────────────────────────
  {
    id: 'pregnancy-water',
    label: 'Have a glass of water',
    note: 'Staying hydrated helps with energy and swelling',
    stages: ['pregnancy'],
    icon: '💧',
    resetAfterHours: 2,
  },
  {
    id: 'pregnancy-walk',
    label: 'Take a short walk today',
    note: 'Even 10 minutes outside can lift your mood',
    stages: ['pregnancy'],
    icon: '🚶‍♀️',
    resetAfterHours: 24,
  },
  {
    id: 'pregnancy-breathe',
    label: 'Take a breathing moment',
    note: 'Slow breath in for 4 counts, hold, out for 4',
    stages: ['pregnancy'],
    icon: '🧘‍♀️',
    resetAfterHours: 24,
  },
  {
    id: 'kick-count',
    label: 'Do your kick count',
    note: 'Count 10 movements — note the time it takes',
    stages: ['pregnancy'],
    minWeek: 28,
    icon: '👶',
    resetAfterHours: 24,
  },
  {
    id: 'pregnancy-rest',
    label: 'Put your feet up for 30 minutes',
    stages: ['pregnancy'],
    icon: '🛋️',
    resetAfterHours: 12,
  },

  // ── Trying to conceive ─────────────────────────────────────────────────
  {
    id: 'ttc-cycle-log',
    label: 'Log today in your cycle',
    note: 'Track symptoms, mood, and cervical mucus',
    stages: ['ttc'],
    icon: '📅',
    resetAfterHours: 24,
  },
  {
    id: 'ttc-temp',
    label: 'Log your morning temperature (BBT)',
    note: 'Take it first thing before getting up for the most accurate reading',
    stages: ['ttc'],
    icon: '🌡️',
    resetAfterHours: 24,
  },
  {
    id: 'ttc-water',
    label: 'Have a glass of water',
    stages: ['ttc'],
    icon: '💧',
    resetAfterHours: 2,
  },
  {
    id: 'ttc-rest',
    label: 'Take a moment for yourself',
    note: 'Stress affects cycles — a short break counts',
    stages: ['ttc'],
    icon: '🧘‍♀️',
    resetAfterHours: 24,
  },

  // ── Partner ────────────────────────────────────────────────────────────
  {
    id: 'partner-checkin',
    label: 'Check in on how she\'s really doing',
    note: '"How are you really feeling?" goes a long way',
    stages: ['partner'],
    icon: '🤝',
    resetAfterHours: 24,
  },
  {
    id: 'partner-feed-help',
    label: 'Offer to take a feed or nappy change',
    stages: ['partner'],
    icon: '🍼',
    resetAfterHours: 4,
  },
  {
    id: 'partner-water',
    label: 'Refill her water bottle',
    note: 'Breastfeeding and recovery both need extra fluids',
    stages: ['partner'],
    icon: '💧',
    resetAfterHours: 3,
  },
  {
    id: 'partner-sleep-shift',
    label: 'Take a night shift for her',
    note: 'Even one uninterrupted sleep makes a real difference',
    stages: ['partner'],
    icon: '😴',
    resetAfterHours: 12,
  },
  {
    id: 'partner-errand',
    label: 'Ask if she needs anything done',
    stages: ['partner'],
    icon: '🛒',
    resetAfterHours: 24,
  },
];
