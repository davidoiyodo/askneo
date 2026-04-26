import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import {
  ChevronLeft, Thermometer, Droplets, History, ClipboardList,
  ChevronRight, CalendarDays,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import { useAppContext } from '../../hooks/useAppContext';
import {
  useCycleLogs, CycleEntry, CMType, OPKResult, FlowIntensity, HPTResult,
  toDateKey, daysBetween, FertileWindowPrediction,
} from '../../hooks/useCycleLogs';
import { useRoutine } from '../../hooks/useRoutine';
import Button from '../../components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { navigation: NativeStackNavigationProp<any> };

// ─── Constants ────────────────────────────────────────────────────────────────

const FLOW_OPTIONS: Array<{ value: FlowIntensity; label: string; emoji: string }> = [
  { value: 'spotting', label: 'Spotting', emoji: '💧' },
  { value: 'light',    label: 'Light',    emoji: '🩸' },
  { value: 'medium',   label: 'Medium',   emoji: '🔴' },
  { value: 'heavy',    label: 'Heavy',    emoji: '❗' },
];

const CM_OPTIONS: Array<{ value: CMType; label: string; emoji: string }> = [
  { value: 'dry',       label: 'Dry',       emoji: '🏜️' },
  { value: 'sticky',    label: 'Sticky',    emoji: '🔴' },
  { value: 'creamy',    label: 'Creamy',    emoji: '🟡' },
  { value: 'watery',    label: 'Watery',    emoji: '💧' },
  { value: 'egg-white', label: 'Egg-white', emoji: '✨' },
];

const OPK_OPTIONS: Array<{ value: OPKResult; label: string; emoji: string; color: string }> = [
  { value: 'negative', label: 'Negative', emoji: '⬜', color: '#5DBB8A' },
  { value: 'positive', label: 'Positive', emoji: '🟡', color: '#F4B740' },
  { value: 'peak',     label: 'Peak',     emoji: '🔥', color: '#C4566A' },
];

const MOOD_OPTIONS: Array<{ value: string; label: string; emoji: string }> = [
  { value: 'happy',     label: 'Happy',     emoji: '😊' },
  { value: 'hopeful',   label: 'Hopeful',   emoji: '🤞' },
  { value: 'calm',      label: 'Calm',      emoji: '😌' },
  { value: 'tired',     label: 'Tired',     emoji: '😴' },
  { value: 'anxious',   label: 'Anxious',   emoji: '😰' },
  { value: 'emotional', label: 'Emotional', emoji: '🥹' },
  { value: 'irritable', label: 'Irritable', emoji: '😤' },
  { value: 'sad',       label: 'Sad',       emoji: '😢' },
];

const SYMPTOM_OPTIONS: Array<{ value: string; label: string; emoji: string }> = [
  { value: 'all-good',      label: 'All good',      emoji: '✨' },
  { value: 'cramps',        label: 'Cramps',        emoji: '😣' },
  { value: 'breast-tender', label: 'Breast tender', emoji: '💗' },
  { value: 'bloating',      label: 'Bloating',      emoji: '🫃' },
  { value: 'spotting',      label: 'Spotting',      emoji: '🩸' },
  { value: 'nausea',        label: 'Nausea',        emoji: '🤢' },
  { value: 'headache',      label: 'Headache',      emoji: '🤕' },
  { value: 'fatigue',       label: 'Fatigue',       emoji: '😫' },
  { value: 'back-pain',     label: 'Back pain',     emoji: '💊' },
  { value: 'acne',          label: 'Acne',          emoji: '😬' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDaysToKey(dateKey: string, n: number): string {
  const d = new Date(dateKey + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(dateKey: string): string {
  return new Date(dateKey + 'T12:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function phaseInfo(cd: number, avgLen: number): { label: string; emoji: string; hint: string } {
  if (cd >= 1 && cd <= 5)   return { label: 'Period phase',        emoji: '🩸', hint: 'Menstruation — rest and recover.' };
  if (cd >= 6 && cd <= 9)   return { label: 'Follicular phase',    emoji: '🌸', hint: 'Follicles developing — energy is rising.' };
  if (cd >= 13 && cd <= 15) return { label: 'Peak fertile window', emoji: '🌟', hint: 'Best days to conceive — prioritise intimacy.' };
  if (cd >= 10 && cd <= 16) return { label: 'Fertile window',      emoji: '🌱', hint: 'Fertile days — higher conception probability.' };
  if (cd > avgLen)          return { label: 'Late cycle',          emoji: '⏳', hint: 'Next period may arrive soon.' };
  return                           { label: 'Luteal phase (TWW)',  emoji: '🌙', hint: 'Post-ovulation — the two-week wait begins.' };
}

// ─── CycleRing ────────────────────────────────────────────────────────────────

function CycleRing({ cd, avgLen }: { cd: number; avgLen: number }) {
  const SIZE = 96;
  const SW = 7;
  const r = (SIZE - SW) / 2;
  const cx = SIZE / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(cd / avgLen, 1);
  const dash = circumference * progress;
  const gap = circumference - dash;
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <SvgCircle cx={cx} cy={cx} r={r} stroke="rgba(255,255,255,0.2)" strokeWidth={SW} fill="none" />
        {progress > 0 && (
          <SvgCircle
            cx={cx} cy={cx} r={r}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={SW}
            fill="none"
            strokeDasharray={[dash, gap]}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <Text style={{ color: '#fff', fontFamily: Typography.fontFamily.bodyBold, fontSize: 24, letterSpacing: -0.5, lineHeight: 28 }}>
        {cd}
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.65)', fontFamily: Typography.fontFamily.body, fontSize: 10, lineHeight: 14 }}>
        /{avgLen}
      </Text>
    </View>
  );
}

// ─── WeekStrip ────────────────────────────────────────────────────────────────

function WeekStrip({
  todayKey,
  logs,
  anchor,
  avgCycleLength,
  fertileWindow,
}: {
  todayKey: string;
  logs: Record<string, CycleEntry>;
  anchor: string | null;
  avgCycleLength: number;
  fertileWindow: FertileWindowPrediction | null;
}) {
  const { theme } = useTheme();

  const days: string[] = [];
  for (let i = -3; i <= 3; i++) {
    days.push(addDaysToKey(todayKey, i));
  }

  function getDayStyle(dk: string): { bg: string; border: string; dashed: boolean; textColor: string } {
    const entry = logs[dk];
    const isToday = dk === todayKey;
    const isFuture = dk > todayKey;

    if (entry?.isPeriodFlow) {
      return { bg: '#C4566A', border: '#C4566A', dashed: false, textColor: '#fff' };
    }

    if (!isFuture && anchor && entry) {
      const cd = Math.max(1, daysBetween(anchor, dk) + 1);
      if (cd >= 13 && cd <= 15) return { bg: '#F4B740', border: '#F4B740', dashed: false, textColor: '#fff' };
      if (cd >= 10 && cd <= 16) return { bg: '#5DBB8A', border: '#5DBB8A', dashed: false, textColor: '#fff' };
    }

    if (isFuture && fertileWindow) {
      if (dk >= fertileWindow.startKey && dk <= fertileWindow.endKey) {
        const isPeak = dk === fertileWindow.peakKey;
        return { bg: 'transparent', border: isPeak ? '#F4B740' : '#5DBB8A', dashed: false, textColor: isPeak ? '#F4B740' : '#5DBB8A' };
      }
    }

    if (isFuture && anchor) {
      const pred = addDaysToKey(anchor, avgCycleLength);
      if (dk === pred) return { bg: 'transparent', border: '#C4566A', dashed: true, textColor: '#C4566A' };
    }

    return {
      bg: 'transparent',
      border: isToday ? theme.interactive.primary : theme.border.subtle,
      dashed: false,
      textColor: isToday ? theme.interactive.primary : theme.text.tertiary,
    };
  }

  return (
    <View style={styles.weekStrip}>
      {days.map(dk => {
        const isToday = dk === todayKey;
        const entry = logs[dk];
        const hasHeart = entry?.hadSex === true;
        const { bg, border, dashed, textColor } = getDayStyle(dk);
        const dayLabel = isToday ? 'Today' : new Date(dk + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
        const dayNum = new Date(dk + 'T12:00:00').getDate();

        return (
          <View key={dk} style={styles.weekDay}>
            <Text style={[styles.weekDayName, { color: isToday ? theme.interactive.primary : theme.text.tertiary }]}>
              {dayLabel}
            </Text>
            <View style={[
              styles.weekDayCircle,
              {
                backgroundColor: bg,
                borderColor: border,
                borderStyle: dashed ? 'dashed' : 'solid',
                borderWidth: isToday ? 2 : 1.5,
              },
            ]}>
              <Text style={[
                styles.weekDayNum,
                { color: textColor, fontFamily: isToday ? Typography.fontFamily.bodyBold : Typography.fontFamily.bodyMedium },
              ]}>
                {dayNum}
              </Text>
            </View>
            {hasHeart ? (
              <View style={[styles.weekDayHeart, { backgroundColor: '#E8789A' }]}>
                <Text style={styles.weekDayHeartChar}>♥</Text>
              </View>
            ) : (
              <View style={styles.weekDayHeartPlaceholder} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── IconChip ─────────────────────────────────────────────────────────────────

function IconChip({
  emoji, label, active, onPress, color = '#9B5DE5', chipSize = 56,
}: {
  emoji: string; label: string; active: boolean; onPress: () => void;
  color?: string; chipSize?: number;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.iconChip}>
      <View style={[
        styles.iconChipCircle,
        {
          width: chipSize, height: chipSize, borderRadius: chipSize / 2,
          backgroundColor: active ? color + '22' : theme.bg.app,
          borderColor: active ? color : theme.border.default,
          borderWidth: 1.5,
        },
      ]}>
        <Text style={{ fontSize: chipSize * 0.38 }}>{emoji}</Text>
      </View>
      <Text style={[styles.iconChipLabel, { color: active ? color : theme.text.secondary }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CycleTrackerScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const {
    logs, todayEntry, saveEntry, cycleDay,
    avgCycleLength, confirmedOvulationCD,
    daysUntilTestDay, lastPeriodStartKey, allCycleStartKeys, nextFertileWindow,
  } = useCycleLogs();
  const { completeItem } = useRoutine();

  const lmpSeed = user?.stage === 'ttc' ? user?.dueDate : undefined;
  const todayKey = toDateKey();
  const cd = cycleDay(lmpSeed);
  const isTWW = cd >= 17 && cd <= avgCycleLength + 2;
  const isConceptionWindow = cd >= 8 && cd <= 16;
  const prediction = nextFertileWindow(lmpSeed);
  const showPrediction = prediction != null && !prediction.isCurrentWindow && !isConceptionWindow;
  const phase = phaseInfo(cd, avgCycleLength);
  const ovCD = confirmedOvulationCD(lmpSeed);
  const daysToTest = daysUntilTestDay(lmpSeed);
  const anchor = lastPeriodStartKey ?? lmpSeed ?? null;
  const firstName = user?.name?.split(' ')[0] ?? null;

  // TTC cycle count: period starts on/after ttcStartDate
  const ttcCycleCount: number | null = (() => {
    if (!user?.ttcStartDate) return null;
    const n = allCycleStartKeys.filter(k => k >= user.ttcStartDate!).length;
    return n > 0 ? n : null;
  })();

  // Form state
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity | null>(todayEntry?.flowIntensity ?? null);
  const [isPeriodStart, setIsPeriodStart] = useState(todayEntry?.isPeriodStart ?? false);
  const [bbtRaw, setBbtRaw] = useState(todayEntry?.bbtTemp != null ? String(todayEntry.bbtTemp) : '');
  const [cmType, setCmType] = useState<CMType | null>(todayEntry?.cmType ?? null);
  const [opkResult, setOpkResult] = useState<OPKResult | null>(todayEntry?.opkResult ?? null);
  const [notes, setNotes] = useState(todayEntry?.notes ?? '');
  const [hadSex, setHadSex] = useState<boolean | null>(todayEntry?.hadSex ?? null);
  const [usedProtection, setUsedProtection] = useState<boolean | null>(
    todayEntry?.hadSex != null ? (todayEntry.usedProtection ?? false) : null
  );
  const [mood, setMood] = useState<string | null>(todayEntry?.mood ?? null);
  const [symptoms, setSymptoms] = useState<string[]>(todayEntry?.symptoms ?? []);
  const [hptResult, setHptResult] = useState<HPTResult | null>(todayEntry?.hptResult ?? null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!todayEntry) return;
    setFlowIntensity(todayEntry.flowIntensity ?? null);
    setIsPeriodStart(todayEntry.isPeriodStart);
    setBbtRaw(todayEntry.bbtTemp != null ? String(todayEntry.bbtTemp) : '');
    setCmType(todayEntry.cmType);
    setOpkResult(todayEntry.opkResult);
    setNotes(todayEntry.notes);
    setHadSex(todayEntry.hadSex ?? null);
    setUsedProtection(todayEntry.hadSex != null ? (todayEntry.usedProtection ?? false) : null);
    setMood(todayEntry.mood ?? null);
    setSymptoms(todayEntry.symptoms ?? []);
    setHptResult(todayEntry.hptResult ?? null);
  }, []);

  const isPeriodFlow = flowIntensity != null;

  const handleFlowSelect = (val: FlowIntensity) => {
    if (flowIntensity === val) {
      setFlowIntensity(null);
      setIsPeriodStart(false);
    } else {
      setFlowIntensity(val);
    }
  };

  const handleMarkCycleStart = () => {
    Alert.alert(
      'Start new cycle?',
      'This will mark today as Day 1 of a new cycle. All future cycle day calculations will reset from today.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, start cycle', onPress: () => setIsPeriodStart(true) },
      ]
    );
  };

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => {
      if (s === 'all-good') return prev.includes('all-good') ? [] : ['all-good'];
      const next = prev.filter(x => x !== 'all-good');
      return next.includes(s) ? next.filter(x => x !== s) : [...next, s];
    });
  };

  const bbtValue = bbtRaw.trim() ? parseFloat(bbtRaw.trim()) : null;
  const bbtValid = bbtValue == null || (bbtValue >= 35.0 && bbtValue <= 38.5);

  const handleSave = async () => {
    if (!bbtValid) {
      Alert.alert('Invalid temperature', 'BBT should be between 35.0°C and 38.5°C.');
      return;
    }
    const entry: CycleEntry = {
      dateKey: todayKey,
      isPeriodStart,
      isPeriodFlow,
      flowIntensity: flowIntensity ?? undefined,
      bbtTemp: bbtValue,
      cmType,
      opkResult,
      notes: notes.trim(),
      hadSex: hadSex ?? undefined,
      usedProtection: hadSex ? (usedProtection ?? false) : undefined,
      mood: mood ?? undefined,
      symptoms: symptoms.length > 0 ? symptoms : undefined,
      hptResult: hptResult ?? undefined,
    };
    await saveEntry(entry);
    setSaved(true);
    completeItem('ttc-cycle-log');
    if (bbtValue != null) { completeItem('ttc-temp'); completeItem('bbt-tracking'); }
    if (cmType != null)   completeItem('cm-observation');
  };

  const hasAnyData = isPeriodFlow || bbtRaw.trim() !== '' || cmType != null || opkResult != null
    || hadSex != null || mood != null || symptoms.length > 0 || hptResult != null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
            <ChevronLeft size={22} color={theme.text.secondary} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Cycle Tracker</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CycleHistory')}
            activeOpacity={0.7}
            style={styles.historyBtn}
          >
            <CalendarDays size={20} color={theme.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Welcome card ── */}
          <View style={[styles.welcomeCard, { backgroundColor: theme.bg.brand }]}>
            <Text style={[styles.welcomeGreeting, { color: theme.text.inverse, opacity: 0.85 }]}>
              {greeting()}{firstName ? `, ${firstName}` : ''} ✨
            </Text>
            <View style={styles.welcomeRow}>
              <View style={{ flex: 1, gap: Spacing[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2], flexWrap: 'wrap' }}>
                  <Text style={[styles.welcomeCycleDay, { color: theme.text.inverse }]}>
                    Cycle Day {cd}
                  </Text>
                  {ttcCycleCount != null && (
                    <View style={[styles.ttcCycleBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                      <Text style={[styles.ttcCycleBadgeText, { color: theme.text.inverse }]}>
                        TTC Cycle {ttcCycleCount}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={[styles.welcomePhasePill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                  <Text style={[styles.welcomePhaseText, { color: theme.text.inverse }]}>
                    {phase.emoji}  {phase.label}
                  </Text>
                </View>
                <Text style={[styles.welcomeHint, { color: theme.text.inverse, opacity: 0.75 }]}>
                  {phase.hint}
                </Text>
              </View>
              <CycleRing cd={cd} avgLen={avgCycleLength} />
            </View>
            {!lastPeriodStartKey && !lmpSeed && (
              <Text style={[styles.welcomeSetupNote, { color: theme.text.inverse, opacity: 0.6 }]}>
                Log your first period day below to start tracking accurately.
              </Text>
            )}
            {user?.cyclesIrregular && (
              <View style={[styles.irregularNote, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                <Text style={[styles.irregularNoteText, { color: theme.text.inverse, opacity: 0.85 }]}>
                  ⚠️ Your cycles may be irregular — predictions are estimates. OPK testing and BBT charting give a more accurate picture.
                </Text>
              </View>
            )}
          </View>

          {/* ── Week strip ── */}
          <View style={[styles.stripCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.stripLabel, { color: theme.text.tertiary }]}>This week</Text>
            <WeekStrip
              todayKey={todayKey}
              logs={logs}
              anchor={anchor}
              avgCycleLength={avgCycleLength}
              fertileWindow={prediction}
            />
            <View style={styles.stripLegend}>
              <View style={styles.stripLegendItem}>
                <View style={[styles.stripLegendDot, { backgroundColor: '#C4566A' }]} />
                <Text style={[styles.stripLegendText, { color: theme.text.tertiary }]}>Period</Text>
              </View>
              <View style={styles.stripLegendItem}>
                <View style={[styles.stripLegendDot, { backgroundColor: '#5DBB8A' }]} />
                <Text style={[styles.stripLegendText, { color: theme.text.tertiary }]}>Fertile</Text>
              </View>
              <View style={styles.stripLegendItem}>
                <View style={[styles.stripLegendRing, { borderColor: '#5DBB8A' }]} />
                <Text style={[styles.stripLegendText, { color: theme.text.tertiary }]}>Predicted</Text>
              </View>
              <View style={styles.stripLegendItem}>
                <View style={[styles.stripLegendHeart, { backgroundColor: '#E8789A' }]}>
                  <Text style={{ fontSize: 7, color: '#fff' }}>♥</Text>
                </View>
                <Text style={[styles.stripLegendText, { color: theme.text.tertiary }]}>Intimacy</Text>
              </View>
            </View>
          </View>

          {/* ── Next fertile window prediction ── */}
          {showPrediction && prediction && (
            <View style={[styles.predictionCard, { backgroundColor: theme.accent.sage.bg, borderColor: theme.accent.sage.border }]}>
              <View style={styles.predictionHeader}>
                <CalendarDays size={18} color={theme.accent.sage.text} strokeWidth={2} />
                <Text style={[styles.predictionTitle, { color: theme.accent.sage.text }]}>
                  {prediction.daysUntilStart > 0
                    ? `Next fertile window in ${prediction.daysUntilStart} day${prediction.daysUntilStart !== 1 ? 's' : ''}`
                    : 'Your fertile window starts today'}
                </Text>
              </View>
              <Text style={[styles.predictionDateRange, { color: theme.accent.sage.text }]}>
                {fmtDate(prediction.startKey)} – {fmtDate(prediction.endKey)}
              </Text>
              <Text style={[styles.predictionPeak, { color: theme.accent.sage.text }]}>
                🌟 Peak fertility estimated: {fmtDate(prediction.peakKey)}
              </Text>
              {prediction.daysUntilStart > 3 && (
                <Text style={[styles.predictionHint, { color: theme.accent.sage.text }]}>
                  Based on a {avgCycleLength}-day cycle. Start OPK testing from {fmtDate(prediction.startKey)} to confirm ovulation.
                </Text>
              )}
            </View>
          )}

          {/* ── Conception timing guidance (CD 8–16) ── */}
          {isConceptionWindow && (
            <View style={[styles.guidanceCard, { backgroundColor: theme.accent.sage.bg, borderColor: theme.accent.sage.border }]}>
              <View style={styles.guidanceTitleRow}>
                <Text style={[styles.guidanceTitle, { color: theme.accent.sage.text }]}>
                  🌱 Conception timing
                </Text>
                {hadSex === true && !usedProtection && (
                  <View style={[styles.bdBadge, { backgroundColor: 'rgba(46,138,90,0.18)' }]}>
                    <Text style={[styles.bdBadgeText, { color: theme.accent.sage.text }]}>✓ BD today</Text>
                  </View>
                )}
              </View>
              {cd >= 13 && cd <= 15 ? (
                <>
                  <Text style={[styles.guidanceBody, { color: theme.accent.sage.text }]}>
                    You're at your estimated peak fertility. Today and the next 1–2 days have the highest chance of conception — prioritise intimacy now.
                  </Text>
                  <Text style={[styles.guidanceDetail, { color: theme.accent.sage.text }]}>
                    A positive OPK or egg-white cervical mucus today confirms peak fertility.
                  </Text>
                </>
              ) : cd >= 10 ? (
                <>
                  <Text style={[styles.guidanceBody, { color: theme.accent.sage.text }]}>
                    You're in your fertile window. Sperm can survive 3–5 days, so intimacy every 1–2 days from now through CD 16 maximises your chances.
                  </Text>
                  <Text style={[styles.guidanceDetail, { color: theme.accent.sage.text }]}>
                    Watch for egg-white CM and a positive OPK as signs of approaching ovulation.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.guidanceBody, { color: theme.accent.sage.text }]}>
                    Your fertile window is approaching (estimated CD 10–16). This is a good time to start tracking OPK and CM daily.
                  </Text>
                  <Text style={[styles.guidanceDetail, { color: theme.accent.sage.text }]}>
                    Begin OPK testing from CD 10. Take it at the same time each day (afternoon is best).
                  </Text>
                </>
              )}
            </View>
          )}

          {/* ── Two-week wait support ── */}
          {isTWW && (
            <View style={[styles.twwCard, { backgroundColor: theme.accent.sky.bg, borderColor: theme.accent.sky.border }]}>
              <Text style={[styles.twwTitle, { color: theme.accent.sky.text }]}>
                🌙 Two-week wait — Day {cd - 16} of ~14
              </Text>
              <Text style={[styles.twwBody, { color: theme.accent.sky.text }]}>
                {daysToTest > 0
                  ? `Earliest reliable test date is in approximately ${daysToTest} day${daysToTest !== 1 ? 's' : ''}.`
                  : 'You can take a pregnancy test now — use first morning urine for the most accurate result.'}
              </Text>
              <View style={[styles.twwDivider, { backgroundColor: theme.accent.sky.border }]} />
              <Text style={[styles.twwSectionLabel, { color: theme.accent.sky.text }]}>Common symptoms during the TWW</Text>
              {[
                { symptom: 'Light spotting or cramps (6–12 DPO)', meaning: 'May be implantation — a positive sign.' },
                { symptom: 'Breast tenderness', meaning: 'Progesterone effect — normal in both pregnant and non-pregnant cycles.' },
                { symptom: 'Fatigue and mood changes', meaning: 'Also caused by progesterone — present in most luteal phases.' },
                { symptom: 'Nausea', meaning: 'Unusual before a missed period — if present, worth noting.' },
              ].map(item => (
                <View key={item.symptom} style={styles.twwSymptomRow}>
                  <Text style={[styles.twwSymptom, { color: theme.accent.sky.text }]}>· {item.symptom}</Text>
                  <Text style={[styles.twwMeaning, { color: theme.accent.sky.text, opacity: 0.75 }]}>{item.meaning}</Text>
                </View>
              ))}
              <View style={[styles.twwDivider, { backgroundColor: theme.accent.sky.border }]} />
              <Text style={[styles.twwFootnote, { color: theme.accent.sky.text }]}>
                Most early pregnancy symptoms overlap with PMS. The only reliable way to know is a pregnancy test after your missed period.
              </Text>
            </View>
          )}

          {/* ── HPT logging (TWW / late cycle) ── */}
          {isTWW && (
            <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>Pregnancy test today? 🤞</Text>
              <Text style={[styles.sectionHint, { color: theme.text.secondary }]}>
                Use first morning urine for the most accurate result.
              </Text>
              <View style={styles.chipRowCenter}>
                {([
                  { value: 'negative' as HPTResult,       label: 'Negative',       emoji: '➖', color: '#5DBB8A' },
                  { value: 'faint-positive' as HPTResult, label: 'Faint line',     emoji: '〰️', color: '#F4B740' },
                  { value: 'positive' as HPTResult,       label: 'Positive!',      emoji: '➕', color: '#C4566A' },
                ]).map(opt => (
                  <IconChip
                    key={opt.value}
                    emoji={opt.emoji}
                    label={opt.label}
                    active={hptResult === opt.value}
                    onPress={() => setHptResult(hptResult === opt.value ? null : opt.value)}
                    color={opt.color}
                  />
                ))}
              </View>
              {hptResult === 'positive' && (
                <View style={[styles.intimacyInsight, { backgroundColor: theme.accent.rose.bg }]}>
                  <Text style={[styles.intimacyInsightText, { color: theme.accent.rose.text }]}>
                    🎉 Positive result! Confirm with a second test and book an appointment with your doctor.
                  </Text>
                </View>
              )}
              {hptResult === 'faint-positive' && (
                <View style={[styles.intimacyInsight, { backgroundColor: theme.accent.gold.bg }]}>
                  <Text style={[styles.intimacyInsightText, { color: theme.accent.gold.text }]}>
                    A faint line may indicate early pregnancy. Retest in 48 hours with first morning urine.
                  </Text>
                </View>
              )}
              {hptResult === 'negative' && daysToTest > 0 && (
                <View style={[styles.intimacyInsight, { backgroundColor: theme.bg.app }]}>
                  <Text style={[styles.intimacyInsightText, { color: theme.text.secondary }]}>
                    Testing early can give false negatives. Wait until after your missed period for the most reliable result.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Log divider ── */}
          <View style={styles.logDivider}>
            <View style={[styles.logDividerLine, { backgroundColor: theme.border.subtle }]} />
            <Text style={[styles.logDividerText, { color: theme.text.tertiary }]}>Today's log</Text>
            <View style={[styles.logDividerLine, { backgroundColor: theme.border.subtle }]} />
          </View>

          {/* ── Mood ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>How are you feeling? 💭</Text>
            <View style={styles.chipGrid}>
              {MOOD_OPTIONS.map(opt => (
                <IconChip
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  active={mood === opt.value}
                  onPress={() => setMood(mood === opt.value ? null : opt.value)}
                  color="#9B5DE5"
                />
              ))}
            </View>
          </View>

          {/* ── Flow ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>Any flow today? 🩸</Text>
            <View style={styles.chipRowFull}>
              {FLOW_OPTIONS.map(opt => (
                <IconChip
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  active={flowIntensity === opt.value}
                  onPress={() => handleFlowSelect(opt.value)}
                  color="#C4566A"
                />
              ))}
            </View>
            {isPeriodFlow && !isPeriodStart && (
              <TouchableOpacity
                style={[styles.startCycleBtn, { borderColor: theme.border.brand }]}
                onPress={handleMarkCycleStart}
                activeOpacity={0.7}
              >
                <Text style={[styles.startCycleBtnText, { color: theme.text.link }]}>
                  Mark as Day 1 (new cycle start)
                </Text>
              </TouchableOpacity>
            )}
            {isPeriodStart && (
              <View style={[styles.cd1Badge, { backgroundColor: theme.accent.rose.bg }]}>
                <Text style={[styles.cd1BadgeText, { color: theme.accent.rose.text }]}>✓ Marked as Cycle Day 1</Text>
              </View>
            )}
          </View>

          {/* ── Symptoms ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>Any symptoms? 🔍</Text>
            <View style={styles.chipGrid}>
              {SYMPTOM_OPTIONS.map(opt => (
                <IconChip
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  active={symptoms.includes(opt.value)}
                  onPress={() => toggleSymptom(opt.value)}
                  color="#5B8ACA"
                />
              ))}
            </View>
          </View>

          {/* ── BBT ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <View style={styles.sectionTitleRow}>
              <Thermometer size={16} color={theme.text.secondary} strokeWidth={2} />
              <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>What was your temp this morning?</Text>
            </View>
            <Text style={[styles.sectionHint, { color: theme.text.secondary }]}>
              Taken immediately on waking, before getting up
            </Text>
            <View style={styles.bbtRow}>
              <TextInput
                style={[
                  styles.bbtInput,
                  {
                    backgroundColor: theme.bg.app,
                    borderColor: !bbtValid ? '#D64545' : bbtRaw.trim() ? theme.border.focus : theme.border.default,
                    color: theme.text.primary,
                  },
                ]}
                value={bbtRaw}
                onChangeText={setBbtRaw}
                placeholder="e.g. 36.4"
                placeholderTextColor={theme.text.tertiary}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
              <Text style={[styles.bbtUnit, { color: theme.text.secondary }]}>°C</Text>
            </View>
            {!bbtValid && (
              <Text style={[styles.errorText, { color: '#D64545' }]}>
                Temperature should be between 35.0°C and 38.5°C
              </Text>
            )}
            <Text style={[styles.sectionHint, { color: theme.text.tertiary }]}>
              A sustained rise of ≥0.2°C for 3 days confirms ovulation — see your chart in History.
            </Text>
          </View>

          {/* ── Cervical Mucus ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <View style={styles.sectionTitleRow}>
              <Droplets size={16} color={theme.text.secondary} strokeWidth={2} />
              <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>How's your cervical mucus?</Text>
            </View>
            <View style={styles.chipRowFull}>
              {CM_OPTIONS.map(opt => (
                <IconChip
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  active={cmType === opt.value}
                  onPress={() => setCmType(cmType === opt.value ? null : opt.value)}
                  color="#5DBB8A"
                />
              ))}
            </View>
          </View>

          {/* ── OPK ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>Did you test today? 🧪</Text>
            <Text style={[styles.sectionHint, { color: theme.text.secondary }]}>LH test strip result</Text>
            <View style={styles.chipRowCenter}>
              {OPK_OPTIONS.map(opt => (
                <IconChip
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  active={opkResult === opt.value}
                  onPress={() => setOpkResult(opkResult === opt.value ? null : opt.value)}
                  color={opt.color}
                />
              ))}
            </View>
          </View>

          {/* ── Intimacy ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>Intimacy today? 💗</Text>
            <View style={styles.chipRowCenter}>
              <IconChip
                emoji="🌿"
                label="Unprotected"
                active={hadSex === true && usedProtection === false}
                onPress={() => {
                  if (hadSex === true && usedProtection === false) { setHadSex(null); setUsedProtection(null); }
                  else { setHadSex(true); setUsedProtection(false); }
                }}
                color="#5DBB8A"
              />
              <IconChip
                emoji="🛡"
                label="Protected"
                active={hadSex === true && usedProtection === true}
                onPress={() => {
                  if (hadSex === true && usedProtection === true) { setHadSex(null); setUsedProtection(null); }
                  else { setHadSex(true); setUsedProtection(true); }
                }}
                color="#8B9E9E"
              />
              <IconChip
                emoji="—"
                label="None"
                active={hadSex === false}
                onPress={() => {
                  if (hadSex === false) { setHadSex(null); setUsedProtection(null); }
                  else { setHadSex(false); setUsedProtection(null); }
                }}
                color="#9B9B9B"
              />
            </View>
            {hadSex === true && !usedProtection && isConceptionWindow && (
              <View style={[styles.intimacyInsight, { backgroundColor: theme.accent.sage.bg }]}>
                <Text style={[styles.intimacyInsightText, { color: theme.accent.sage.text }]}>
                  🎯 Intercourse logged during your fertile window — great timing!
                </Text>
              </View>
            )}
            {hadSex === true && !usedProtection && opkResult === 'peak' && (
              <View style={[styles.intimacyInsight, { backgroundColor: theme.accent.gold.bg }]}>
                <Text style={[styles.intimacyInsightText, { color: theme.accent.gold.text }]}>
                  ⭐ OPK peak + intercourse today — optimal conception timing.
                </Text>
              </View>
            )}
          </View>

          {/* ── Notes ── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.sectionQuestion, { color: theme.text.primary }]}>Anything else to note? 📝</Text>
            <TextInput
              style={[
                styles.notesInput,
                { backgroundColor: theme.bg.app, borderColor: theme.border.default, color: theme.text.primary },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any other observations..."
              placeholderTextColor={theme.text.tertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Save */}
          <Button
            label={saved ? '✓ Saved' : "Save today's log"}
            onPress={handleSave}
            disabled={!hasAnyData || saved}
            fullWidth
          />
          {saved && (
            <Text style={[styles.savedNote, { color: theme.text.secondary }]}>
              Routine items have been marked as done for today.
            </Text>
          )}

          {/* ── Footer navigation links ── */}
          <View style={styles.footerLinks}>
            <TouchableOpacity
              style={[styles.footerLink, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
              onPress={() => navigation.navigate('CycleHistory')}
              activeOpacity={0.7}
            >
              <View style={styles.footerLinkLeft}>
                <History size={18} color={theme.text.link} strokeWidth={2} />
                <Text style={[styles.footerLinkText, { color: theme.text.primary }]}>Cycle History & Analytics</Text>
              </View>
              <ChevronRight size={16} color={theme.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerLink, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
              onPress={() => navigation.navigate('PreconceptionChecklist')}
              activeOpacity={0.7}
            >
              <View style={styles.footerLinkLeft}>
                <ClipboardList size={18} color={theme.text.link} strokeWidth={2} />
                <Text style={[styles.footerLinkText, { color: theme.text.primary }]}>Preconception Checklist</Text>
              </View>
              <ChevronRight size={16} color={theme.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  historyBtn: { padding: 8, marginRight: -8 },
  headerTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  // Welcome card
  welcomeCard: {
    borderRadius: Radius['2xl'],
    padding: Spacing[6],
    gap: Spacing[3],
  },
  welcomeGreeting: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.base,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  welcomeCycleDay: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['3xl'],
    letterSpacing: -0.5,
  },
  welcomePhasePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  welcomePhaseText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  welcomeHint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  welcomeSetupNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
    marginTop: Spacing[1],
  },
  ttcCycleBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  ttcCycleBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  irregularNote: {
    borderRadius: Radius.lg,
    padding: Spacing[3],
    marginTop: Spacing[1],
  },
  irregularNoteText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
  },
  // Week strip card
  stripCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  stripLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[1],
  },
  weekDayName: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 9,
    textAlign: 'center',
  },
  weekDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayNum: {
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
  weekDayHeart: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayHeartChar: {
    fontSize: 7,
    lineHeight: 10,
    color: '#fff',
    textAlign: 'center',
  },
  weekDayHeartPlaceholder: {
    width: 14,
    height: 14,
  },
  stripLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[4],
    paddingTop: Spacing[1],
  },
  stripLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stripLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stripLegendRing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  stripLegendHeart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripLegendText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
  },
  // Log divider
  logDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  logDividerLine: {
    flex: 1,
    height: 1,
  },
  logDividerText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Sections
  section: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  sectionQuestion: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  sectionHint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
    marginTop: -Spacing[2],
  },
  // Chip layouts
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    justifyContent: 'flex-start',
  },
  chipRowFull: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing[1],
  },
  chipRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[4],
  },
  // Icon chip
  iconChip: {
    alignItems: 'center',
    gap: Spacing[1],
    width: 68,
  },
  iconChipCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    textAlign: 'center',
  },
  // Prediction card
  predictionCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  predictionTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
    flex: 1,
  },
  predictionDateRange: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    letterSpacing: -0.2,
  },
  predictionPeak: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  predictionHint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
    opacity: 0.8,
  },
  // Guidance card
  guidanceCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  guidanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guidanceTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  bdBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
  },
  bdBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  guidanceBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.55,
  },
  guidanceDetail: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
    opacity: 0.8,
  },
  // TWW card
  twwCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  twwTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  twwBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.55,
  },
  twwDivider: { height: 1, opacity: 0.4 },
  twwSectionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  twwSymptomRow: { gap: 2 },
  twwSymptom: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  twwMeaning: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.55,
    paddingLeft: Spacing[3],
  },
  twwFootnote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
    opacity: 0.8,
  },
  // Period / flow
  startCycleBtn: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  startCycleBtnText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  cd1Badge: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    alignSelf: 'flex-start',
  },
  cd1BadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  // BBT input
  bbtRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  bbtInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.lg,
    minHeight: 52,
  },
  bbtUnit: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  errorText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: -Spacing[2],
  },
  // Intimacy insights
  intimacyInsight: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  intimacyInsightText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  // Notes
  notesInput: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 80,
  },
  savedNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.6,
  },
  // Footer links
  footerLinks: { gap: Spacing[3] },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
  },
  footerLinkLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  footerLinkText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
});
