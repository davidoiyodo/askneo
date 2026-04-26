import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutChangeEvent, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, TrendingUp, Repeat, Flame, Info, X } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useCycleLogs, toDateKey, daysBetween, CycleEntry, FlowIntensity, HPTResult } from '../../hooks/useCycleLogs';
import { Typography, Spacing, Radius } from '../../theme';
import BBTChart from '../../components/cycle/BBTChart';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { navigation: NativeStackNavigationProp<any> };

interface DayMarking {
  // Logged states (filled)
  isPeriodStart?: boolean;
  isPeriodFlow?: boolean;
  isFertileWindow?: boolean;
  // Predicted states (ring)
  isPredictedPeriod?: boolean;
  isPredictedFertile?: boolean;
  isPredictedPeak?: boolean;
  // Meta
  isToday?: boolean;
  dots?: Array<{ key: string; color: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateKey(dateKey: string): string {
  return new Date(dateKey + 'T12:00:00').toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function addDays(dateKey: string, n: number): string {
  const d = new Date(dateKey + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function getPhaseInfo(cd: number, avgLen: number): { label: string; emoji: string; hint: string } {
  if (cd >= 1 && cd <= 5)   return { label: 'Period phase',        emoji: '🩸', hint: 'Menstruation — rest and recover.' };
  if (cd >= 6 && cd <= 9)   return { label: 'Follicular phase',    emoji: '🌸', hint: 'Follicles developing — energy rising.' };
  if (cd >= 13 && cd <= 15) return { label: 'Peak fertile window', emoji: '🌟', hint: 'Best days to conceive — prioritise intimacy.' };
  if (cd >= 10 && cd <= 16) return { label: 'Fertile window',      emoji: '🌱', hint: 'Fertile days — higher conception probability.' };
  if (cd > avgLen)          return { label: 'Late cycle',          emoji: '⏳', hint: 'Next period may arrive soon.' };
  return                           { label: 'Luteal phase (TWW)',  emoji: '🌙', hint: 'Post-ovulation — the two-week wait.' };
}

const FLOW_LABELS: Record<FlowIntensity, string> = {
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};
const FLOW_EMOJIS: Record<FlowIntensity, string> = {
  spotting: '💧',
  light: '🩸',
  medium: '🔴',
  heavy: '❗',
};
const CM_LABELS: Record<string, string> = {
  dry: 'Dry / None 🏜️',
  sticky: 'Sticky 🔴',
  creamy: 'Creamy 🟡',
  watery: 'Watery 💧',
  'egg-white': 'Egg-white ✨',
};
const MOOD_LABELS: Record<string, string> = {
  happy: '😊 Happy', hopeful: '🤞 Hopeful', calm: '😌 Calm', tired: '😴 Tired',
  anxious: '😰 Anxious', emotional: '🥹 Emotional', irritable: '😤 Irritable', sad: '😢 Sad',
};
const SYMPTOM_LABELS: Record<string, string> = {
  'all-good': '✨ All good', cramps: '😣 Cramps', 'breast-tender': '💗 Breast tender',
  bloating: '🫃 Bloating', spotting: '🩸 Spotting', nausea: '🤢 Nausea',
  headache: '🤕 Headache', fatigue: '😫 Fatigue', 'back-pain': '💊 Back pain', acne: '😬 Acne',
};
const HPT_LABELS: Record<HPTResult, string> = {
  'negative': '➖ Negative',
  'faint-positive': '〰️ Faint line',
  'positive': '➕ Positive',
};
const HPT_COLORS: Record<HPTResult, string> = {
  'negative': '#5DBB8A',
  'faint-positive': '#B87000',
  'positive': '#C4566A',
};

// ─── Custom Day Component ─────────────────────────────────────────────────────

function CalendarDay({ date, state, marking: rawMarking, onPress }: { date?: any; state?: string; marking?: any; onPress?: (date: any) => void }) {
  const marking = rawMarking as DayMarking | undefined;
  const { theme } = useTheme();
  if (!date) return null;

  const m = marking ?? {};
  const isDisabled = state === 'disabled';
  const allDots = m.dots ?? [];
  const sexDot = allDots.find(d => d.key === 'sex');
  const dots = allDots.filter(d => d.key !== 'sex');

  // Resolve circle style
  let bgColor = 'transparent';
  let borderColor = 'transparent';
  let borderWidth = 0;
  let borderStyle: 'solid' | 'dashed' = 'solid';
  let textColor = isDisabled ? theme.text.disabled : theme.text.primary;
  let textWeight: 'normal' | '600' = 'normal';

  if (m.isPeriodStart) {
    bgColor = '#C4566A';
    textColor = '#fff';
    textWeight = '600';
  } else if (m.isPeriodFlow) {
    bgColor = 'rgba(196,86,106,0.28)';
    textColor = '#C4566A';
  } else if (m.isFertileWindow) {
    bgColor = 'rgba(90,187,138,0.28)';
    textColor = '#1A6644';
  } else if (m.isPredictedPeak) {
    borderWidth = 2;
    borderColor = '#2E8A5A';
    textColor = '#2E8A5A';
  } else if (m.isPredictedFertile) {
    borderWidth = 1.5;
    borderColor = 'rgba(90,187,138,0.8)';
    borderStyle = 'dashed';
    textColor = theme.text.secondary;
  } else if (m.isPredictedPeriod) {
    borderWidth = 1.5;
    borderColor = 'rgba(196,86,106,0.7)';
    borderStyle = 'dashed';
    textColor = theme.text.secondary;
  }

  if (m.isToday && !m.isPeriodStart) {
    textColor = theme.text.brand;
    textWeight = '600';
  }

  return (
    <TouchableOpacity
      style={dayStyles.cell}
      onPress={() => onPress?.(date)}
      activeOpacity={0.7}
    >
      <View style={dayStyles.circleWrapper}>
        <View style={[
          dayStyles.circle,
          {
            backgroundColor: bgColor,
            borderWidth,
            borderColor,
            borderStyle,
          },
        ]}>
          <Text style={[
            dayStyles.dayText,
            { color: textColor, fontWeight: textWeight },
          ]}>
            {date.day}
          </Text>
        </View>
        {sexDot && (
          <View style={[dayStyles.heartBadge, { backgroundColor: sexDot.color }]}>
            <Text style={dayStyles.heartChar}>♥</Text>
          </View>
        )}
      </View>
      <View style={dayStyles.dotsRow}>
        {dots.slice(0, 3).map((dot: { key: string; color: string }) => (
          <View key={dot.key} style={[dayStyles.dot, { backgroundColor: dot.color }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

const dayStyles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    paddingVertical: 3,
    width: 36,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBadge: {
    position: 'absolute',
    bottom: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartChar: {
    fontSize: 8,
    lineHeight: 10,
    color: '#fff',
  },
  dayText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 7,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

// ─── DayDetailModal ───────────────────────────────────────────────────────────

function DayDetailModal({
  dateKey,
  onClose,
  logs,
  allCycleStartKeys,
  avgCycleLength,
  lmpSeed,
  todayKey,
}: {
  dateKey: string;
  onClose: () => void;
  logs: Record<string, CycleEntry>;
  allCycleStartKeys: string[];
  avgCycleLength: number;
  lmpSeed?: string;
  todayKey: string;
}) {
  const { theme } = useTheme();
  const entry = logs[dateKey] ?? null;
  const isFuture = dateKey > todayKey;
  const isToday = dateKey === todayKey;

  // Find cycle anchor for this date
  const starts = allCycleStartKeys.filter(k => k <= dateKey);
  const anchor = starts.length > 0
    ? starts[starts.length - 1]
    : (lmpSeed && lmpSeed <= dateKey ? lmpSeed : null);
  const cd = anchor != null ? Math.max(1, daysBetween(anchor, dateKey) + 1) : null;
  const phase = cd != null ? getPhaseInfo(cd, avgCycleLength) : null;

  const formattedDate = new Date(dateKey + 'T12:00:00').toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const hasLog = entry != null && (
    entry.isPeriodFlow || entry.bbtTemp != null || entry.cmType != null ||
    entry.opkResult != null || entry.hadSex != null || entry.mood != null ||
    (entry.symptoms && entry.symptoms.length > 0) || entry.notes || entry.hptResult != null
  );

  // Insight text based on phase + logged data
  const insights: string[] = [];
  if (cd != null && phase != null) {
    if (cd >= 13 && cd <= 15) insights.push('Peak fertile day — highest chance of conception.');
    else if (cd >= 10 && cd <= 16) insights.push('Fertile window day — sperm can survive 3–5 days.');
    if (cd >= 17 && cd <= avgCycleLength + 2) {
      const dpo = cd - 16;
      insights.push(`Two-week wait — Day ${dpo} post-ovulation.`);
      if (dpo >= 6 && dpo <= 12) insights.push('This is the implantation window (6–12 DPO).');
    }
  }
  if (entry?.opkResult === 'peak') insights.push('OPK surge detected — ovulation likely within 12–36 hours.');
  if (entry?.isPeriodStart) insights.push('Cycle Day 1 — new cycle began here.');
  if (entry?.hadSex && !entry.usedProtection && cd != null && cd >= 10 && cd <= 16) {
    insights.push('Unprotected intercourse during the fertile window — great timing for conception!');
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={[modalStyles.sheet, { backgroundColor: theme.bg.surface }]} onPress={() => {}}>

          {/* Handle */}
          <View style={[modalStyles.handle, { backgroundColor: theme.border.default }]} />

          {/* Header */}
          <View style={modalStyles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[modalStyles.dateText, { color: theme.text.primary }]}>
                {isToday ? 'Today' : formattedDate}
              </Text>
              {!isToday && (
                <Text style={[modalStyles.dateSubText, { color: theme.text.tertiary }]}>
                  {formattedDate}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={modalStyles.closeBtn}>
              <X size={20} color={theme.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Cycle day + phase */}
          {cd != null && phase != null && (
            <View style={modalStyles.phaseRow}>
              <Text style={[modalStyles.cdText, { color: theme.text.primary }]}>
                Cycle Day {cd}
              </Text>
              <View style={[modalStyles.phasePill, { backgroundColor: theme.bg.app }]}>
                <Text style={[modalStyles.phasePillText, { color: theme.text.secondary }]}>
                  {phase.emoji} {phase.label}
                </Text>
              </View>
            </View>
          )}

          <View style={[modalStyles.divider, { backgroundColor: theme.border.subtle }]} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.body}>

            {/* Future date — no log possible */}
            {isFuture && !hasLog && (
              <View style={[modalStyles.emptyCard, { backgroundColor: theme.bg.app }]}>
                <Text style={[modalStyles.emptyText, { color: theme.text.secondary }]}>
                  {cd != null && cd >= 10 && cd <= 16
                    ? '🌱 Predicted fertile window day. No log yet.'
                    : '📅 No log for this day yet.'}
                </Text>
              </View>
            )}

            {/* No log for past day */}
            {!isFuture && !hasLog && (
              <View style={[modalStyles.emptyCard, { backgroundColor: theme.bg.app }]}>
                <Text style={[modalStyles.emptyText, { color: theme.text.secondary }]}>
                  Nothing was logged for this day.
                </Text>
              </View>
            )}

            {/* Logged data */}
            {hasLog && entry && (
              <View style={modalStyles.logSection}>
                <Text style={[modalStyles.logSectionTitle, { color: theme.text.tertiary }]}>LOGGED</Text>

                {entry.isPeriodFlow && (
                  <LogRow
                    label="Flow"
                    value={entry.flowIntensity
                      ? `${FLOW_EMOJIS[entry.flowIntensity]} ${FLOW_LABELS[entry.flowIntensity]}`
                      : '🩸 Period flow'}
                    theme={theme}
                  />
                )}
                {entry.bbtTemp != null && (
                  <LogRow label="BBT temperature" value={`🌡 ${entry.bbtTemp}°C`} theme={theme} />
                )}
                {entry.cmType && (
                  <LogRow label="Cervical mucus" value={CM_LABELS[entry.cmType] ?? entry.cmType} theme={theme} />
                )}
                {entry.opkResult && (
                  <LogRow
                    label="OPK result"
                    value={entry.opkResult === 'peak' ? '🔥 Peak / Surge' : entry.opkResult === 'positive' ? '🟡 Positive' : '⬜ Negative'}
                    valueColor={entry.opkResult === 'peak' ? '#C4566A' : entry.opkResult === 'positive' ? '#B87000' : undefined}
                    theme={theme}
                  />
                )}
                {entry.mood && (
                  <LogRow label="Mood" value={MOOD_LABELS[entry.mood] ?? entry.mood} theme={theme} />
                )}
                {entry.symptoms && entry.symptoms.length > 0 && (
                  <LogRow
                    label="Symptoms"
                    value={entry.symptoms.map(s => SYMPTOM_LABELS[s] ?? s).join('  ·  ')}
                    theme={theme}
                  />
                )}
                {entry.hadSex != null && (
                  <LogRow
                    label="Intimacy"
                    value={entry.hadSex === false
                      ? '— None'
                      : entry.usedProtection ? '🛡 Protected' : '🌿 Unprotected'}
                    theme={theme}
                  />
                )}
                {entry.hptResult && (
                  <LogRow
                    label="Pregnancy test"
                    value={HPT_LABELS[entry.hptResult]}
                    valueColor={HPT_COLORS[entry.hptResult]}
                    theme={theme}
                  />
                )}
                {entry.notes ? (
                  <LogRow label="Notes" value={`📝 ${entry.notes}`} theme={theme} />
                ) : null}
              </View>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <View style={[modalStyles.insightCard, { backgroundColor: theme.accent.sage.bg, borderColor: theme.accent.sage.border }]}>
                <Text style={[modalStyles.insightTitle, { color: theme.accent.sage.text }]}>💡 Insights</Text>
                {insights.map((ins, i) => (
                  <Text key={i} style={[modalStyles.insightText, { color: theme.accent.sage.text }]}>
                    · {ins}
                  </Text>
                ))}
              </View>
            )}

            {/* Phase context (always shown if known) */}
            {phase != null && (
              <View style={[modalStyles.phaseCard, { backgroundColor: theme.bg.app }]}>
                <Text style={[modalStyles.phaseCardText, { color: theme.text.secondary }]}>
                  {phase.hint}
                </Text>
              </View>
            )}

          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function LogRow({ label, value, valueColor, theme }: { label: string; value: string; valueColor?: string; theme: any }) {
  return (
    <View style={modalStyles.logRow}>
      <Text style={[modalStyles.logLabel, { color: theme.text.tertiary }]}>{label}</Text>
      <Text style={[modalStyles.logValue, { color: valueColor ?? theme.text.primary }]}>{value}</Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CycleHistoryScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const {
    logs, lastPeriodStartKey, allCycleStartKeys,
    completedCycles, avgCycleLength, cycleDay, confirmedOvulationCD, nextFertileWindow,
    getCurrentCycleData,
  } = useCycleLogs();

  const [chartWidth, setChartWidth] = useState(0);
  const handleChartLayout = (e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const lmpSeed = user?.stage === 'ttc' ? user?.dueDate : undefined;
  const todayKey = toDateKey();
  const cd = cycleDay(lmpSeed);
  const ovCD = confirmedOvulationCD(lmpSeed);
  const prediction = nextFertileWindow(lmpSeed);

  const cycleData = getCurrentCycleData(lmpSeed);
  const bbtPoints = cycleData
    .filter(d => d.entry.bbtTemp != null)
    .map(d => ({ cd: d.cd, temp: d.entry.bbtTemp as number }));

  // Build markedDates using custom flags consumed by CalendarDay
  const markedDates = useMemo(() => {
    const marks: Record<string, DayMarking> = {};

    const ensure = (key: string): DayMarking => {
      if (!marks[key]) marks[key] = { dots: [] };
      return marks[key];
    };

    // Logged entries
    for (const entry of Object.values(logs)) {
      const m = ensure(entry.dateKey);
      if (entry.isPeriodStart) m.isPeriodStart = true;
      else if (entry.isPeriodFlow) m.isPeriodFlow = true;

      if (entry.bbtTemp != null)
        m.dots!.push({ key: 'bbt', color: '#1A5A8A' });
      if (entry.cmType === 'egg-white' || entry.cmType === 'watery')
        m.dots!.push({ key: 'cm', color: '#2E8A5A' });
      if (entry.opkResult === 'peak')
        m.dots!.push({ key: 'opk', color: '#F4B740' });
      else if (entry.opkResult === 'positive')
        m.dots!.push({ key: 'opk+', color: '#B87000' });
      if (entry.hadSex)
        m.dots!.push({ key: 'sex', color: entry.usedProtection ? '#B0B0B0' : '#E8789A' });
      if (entry.mood)
        m.dots!.push({ key: 'mood', color: '#9B5DE5' });
      if (entry.symptoms && entry.symptoms.length > 0 && !entry.symptoms.includes('all-good'))
        m.dots!.push({ key: 'symptoms', color: '#5B8ACA' });
      if (entry.hptResult === 'positive')
        m.dots!.push({ key: 'hpt', color: '#C4566A' });
      else if (entry.hptResult === 'faint-positive')
        m.dots!.push({ key: 'hpt', color: '#F4B740' });
    }

    // Confirmed fertile window for current cycle (past & today only)
    const anchor = lastPeriodStartKey ?? lmpSeed ?? null;
    if (anchor) {
      for (let d = 10; d <= 16; d++) {
        const dk = addDays(anchor, d - 1);
        if (dk > todayKey) break;
        const m = ensure(dk);
        if (!m.isPeriodStart && !m.isPeriodFlow) m.isFertileWindow = true;
      }
    }

    // Predicted window — rings only
    if (prediction) {
      if (prediction.periodStartKey > todayKey) {
        const m = ensure(prediction.periodStartKey);
        if (!m.isPeriodStart) m.isPredictedPeriod = true;
      }
      let cur = prediction.startKey;
      while (cur <= prediction.endKey) {
        const m = ensure(cur);
        if (!m.isPeriodStart && !m.isPeriodFlow && !m.isFertileWindow) {
          if (cur === prediction.peakKey) m.isPredictedPeak = true;
          else m.isPredictedFertile = true;
        }
        cur = addDays(cur, 1);
      }
    }

    // Today
    ensure(todayKey).isToday = true;

    return marks;
  }, [logs, lastPeriodStartKey, lmpSeed, todayKey, prediction]);

  // Stats
  const cyclesTracked = allCycleStartKeys.length;
  const longestCycle = completedCycles.length
    ? Math.max(...completedCycles.map(c => c.length))
    : null;
  const shortestCycle = completedCycles.length
    ? Math.min(...completedCycles.map(c => c.length))
    : null;

  // Doctor-visit nudge for TTC users
  const doctorNudge: string | null = (() => {
    if (!user?.ttcStartDate) return null;
    const monthsTrying = daysBetween(user.ttcStartDate, todayKey) / 30.44;
    const age = user.dateOfBirth
      ? Math.floor(daysBetween(user.dateOfBirth, todayKey) / 365.25)
      : null;
    const threshold = age != null && age >= 35 ? 6 : 12;
    if (monthsTrying >= threshold) {
      return age != null && age >= 35
        ? `You've been trying for over 6 months. At 35+, guidelines recommend a fertility evaluation now — speak to your doctor.`
        : `You've been trying for over a year. It may be time to book a fertility evaluation with your doctor.`;
    }
    return null;
  })();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <ChevronLeft size={22} color={theme.text.secondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Cycle History</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Calendar */}
        <View style={[styles.calendarCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <Calendar
            dayComponent={CalendarDay}
            markedDates={markedDates}
            onDayPress={(date) => setSelectedDateKey(date.dateString)}
            theme={{
              calendarBackground: theme.bg.surface,
              textSectionTitleColor: theme.text.secondary,
              todayTextColor: theme.text.brand,
              dayTextColor: theme.text.primary,
              textDisabledColor: theme.text.disabled,
              arrowColor: theme.text.brand,
              monthTextColor: theme.text.primary,
              textDayFontFamily: Typography.fontFamily.body,
              textMonthFontFamily: Typography.fontFamily.bodySemibold,
              textDayHeaderFontFamily: Typography.fontFamily.bodyMedium,
              textDayFontSize: 13,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 11,
            }}
          />

          {/* Legend */}
          <View style={[styles.legendSection, { borderTopColor: theme.border.subtle }]}>
            <View style={styles.legendRow}>
              <LegendItem shape="fill" color="#C4566A" label="Period" />
              <LegendItem shape="fill" color="rgba(90,187,138,0.5)" label="Fertile (logged)" />
              <LegendItem shape="ring" color="rgba(196,86,106,0.7)" dashed label="Predicted period" />
              <LegendItem shape="ring" color="rgba(90,187,138,0.8)" dashed label="Predicted fertile" />
              <LegendItem shape="ring" color="#2E8A5A" label="Predicted peak" />
            </View>
            <View style={styles.legendRow}>
              <LegendItem shape="dot" color="#1A5A8A" label="BBT logged" />
              <LegendItem shape="dot" color="#F4B740" label="OPK peak" />
              <LegendItem shape="dot" color="#2E8A5A" label="Fertile CM" />
              <LegendItem shape="heart" color="#E8789A" label="Intimacy" />
              <LegendItem shape="dot" color="#9B5DE5" label="Mood" />
              <LegendItem shape="dot" color="#5B8ACA" label="Symptoms" />
              <LegendItem shape="dot" color="#C4566A" label="HPT positive" />
            </View>
          </View>
        </View>

        {/* BBT Chart */}
        {bbtPoints.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>📈 BBT Chart — Current Cycle</Text>
            <View onLayout={handleChartLayout}>
              {chartWidth > 0 && (
                <BBTChart
                  points={bbtPoints}
                  currentCD={cd}
                  avgCycleLength={avgCycleLength}
                  ovulationCD={ovCD}
                  width={chartWidth}
                  theme={theme}
                />
              )}
            </View>
            {ovCD != null && (
              <View style={[styles.ovulationBadge, { backgroundColor: theme.accent.gold.bg }]}>
                <Text style={[styles.ovulationBadgeText, { color: theme.accent.gold.text }]}>
                  ⭐ Ovulation confirmed on CD {ovCD}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Stats */}
        <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>📊 Cycle Statistics</Text>

          <View style={styles.statsGrid}>
            <StatCard
              icon={<Repeat size={18} color={theme.text.link} strokeWidth={2} />}
              label="Cycles tracked"
              value={cyclesTracked > 0 ? String(cyclesTracked) : '—'}
              theme={theme}
            />
            <StatCard
              icon={<TrendingUp size={18} color={theme.text.link} strokeWidth={2} />}
              label="Avg cycle length"
              value={completedCycles.length > 0 ? `${avgCycleLength} days` : '28 days (est.)'}
              theme={theme}
            />
            <StatCard
              icon={<Flame size={18} color={theme.text.link} strokeWidth={2} />}
              label="Current cycle day"
              value={`CD ${cd}`}
              theme={theme}
            />
            {ovCD != null && (
              <StatCard
                icon={<Info size={18} color={theme.text.link} strokeWidth={2} />}
                label="Ovulation confirmed"
                value={`CD ${ovCD}`}
                theme={theme}
              />
            )}
            {ovCD != null && (
              <StatCard
                icon={<Info size={18} color={ovCD != null && (avgCycleLength - ovCD) < 10 ? '#D64545' : theme.text.link} strokeWidth={2} />}
                label="Luteal phase"
                value={`${avgCycleLength - ovCD} days${(avgCycleLength - ovCD) < 10 ? ' ⚠️' : ''}`}
                theme={theme}
              />
            )}
            {longestCycle != null && (
              <StatCard
                icon={<TrendingUp size={18} color={theme.text.link} strokeWidth={2} />}
                label="Longest cycle"
                value={`${longestCycle} days`}
                theme={theme}
              />
            )}
            {shortestCycle != null && (
              <StatCard
                icon={<TrendingUp size={18} color={theme.text.link} strokeWidth={2} />}
                label="Shortest cycle"
                value={`${shortestCycle} days`}
                theme={theme}
              />
            )}
          </View>

          {completedCycles.length === 0 && (
            <View style={[styles.noDataNote, { backgroundColor: theme.bg.app }]}>
              <Text style={[styles.noDataText, { color: theme.text.secondary }]}>
                Log your next period start to begin tracking cycle length statistics.
              </Text>
            </View>
          )}
        </View>

        {/* Cycle log list */}
        {completedCycles.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>📅 Past Cycles</Text>
            {[...completedCycles].reverse().slice(0, 6).map((cycle, i) => (
              <View key={cycle.startKey} style={[styles.cycleRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.border.subtle }]}>
                <View>
                  <Text style={[styles.cycleDate, { color: theme.text.primary }]}>
                    Started {formatDateKey(cycle.startKey)}
                  </Text>
                  <Text style={[styles.cycleLength, { color: theme.text.secondary }]}>
                    {cycle.length} days long
                    {cycle.length < 21 ? '  · Shorter than typical' : cycle.length > 35 ? '  · Longer than typical' : ''}
                  </Text>
                </View>
                <View style={[
                  styles.cycleLengthBadge,
                  {
                    backgroundColor: cycle.length >= 21 && cycle.length <= 35
                      ? theme.accent.sage.bg
                      : theme.accent.peach.bg,
                  },
                ]}>
                  <Text style={[styles.cycleLengthBadgeText, {
                    color: cycle.length >= 21 && cycle.length <= 35
                      ? theme.accent.sage.text
                      : theme.accent.peach.text,
                  }]}>
                    {cycle.length}d
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Doctor visit nudge (TTC users past threshold) */}
        {doctorNudge && (
          <View style={[styles.section, { backgroundColor: theme.accent.peach.bg, borderColor: theme.accent.peach.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.accent.peach.text }]}>🩺 Time to see your doctor</Text>
            <Text style={[styles.eduText, { color: theme.accent.peach.text }]}>{doctorNudge}</Text>
          </View>
        )}

        {/* Educational note */}
        <View style={[styles.eduCard, { backgroundColor: theme.bg.subtle }]}>
          <Text style={[styles.eduText, { color: theme.text.secondary }]}>
            A typical menstrual cycle is 21–35 days. Cycles shorter than 21 days or longer than 35 days may affect fertility — speak to your doctor if this is consistent.
          </Text>
        </View>

      </ScrollView>

      {selectedDateKey && (
        <DayDetailModal
          dateKey={selectedDateKey}
          onClose={() => setSelectedDateKey(null)}
          logs={logs}
          allCycleStartKeys={allCycleStartKeys}
          avgCycleLength={avgCycleLength}
          lmpSeed={lmpSeed}
          todayKey={todayKey}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, theme }: {
  icon: React.ReactNode; label: string; value: string; theme: any;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.bg.app, borderColor: theme.border.subtle }]}>
      {icon}
      <Text style={[styles.statValue, { color: theme.text.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
}

function LegendItem({ shape, color, label, dashed }: {
  shape: 'fill' | 'ring' | 'dot' | 'heart';
  color: string;
  label: string;
  dashed?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.legendItem}>
      {shape === 'fill' && (
        <View style={[styles.legendCircle, { backgroundColor: color }]} />
      )}
      {shape === 'ring' && (
        <View style={[
          styles.legendCircle,
          {
            backgroundColor: 'transparent',
            borderWidth: dashed ? 1.5 : 2,
            borderColor: color,
            borderStyle: dashed ? 'dashed' : 'solid',
          },
        ]} />
      )}
      {shape === 'dot' && (
        <View style={[styles.legendDot, { backgroundColor: color }]} />
      )}
      {shape === 'heart' && (
        <View style={[styles.legendHeartBadge, { backgroundColor: color }]}>
          <Text style={styles.legendHeartChar}>♥</Text>
        </View>
      )}
      <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  calendarCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  legendSection: {
    padding: Spacing[4],
    borderTopWidth: 1,
    gap: Spacing[2],
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendHeartBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendHeartChar: {
    fontSize: 8,
    lineHeight: 10,
    color: '#fff',
  },
  legendLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  ovulationBadge: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    alignSelf: 'flex-start',
  },
  ovulationBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  section: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  statCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[3],
    gap: Spacing[1],
    minWidth: '44%',
    flex: 1,
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  noDataNote: {
    borderRadius: Radius.xl,
    padding: Spacing[3],
  },
  noDataText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
  },
  cycleDate: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  cycleLength: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  cycleLengthBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  cycleLengthBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  eduCard: {
    borderRadius: Radius.xl,
    padding: Spacing[4],
  },
  eduText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius['3xl'] ?? 28,
    borderTopRightRadius: Radius['3xl'] ?? 28,
    maxHeight: '80%',
    paddingBottom: Spacing[8],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
    gap: Spacing[3],
  },
  dateText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    letterSpacing: -0.3,
  },
  dateSubText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    marginTop: -2,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    gap: Spacing[3],
  },
  cdText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  phasePill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
  },
  phasePillText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[1],
  },
  body: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
    gap: Spacing[3],
  },
  emptyCard: {
    borderRadius: Radius.xl,
    padding: Spacing[4],
  },
  emptyText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    textAlign: 'center',
  },
  logSection: {
    gap: Spacing[1],
  },
  logSectionTitle: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
    marginBottom: Spacing[1],
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing[2],
    gap: Spacing[3],
  },
  logLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  logValue: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    flex: 2,
    textAlign: 'right',
    flexShrink: 1,
  },
  insightCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  insightTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  insightText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.55,
  },
  phaseCard: {
    borderRadius: Radius.xl,
    padding: Spacing[3],
  },
  phaseCardText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    textAlign: 'center',
  },
});
