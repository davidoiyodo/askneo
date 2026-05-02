import { GoalId, SubGoalId, UserStage } from '../hooks/useAppContext';

// ─── Sub-goal definitions ─────────────────────────────────────────────────────

export interface SubGoalDef {
  id: SubGoalId;
  label: string;
  icon: string;
  description: string;
}

export const SUB_GOALS: SubGoalDef[] = [
  {
    id: 'brain-development',
    label: 'Brain & cognitive development',
    icon: '🧠',
    description: 'Nutrition and habits that support your baby\'s brain and nervous system',
  },
  {
    id: 'vision-development',
    label: 'Eye & vision development',
    icon: '👁️',
    description: 'Vitamins and lifestyle choices that support healthy eyesight',
  },
  {
    id: 'bone-development',
    label: 'Bone & skeletal development',
    icon: '🦴',
    description: 'Calcium, vitamin D, and movement for strong bones',
  },
  {
    id: 'immune-development',
    label: 'Immune system',
    icon: '🛡️',
    description: 'Probiotics, vitamins, and hygiene to build a resilient immune system',
  },
  {
    id: 'heart-development',
    label: 'Heart & cardiovascular health',
    icon: '❤️',
    description: 'Folate, iron, and blood pressure management for a healthy heart',
  },
];

// ─── Goal definitions ─────────────────────────────────────────────────────────

export interface GoalDef {
  id: GoalId;
  label: string;
  icon: string;
  description: string;        // shown on the goal card
  whyItMatters: string;       // shown on the goal detail screen
  stages: UserStage[];
  hasSubGoals?: boolean;      // true → show sub-goal picker after this is selected
  requiresBirthIntentionPrompt?: boolean;
  requiresFeedingIntentionPrompt?: boolean;
}

export const GOALS: GoalDef[] = [
  // ── Pregnancy ──────────────────────────────────────────────────────────────
  {
    id: 'safe-delivery',
    label: 'Safe delivery',
    icon: '🏥',
    description: 'Monitor the signs that matter, and know when to act',
    whyItMatters:
      'Recognising warning signs early and attending all antenatal visits dramatically reduces the risk of complications for both you and your baby.',
    stages: ['pregnancy'],
  },
  {
    id: 'natural-birth',
    label: 'Natural birth preparation',
    icon: '🌿',
    description: 'Build the strength, flexibility, and knowledge for a natural delivery',
    whyItMatters:
      'Consistent pelvic floor exercise, movement, and breathing practice from mid-pregnancy significantly improve the chances of a straightforward natural birth.',
    stages: ['pregnancy'],
    requiresBirthIntentionPrompt: true,
  },
  {
    id: 'baby-development',
    label: 'Healthy baby development',
    icon: '👶',
    description: 'Nutrition, movement, and daily habits that shape your baby\'s growth',
    whyItMatters:
      'What you eat, how you move, and how you manage stress all directly influence your baby\'s organ development, birth weight, and long-term health.',
    stages: ['pregnancy'],
    hasSubGoals: true,
  },
  {
    id: 'breastfeeding-readiness',
    label: 'Breastfeeding readiness',
    icon: '🤱',
    description: 'Prepare your body and your knowledge before your baby arrives',
    whyItMatters:
      'Mothers who prepare during pregnancy — understanding latch, colostrum, and early feeding cues — are significantly more likely to breastfeed successfully.',
    stages: ['pregnancy'],
    requiresFeedingIntentionPrompt: true,
  },
  {
    id: 'staying-active',
    label: 'Staying active',
    icon: '💪',
    description: 'Safe movement routines that support you and your baby',
    whyItMatters:
      'Regular, appropriate exercise during pregnancy reduces back pain, improves sleep, lowers risk of gestational diabetes, and shortens labour.',
    stages: ['pregnancy'],
  },

  // ── Newmom ─────────────────────────────────────────────────────────────────
  {
    id: 'feeding-success',
    label: 'Feeding my baby well',
    icon: '🍼',
    description: 'Whether breastfeeding or formula — confident, well-nourished feeds',
    whyItMatters:
      'Early feeding patterns set the foundation for your baby\'s gut health, immunity, and growth. Support and knowledge in the first weeks makes a lasting difference.',
    stages: ['newmom'],
    requiresFeedingIntentionPrompt: true,
  },
  {
    id: 'baby-growth',
    label: 'Tracking baby\'s growth',
    icon: '📈',
    description: 'Feeds, nappies, milestones, and the signs that all is well',
    whyItMatters:
      'Consistent tracking lets you catch problems early and gives your doctor the data they need at every check-up.',
    stages: ['newmom'],
  },
  {
    id: 'sleep-patterns',
    label: 'Healthy sleep patterns',
    icon: '😴',
    description: 'Safe sleep for baby, and rest strategies for you',
    whyItMatters:
      'Safe sleep practices prevent SIDS. Understanding wake windows and sleep cues helps babies settle — and helps you get more rest too.',
    stages: ['newmom'],
  },
  {
    id: 'mom-recovery',
    label: 'My own recovery',
    icon: '💚',
    description: 'Physical healing, emotional health, and rebuilding strength',
    whyItMatters:
      'Postpartum recovery is often underestimated. Pelvic floor rehab, nutrition, and early PPD awareness protect your long-term health.',
    stages: ['newmom'],
  },

  // ── TTC ────────────────────────────────────────────────────────────────────
  {
    id: 'cycle-awareness',
    label: 'Understanding my cycle',
    icon: '📅',
    description: 'Track fertile windows, BBT, and ovulation signs accurately',
    whyItMatters:
      'Most couples who conceive naturally do so by timing accurately. Knowing your cycle reduces guesswork and improves your chances significantly.',
    stages: ['ttc'],
  },
  {
    id: 'conception-optimisation',
    label: 'Optimising for conception',
    icon: '🧬',
    description: 'Nutrition, supplements, and lifestyle habits that improve fertility',
    whyItMatters:
      'Folic acid, healthy weight, and avoiding alcohol and smoking measurably improve egg quality and the chance of a healthy early pregnancy.',
    stages: ['ttc'],
  },
  {
    id: 'emotional-wellbeing',
    label: 'Emotional wellbeing',
    icon: '🧘',
    description: 'Managing the emotional weight of trying to conceive',
    whyItMatters:
      'Chronic stress affects hormone levels and can delay conception. Emotional support and self-care are not optional — they\'re part of the process.',
    stages: ['ttc'],
  },

  {
    id: 'ivf-preparation',
    label: 'IVF preparation',
    icon: '🔬',
    description: 'Understand the process, prepare your body, and know what to expect',
    whyItMatters:
      'IVF involves a precise sequence of medications, scans, and procedures. Being well-prepared — physically and emotionally — significantly improves outcomes and reduces the stress of each stage.',
    stages: ['ttc'],
  },

  // ── Partner ────────────────────────────────────────────────────────────────
  {
    id: 'supporting-partner',
    label: 'Supporting my partner',
    icon: '🤝',
    description: 'Stay informed and be the support system she needs',
    whyItMatters:
      'Partners who are engaged and informed reduce their partner\'s anxiety and experience significantly better birth and postpartum outcomes.',
    stages: ['partner'],
  },
  {
    id: 'birth-preparation',
    label: 'Birth preparation',
    icon: '🏥',
    description: 'Be ready to support through labour — practically and emotionally',
    whyItMatters:
      'Birth partners who prepare — knowing what to expect, how to help, and what the plan is — make labour shorter and less stressful for mothers.',
    stages: ['partner'],
  },
  {
    id: 'newborn-readiness',
    label: 'Newborn readiness',
    icon: '👶',
    description: 'The basics of newborn care so you can be hands-on from day one',
    whyItMatters:
      'Fathers and partners who engage in newborn care from the first days form stronger bonds and reduce postpartum depression in mothers.',
    stages: ['partner'],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getGoalsForStage(stage: UserStage): GoalDef[] {
  return GOALS.filter(g => g.stages.includes(stage));
}

export function getGoalById(id: GoalId): GoalDef | undefined {
  return GOALS.find(g => g.id === id);
}

export function getSubGoalById(id: SubGoalId): SubGoalDef | undefined {
  return SUB_GOALS.find(s => s.id === id);
}
