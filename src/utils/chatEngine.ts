import { responses, fallbackResponse, NeoResponse, ChatTab } from '../data/responses';
import { DailyLog } from '../types/symptomLog';
import { AppUser, GoalId } from '../hooks/useAppContext';
import { getGoalById } from '../data/goals';
import { RoutineItem } from '../data/routineItems';
import { ANCVisit } from '../hooks/useANCVisits';

type HistoryEntry = { sender: 'user' | 'neo'; text: string };

const RECALL_PATTERNS = [
  'earlier', 'before', 'previously', 'what did you say', 'you mentioned',
  'you said', 'remember when', 'we discussed', 'we talked', 'go back to',
  'repeat that', 'what was that again', 'recap', 'summary of our',
];

export function getResponse(
  input: string,
  currentTab: ChatTab,
  history: HistoryEntry[] = [],
  userStage?: 'pregnancy' | 'newmom' | 'ttc' | 'partner',
): NeoResponse & { detectedTab?: ChatTab } {
  const lower = input.toLowerCase();

  // ── Recall / context queries ──────────────────────────────────────────
  if (RECALL_PATTERNS.some(k => lower.includes(k)) && history.length > 1) {
    const neoMessages = history.filter(m => m.sender === 'neo').slice(-3);
    if (neoMessages.length > 0) {
      const recap = neoMessages
        .map((m, i) => `${i + 1}. ${m.text.length > 160 ? m.text.slice(0, 160) + '…' : m.text}`)
        .join('\n\n');
      return {
        text: `Here's what I shared with you recently in this conversation:\n\n${recap}\n\nWould you like me to go deeper on any of these?`,
      };
    }
  }

  // ── Standard keyword matching ─────────────────────────────────────────
  for (const entry of responses) {
    const matched = entry.keywords.some(k => lower.includes(k));
    if (matched) {
      let detectedTab: ChatTab | undefined = entry.tab !== currentTab ? entry.tab : undefined;

      // Don't cross-route based on user stage:
      // Pregnant/TTC users shouldn't be pushed to baby tab
      if (detectedTab === 'baby' && (userStage === 'pregnancy' || userStage === 'ttc')) {
        detectedTab = undefined;
      }
      // Postpartum users shouldn't be pushed to pregnancy or ttc tab
      if ((detectedTab === 'pregnancy' || detectedTab === 'ttc') && userStage === 'newmom') {
        detectedTab = undefined;
      }

      return { ...entry.response, detectedTab };
    }
  }

  return { ...fallbackResponse };
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function calculateEDD(lmpDate: Date): Date {
  const edd = new Date(lmpDate);
  edd.setDate(edd.getDate() + 280);
  return edd;
}

export function getGestationalWeek(dueDate: Date): number {
  const today = new Date();
  const msLeft = dueDate.getTime() - today.getTime();
  const weeksLeft = msLeft / (7 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.round(40 - weeksLeft));
}

// ─── Visit context builder ────────────────────────────────────────────────────

const VISIT_KEYWORDS = [
  'hospital', 'doctor', 'appointment', 'visit', 'antenatal', 'clinic',
  'check-up', 'checkup', 'what to tell', 'what should i say', 'prepare',
  'bring to', 'what to bring', 'visit prep',
];

export function isVisitQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return VISIT_KEYWORDS.some(k => lower.includes(k));
}

export function buildVisitContext(logs: Record<string, DailyLog>, stage: string): string {
  const MOOD_LABELS: Record<number, string> = { 1: 'very low', 2: 'low', 3: 'neutral', 4: 'good', 5: 'great' };
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const recent = Object.values(logs)
    .filter(l => new Date(l.lastUpdated) >= cutoff)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  if (recent.length === 0) return '';

  const lines: string[] = [`Health data from the last ${recent.length} day(s):`];

  // Collect all unique symptoms across the period
  const allSymptoms = [...new Set(recent.flatMap(l => l.symptoms))];
  if (allSymptoms.length > 0) {
    lines.push(`Symptoms reported: ${allSymptoms.join(', ')}`);
  }

  // Severity counts
  const sevCounts = { mild: 0, moderate: 0, severe: 0 };
  for (const l of recent) {
    if (l.symptomSeverity) sevCounts[l.symptomSeverity]++;
  }
  const sevSummary = Object.entries(sevCounts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k} (${n}d)`)
    .join(', ');
  if (sevSummary) lines.push(`Severity: ${sevSummary}`);

  // Mood range
  const moods = recent.map(l => l.mood).filter(Boolean) as number[];
  if (moods.length > 0) {
    const avg = Math.round(moods.reduce((a, b) => a + b, 0) / moods.length);
    lines.push(`Average mood: ${MOOD_LABELS[avg] ?? avg}/5`);
  }

  // Sleep
  const sleepHours = recent.map(l => l.sleepHours).filter(v => v !== null) as number[];
  if (sleepHours.length > 0) {
    const avg = (sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length).toFixed(1);
    lines.push(`Average sleep: ${avg}h/night`);
  }

  // Newmom baby stats
  if (stage === 'newmom') {
    const allBabySymptoms = [...new Set(recent.flatMap(l => l.babySymptoms ?? []))];
    if (allBabySymptoms.length > 0) {
      lines.push(`Baby symptoms reported: ${allBabySymptoms.join(', ')}`);
    }
    const totalFeedings = recent.reduce((sum, l) => sum + (l.babyFeedings ?? 0), 0);
    const totalNappies = recent.reduce((sum, l) => sum + (l.babyNappies ?? 0), 0);
    if (totalFeedings > 0) lines.push(`Baby feedings (7d): ${totalFeedings}`);
    if (totalNappies > 0) lines.push(`Baby nappy changes (7d): ${totalNappies}`);
  }

  // Kick count (pregnancy)
  if (stage === 'pregnancy') {
    const lowKickDays = recent.filter(l => l.kickCount !== null && l.kickCount < 10);
    if (lowKickDays.length > 0) {
      lines.push(`Low kick count days: ${lowKickDays.length} (fewer than 10 kicks/hour)`);
    }
  }

  // Notes
  const notes = recent.map(l => l.notes).filter(Boolean);
  if (notes.length > 0) {
    lines.push(`Journal notes: ${notes.slice(-2).join(' | ')}`);
  }

  return lines.join('\n');
}

// ─── Routine context builder ──────────────────────────────────────────────────

const ROUTINE_KEYWORDS = [
  'routine', 'habit', 'goal', 'goals', 'daily', 'supplement', 'exercise',
  'kegel', 'vitamin', 'kick count', 'pelvic', 'omega', 'dha', 'iron',
  'what should i do', 'what can i do', 'should i be doing', 'am i on track',
];

export function isRoutineQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return ROUTINE_KEYWORDS.some(k => lower.includes(k));
}

export function buildRoutineContext(
  user: AppUser,
  todayItems: RoutineItem[],
  todayCompletions: string[],
): string {
  if (!user.goals || user.goals.length === 0 || todayItems.length === 0) return '';

  const goalLabels = user.goals
    .map(id => getGoalById(id)?.label)
    .filter(Boolean)
    .join(', ');

  const doneItems = todayItems.filter(i => todayCompletions.includes(i.id));
  const pendingItems = todayItems.filter(i => !todayCompletions.includes(i.id));

  const lines: string[] = [
    `User's active goals: ${goalLabels}.`,
    `Today's routine: ${doneItems.length} of ${todayItems.length} items complete.`,
  ];

  if (pendingItems.length > 0) {
    lines.push(`Still to do today: ${pendingItems.map(i => i.title).join(', ')}.`);
  }
  if (doneItems.length > 0) {
    lines.push(`Completed today: ${doneItems.map(i => i.title).join(', ')}.`);
  }

  return lines.join(' ');
}

// ─── ANC context builder ──────────────────────────────────────────────────────

const ANC_KEYWORDS = [
  'antenatal', 'anc', 'prenatal visit', 'clinic', 'midwife', 'matron',
  'fundal', 'blood pressure', 'bp', 'gestational week', 'heart rate',
  'kick count', 'urine', 'hospital visit', 'next appointment', 'next visit',
  'scan', 'check-up', 'pregnancy check',
];

export function isANCQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return ANC_KEYWORDS.some(k => lower.includes(k));
}

export function buildANCContext(visits: ANCVisit[], totalCount: number): string {
  if (visits.length === 0) return '';

  const lines: string[] = [`Total ANC visits: ${totalCount} (${visits.length} logged in app).`];

  const latest = visits[0]; // already sorted desc
  lines.push(`Most recent visit: ${latest.date}${latest.gestationalWeek ? ` (Week ${latest.gestationalWeek})` : ''}.`);

  if (latest.bloodPressureSys !== null && latest.bloodPressureDia !== null) {
    const bpHigh = latest.bloodPressureSys >= 140 || latest.bloodPressureDia >= 90;
    lines.push(`Last BP: ${latest.bloodPressureSys}/${latest.bloodPressureDia} mmHg${bpHigh ? ' (elevated — flagged)' : ''}.`);
  }
  if (latest.fundalHeight !== null) {
    lines.push(`Last fundal height: ${latest.fundalHeight} cm.`);
  }
  if (latest.babyHeartRate !== null) {
    lines.push(`Last baby heart rate: ${latest.babyHeartRate} bpm.`);
  }
  if (latest.concernFlagged) {
    lines.push(`Concern was flagged at last visit${latest.referredToDoctor ? ' — referred to doctor' : ''}.`);
  }
  if (latest.nextAppointmentDate) {
    lines.push(`Next appointment: ${latest.nextAppointmentDate}.`);
  }

  // BP trend across last 3 visits
  const bpVisits = visits.filter(v => v.bloodPressureSys !== null).slice(0, 3);
  if (bpVisits.length >= 2) {
    const trend = bpVisits.map(v => `${v.bloodPressureSys}/${v.bloodPressureDia}`).join(' → ');
    lines.push(`Recent BP trend: ${trend}.`);
  }

  return lines.join(' ');
}

export function getBabyAgeLabel(dob: Date): string {
  const today = new Date();
  const diffMs = today.getTime() - dob.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} old`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks} week${weeks !== 1 ? 's' : ''} old`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} old`;
}
