import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext, GoalId } from '../../hooks/useAppContext';
import { useRoutine, WeekStats } from '../../hooks/useRoutine';
import { getGoalById } from '../../data/goals';
import { GOAL_ACCENT } from '../../utils/goalColors';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import Icon from '../../components/icons/Icon';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getWeekLabel(weekOffset: number): string {
  if (weekOffset === 0) return 'This week';
  if (weekOffset === -1) return 'Last week';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dsm = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const mon = new Date(today);
  mon.setDate(today.getDate() - dsm + weekOffset * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  if (mon.getMonth() === sun.getMonth()) {
    return `${mon.getDate()}–${sun.getDate()} ${MONTH_NAMES[mon.getMonth()]}`;
  }
  return `${mon.getDate()} ${MONTH_NAMES[mon.getMonth()]}–${sun.getDate()} ${MONTH_NAMES[sun.getMonth()]}`;
}

// ─── Intensity helpers ────────────────────────────────────────────────────────

/** Maps 0–1 ratio to discrete dot opacity (4 tiers). */
function dotOpacity(ratio: number): number {
  if (ratio <= 0.25) return 0.22;
  if (ratio <= 0.50) return 0.45;
  if (ratio <= 0.75) return 0.68;
  return 1.0;
}

// ─── Insight copy (data-driven templates) ────────────────────────────────────

function goalInsight(stats: WeekStats, daysInWeek: number): string {
  const { activeDays, proportionalProgress, streak, todayAllDone } = stats;
  if (todayAllDone && streak >= 3) return `All done today · ${streak} day streak 🔥`;
  if (todayAllDone)                return 'All done today ✓';
  if (streak >= 5)                 return `${streak} day streak — keep it going!`;
  if (streak >= 3)                 return `${streak} days in a row — don't stop now`;
  if (activeDays === daysInWeek && daysInWeek > 1) return 'Active every day this week';
  if (proportionalProgress >= 0.7) return `Strong effort — ${activeDays} of ${daysInWeek} days active`;
  if (activeDays === 0)            return 'Not started yet — try one item today';
  return `${activeDays} of ${daysInWeek} days active so far`;
}

function overallMotivation(streak: number, totalActive: number, maxActive: number): string {
  const ratio = maxActive > 0 ? totalActive / maxActive : 0;
  if (streak >= 14) return "Two weeks of consistency — you're building something real for your baby.";
  if (streak >= 7)  return "A full week of showing up. That's the habit that changes everything.";
  if (ratio >= 0.8) return "You're bringing real intention to this week. Your baby feels that.";
  if (ratio >= 0.5) return "Good momentum. Consistency is what matters most right now.";
  if (streak >= 3)  return `${streak} days in a row — you're building a real habit.`;
  if (totalActive > 0) return "Every active day counts. Let's build on this.";
  return "Your journey starts with one step. What can you do today?";
}

// ─── Dot component (reused in calendar and per-goal rows) ────────────────────

interface DotProps {
  ratio:      number;
  isToday:    boolean;
  isFuture:   boolean;
  activeBg:   string;  // colour when active (brand or accent.text)
  missedBg:   string;  // theme.border.default
  futureBg:   string;  // theme.border.subtle
  todayBorderColor: string;
  size:       number;
}

function IntensityDot({ ratio, isToday, isFuture, activeBg, missedBg, futureBg, todayBorderColor, size }: DotProps) {
  const hasDone = ratio > 0;
  const dotBg   = isFuture ? futureBg : hasDone ? activeBg : missedBg;
  const opacity = isFuture ? 0.4 : hasDone ? dotOpacity(ratio) : 1;

  return (
    <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      {/* Today ring */}
      {isToday && (
        <View style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius:  Radius.full,
            borderWidth:   1.5,
            borderColor:   todayBorderColor,
            margin:        -2,
          },
        ]} />
      )}
      {/* Fill dot */}
      <View style={{
        width:           size,
        height:          size,
        borderRadius:    Radius.full,
        backgroundColor: dotBg,
        opacity,
      }} />
      {/* Checkmark for fully active days (ratio = 1) — only on the large calendar */}
      {size >= 36 && hasDone && ratio >= 1 && (
        <Text style={[StyleSheet.absoluteFillObject as any, styles.calCheck]}>✓</Text>
      )}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
}

export default function StreakDetailScreen({ navigation }: Props) {
  const { theme }    = useTheme();
  const { user }     = useAppContext();
  const {
    completions,
    getOverallStreak,
    getWeekIntensity,
    getGoalWeekIntensity,
    getWeekStats,
  } = useRoutine();

  const [showHistory, setShowHistory] = useState(false);
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekPan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > 50)       setWeekOffset(p => Math.min(p + 1, 0));
      else if (gs.dx < -50) setWeekOffset(p => p - 1);
    },
  })).current;

  const monthPan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > 50)       setMonthOffset(p => Math.min(p + 1, 0));
      else if (gs.dx < -50) setMonthOffset(p => p - 1);
    },
  })).current;

  if (!user) { navigation.goBack(); return null; }

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayY = todayDate.getFullYear();
  const todayM = todayDate.getMonth();
  const todayD = todayDate.getDate();

  const goals     = user.goals ?? [];
  const streak    = getOverallStreak(user);
  const intensity = getWeekIntensity(user);

  const dow        = new Date().getDay();
  const todayIndex = dow === 0 ? 6 : dow - 1;
  const daysInWeek = todayIndex + 1;

  // ── Week view data for any offset ──────────────────────────────────────
  const weekDays: Array<{ ratio: number; isToday: boolean; isFuture: boolean }> =
    weekOffset === 0
      ? intensity.map((ratio, i) => ({ ratio, isToday: i === todayIndex, isFuture: i > todayIndex }))
      : (() => {
          const mon = new Date(todayDate);
          mon.setDate(todayDate.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
          return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(mon);
            d.setDate(mon.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            return { ratio: (completions[key] ?? []).length > 0 ? 1 : 0, isToday: false, isFuture: false };
          });
        })();

  // ── Month view data for any offset ─────────────────────────────────────
  const targetMonthDate = new Date(todayY, todayM + monthOffset, 1);
  const targetYear  = targetMonthDate.getFullYear();
  const targetMonth = targetMonthDate.getMonth();
  const monthLabel  = `${MONTH_NAMES[targetMonth]} ${targetYear}`;
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const mFirstDow = new Date(targetYear, targetMonth, 1).getDay();
  const mFirstMon = mFirstDow === 0 ? 6 : mFirstDow - 1;
  const monthCells: Array<{ day: number | null; dateKey: string | null }> = [];
  for (let i = 0; i < mFirstMon; i++) monthCells.push({ day: null, dateKey: null });
  for (let d = 1; d <= daysInTargetMonth; d++) {
    monthCells.push({
      day: d,
      dateKey: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }
  while (monthCells.length % 7 !== 0) monthCells.push({ day: null, dateKey: null });

  const goalStats  = goals.map(goalId => ({
    goalId,
    stats: getWeekStats(user, goalId as GoalId),
  }));
  const totalActive = goalStats.reduce((s, g) => s + g.stats.activeDays, 0);
  const maxActive   = goals.length * daysInWeek;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Your streak</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            onPress={() => setShowHistory(v => !v)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.closeBtn, { backgroundColor: showHistory ? theme.bg.subtle : 'transparent' }]}
          >
            <Icon name="calendar_2" size={18} color={showHistory ? theme.text.brand : theme.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.closeBtn, { backgroundColor: theme.bg.subtle }]}
          >
            <Icon name="close" size={18} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Streak hero ──────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Text style={styles.heroFlame}>🔥</Text>
          <Text style={[styles.heroNum, { color: theme.text.primary }]}>{streak}</Text>
          <Text style={[styles.heroLabel, { color: theme.text.secondary }]}>day streak</Text>
        </View>

        {/* ── Week / Month calendar (swipeable) ────────────────────────── */}
        {!showHistory ? (
          <View
            style={[styles.calendarCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }, Shadow.sm]}
            {...weekPan.panHandlers}
          >
            {/* Nav row */}
            <View style={styles.calNavRow}>
              <TouchableOpacity
                onPress={() => setWeekOffset(p => p - 1)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.5}
              >
                <Icon name="left" size={16} color={theme.text.secondary} />
              </TouchableOpacity>
              <Text style={[styles.calNavLabel, { color: theme.text.secondary }]}>
                {getWeekLabel(weekOffset)}
              </Text>
              <TouchableOpacity
                onPress={() => setWeekOffset(p => Math.min(p + 1, 0))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={weekOffset < 0 ? 0.5 : 1}
                disabled={weekOffset === 0}
              >
                <Icon name="right" size={16} color={weekOffset < 0 ? theme.text.secondary : theme.border.default} />
              </TouchableOpacity>
            </View>
            {/* Dots */}
            <View style={styles.calendarRow}>
              {weekDays.map(({ ratio, isToday, isFuture }, i) => (
                <View key={i} style={styles.calCell}>
                  <Text style={[
                    styles.calDayLabel,
                    { color: isToday ? theme.text.brand : theme.text.tertiary },
                  ]}>
                    {DAY_LABELS[i]}
                  </Text>
                  <IntensityDot
                    ratio={ratio}
                    isToday={isToday}
                    isFuture={isFuture}
                    activeBg={theme.interactive.primary}
                    missedBg={theme.border.default}
                    futureBg={theme.border.subtle}
                    todayBorderColor={theme.interactive.primary}
                    size={36}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View
            style={[styles.monthCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }, Shadow.sm]}
            {...monthPan.panHandlers}
          >
            {/* Nav row */}
            <View style={styles.calNavRow}>
              <TouchableOpacity
                onPress={() => setMonthOffset(p => p - 1)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.5}
              >
                <Icon name="left" size={16} color={theme.text.secondary} />
              </TouchableOpacity>
              <Text style={[styles.calNavLabel, { color: theme.text.secondary }]}>{monthLabel}</Text>
              <TouchableOpacity
                onPress={() => setMonthOffset(p => Math.min(p + 1, 0))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={monthOffset < 0 ? 0.5 : 1}
                disabled={monthOffset === 0}
              >
                <Icon name="right" size={16} color={monthOffset < 0 ? theme.text.secondary : theme.border.default} />
              </TouchableOpacity>
            </View>
            {/* Day-of-week labels + cells */}
            <View style={styles.histGrid}>
              {DAY_LABELS.map((lbl, i) => (
                <Text key={i} style={[styles.histDayLbl, { color: theme.text.tertiary }]}>{lbl}</Text>
              ))}
              {monthCells.map((cell, idx) => {
                if (!cell.day || !cell.dateKey) {
                  return <View key={idx} style={styles.histCell} />;
                }
                const isToday = targetYear === todayY && targetMonth === todayM && cell.day === todayD;
                const isFuture = targetYear > todayY || (targetYear === todayY && targetMonth > todayM) ||
                  (targetYear === todayY && targetMonth === todayM && cell.day > todayD);
                const isActive = !isFuture && (completions[cell.dateKey] ?? []).length > 0;
                return (
                  <View key={idx} style={styles.histCell}>
                    <View style={[
                      styles.histDayCircle,
                      isActive && { backgroundColor: theme.interactive.primary },
                      isToday && !isActive && { borderWidth: 1.5, borderColor: theme.interactive.primary },
                    ]}>
                      <Text style={[styles.histDayNum, {
                        color: isActive ? '#fff' : isToday ? theme.text.brand : isFuture ? theme.border.default : theme.text.secondary,
                      }]}>
                        {cell.day}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Motivational copy ────────────────────────────────────────────── */}
        <Text style={[styles.motivation, { color: theme.text.secondary }]}>
          {overallMotivation(streak, totalActive, maxActive)}
        </Text>

        {/* ── Per-goal breakdown ───────────────────────────────────────────── */}
        {goals.length > 0 && (
          <View style={styles.goalsSection}>
            <Text style={[styles.goalsSectionTitle, { color: theme.text.primary }]}>
              This week by goal
            </Text>
            {goals.map(goalId => {
              const goalDef  = getGoalById(goalId as any);
              if (!goalDef) return null;
              const accentKey  = GOAL_ACCENT[goalId] ?? 'rose';
              const accent     = theme.accent[accentKey];
              const stats      = getWeekStats(user, goalId as GoalId);
              const goalRatios = getGoalWeekIntensity(user, goalId as GoalId);
              const insight    = goalInsight(stats, daysInWeek);

              return (
                <View
                  key={goalId}
                  style={[styles.goalCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }, Shadow.sm]}
                >
                  <View style={[styles.accentBar, { backgroundColor: accent.border }]} />

                  {/* Goal header */}
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalIcon}>{goalDef.icon}</Text>
                    <Text style={[styles.goalLabel, { color: theme.text.primary }]} numberOfLines={1}>
                      {goalDef.label}
                    </Text>
                    <Text style={[styles.goalDayCount, { color: accent.text, backgroundColor: accent.bg }]}>
                      {stats.activeDays}/{daysInWeek}d
                    </Text>
                  </View>

                  {/* Per-day intensity dots */}
                  <View style={styles.goalDotsRow}>
                    {goalRatios.map((ratio, i) => (
                      <View key={i} style={styles.goalDotCell}>
                        <IntensityDot
                          ratio={ratio}
                          isToday={i === todayIndex}
                          isFuture={i > todayIndex}
                          activeBg={accent.text}
                          missedBg={theme.border.default}
                          futureBg={theme.border.subtle}
                          todayBorderColor={accent.text}
                          size={28}
                        />
                        <Text style={[styles.goalDotLabel, { color: i === todayIndex ? accent.text : theme.text.tertiary }]}>
                          {DAY_LABELS[i]}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Insight */}
                  <Text style={[styles.insightText, { color: theme.text.secondary }]}>
                    {insight}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical:   Spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.lg,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[2],
  },
  closeBtn: {
    width:          36,
    height:         36,
    borderRadius:   Radius.full,
    alignItems:     'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[6],
    paddingBottom:     Spacing[12],
    gap:               Spacing[5],
  },

  hero: {
    alignItems:      'center',
    gap:             Spacing[1],
    paddingVertical: Spacing[4],
  },
  heroFlame: {
    fontSize:   64,
    lineHeight: 72,
  },
  heroNum: {
    fontFamily:    Typography.fontFamily.display,
    fontSize:      72,
    lineHeight:    80,
    letterSpacing: -2,
  },
  heroLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   Typography.size.lg,
  },

  calendarCard: {
    borderRadius: Radius['2xl'],
    borderWidth:  1,
    padding:      Spacing[5],
    gap:          Spacing[3],
  },
  calNavRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  calNavLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   Typography.size.sm,
  },
  calendarRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  calCell: {
    alignItems: 'center',
    gap:        Spacing[1],
  },
  calDayLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   Typography.size.xs,
  },
  calCheck: {
    color:          '#fff',
    fontSize:       14,
    lineHeight:     18,
    textAlign:      'center',
    textAlignVertical: 'center',
  },

  motivation: {
    fontFamily:        Typography.fontFamily.body,
    fontSize:          Typography.size.base,
    lineHeight:        Typography.size.base * 1.6,
    textAlign:         'center',
    paddingHorizontal: Spacing[4],
  },

  goalsSection: { gap: Spacing[3] },
  goalsSectionTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.base,
  },
  goalCard: {
    borderRadius: Radius['2xl'],
    borderWidth:  1,
    padding:      Spacing[5],
    gap:          Spacing[3],
    overflow:     'hidden',
  },
  accentBar: {
    position: 'absolute',
    top:      0,
    left:     0,
    bottom:   0,
    width:    3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[2],
    paddingLeft:   Spacing[2],
  },
  goalIcon: {
    fontSize:   18,
    lineHeight: 22,
  },
  goalLabel: {
    flex:       1,
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.sm,
  },
  goalDayCount: {
    fontFamily:        Typography.fontFamily.bodySemibold,
    fontSize:          Typography.size.xs,
    paddingHorizontal: Spacing[2],
    paddingVertical:   2,
    borderRadius:      Radius.full,
  },
  goalDotsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingLeft:    Spacing[2],
  },
  goalDotCell: {
    alignItems: 'center',
    gap:        3,
  },
  goalDotLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   9,
  },
  insightText: {
    fontFamily:  Typography.fontFamily.body,
    fontSize:    Typography.size.sm,
    lineHeight:  Typography.size.sm * 1.55,
    paddingLeft: Spacing[2],
  },

  // ── Month calendar ────────────────────────────────────────────────────
  monthCard: {
    borderRadius: Radius['2xl'],
    borderWidth:  1,
    padding:      Spacing[5],
    gap:          Spacing[3],
  },
  histGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },
  histDayLbl: {
    width:      `${100 / 7}%` as any,
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   9,
    textAlign:  'center',
    paddingBottom: Spacing[1],
  },
  histCell: {
    width:      `${100 / 7}%` as any,
    alignItems: 'center',
    paddingVertical: 2,
  },
  histDayCircle: {
    width:          28,
    height:         28,
    borderRadius:   Radius.full,
    alignItems:     'center',
    justifyContent: 'center',
  },
  histDayNum: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   11,
  },
});
