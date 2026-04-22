import { Theme } from '../theme';

export type AccentKey = keyof Theme['accent'];

/** Maps each GoalId to one of the 5 theme accent colour slots. */
export const GOAL_ACCENT: Record<string, AccentKey> = {
  'baby-development':        'sky',
  'safe-delivery':           'rose',
  'natural-birth':           'sage',
  'breastfeeding-readiness': 'peach',
  'staying-active':          'gold',
  'feeding-success':         'peach',
  'baby-growth':             'sky',
  'sleep-patterns':          'sage',
  'mom-recovery':            'rose',
  'cycle-awareness':         'gold',
  'conception-optimisation': 'sky',
  'emotional-wellbeing':     'sage',
  'supporting-partner':      'peach',
  'birth-preparation':       'rose',
  'newborn-readiness':       'gold',
};
