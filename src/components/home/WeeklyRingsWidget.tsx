import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { useRoutine, WeekStats } from '../../hooks/useRoutine';
import { AppUser } from '../../hooks/useAppContext';
import { getGoalById } from '../../data/goals';
import { GOAL_ACCENT } from '../../utils/goalColors';
import { Typography, Spacing, Radius, Shadow } from '../../theme';

// ─── Ring geometry ─────────────────────────────────────────────────────────────

const RING_SIZE    = 92;
const STROKE_WIDTH = 7;
const RADIUS       = RING_SIZE / 2 - STROKE_WIDTH;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Celebrate when active on ≥70% of days elapsed so far this week
const celebrateThreshold = (daysInWeek: number) => Math.ceil(daysInWeek * 0.7);

// ─── Animated SVG circle ───────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Single ring ───────────────────────────────────────────────────────────────

interface RingProps {
  goalId:       string;
  stats:        WeekStats;
}

function GoalRing({ goalId, stats }: RingProps) {
  const { theme }  = useTheme();
  const goalDef    = getGoalById(goalId as any);
  const accentKey  = GOAL_ACCENT[goalId] ?? 'rose';
  const accent     = theme.accent[accentKey];

  const { activeDays, daysInWeek, proportionalProgress, streak, todayAllDone } = stats;
  const celebrated = activeDays >= celebrateThreshold(daysInWeek);

  // ── Animate ring fill on mount / progress change ────────────────────────────
  const offsetAnim = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetOffset = CIRCUMFERENCE * (1 - Math.min(proportionalProgress, 1));
    Animated.timing(offsetAnim, {
      toValue:         targetOffset,
      duration:        900,
      delay:           300,
      useNativeDriver: false, // SVG props must run on JS thread
    }).start(() => {
      if (celebrated) {
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 140, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 160, useNativeDriver: true }),
        ]).start();
      }
    });
  }, [proportionalProgress]);

  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  return (
    <View style={styles.ringWrap}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          {/* Track */}
          <Circle
            cx={cx} cy={cy} r={RADIUS}
            stroke={accent.bg}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress arc — starts at 12 o'clock */}
          <G rotation="-90" origin={`${cx}, ${cy}`}>
            <AnimatedCircle
              cx={cx} cy={cy} r={RADIUS}
              stroke={celebrated ? accent.text : accent.border}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offsetAnim}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Centre content */}
        <View style={[StyleSheet.absoluteFillObject, styles.ringCenter]}>
          {todayAllDone ? (
            // Today fully done — show a checkmark
            <Text style={[styles.ringCheck, { color: accent.text }]}>✓</Text>
          ) : (
            <>
              <Text style={styles.ringEmoji}>{goalDef?.icon ?? '✦'}</Text>
              <Text style={[
                styles.ringCount,
                { color: celebrated ? accent.text : accent.border },
              ]}>
                {activeDays}/{daysInWeek}
              </Text>
            </>
          )}
        </View>
      </Animated.View>

      {/* Goal label */}
      <Text
        style={[styles.ringLabel, { color: celebrated ? accent.text : theme.text.tertiary }]}
        numberOfLines={2}
      >
        {goalDef?.label ?? goalId}
      </Text>

      {/* Streak pill — shown when ≥2 consecutive days */}
      {streak >= 2 && (
        <View style={[styles.streakPill, { backgroundColor: accent.bg, borderColor: accent.border }]}>
          <Text style={[styles.streakText, { color: accent.text }]}>🔥 {streak} day streak</Text>
        </View>
      )}
    </View>
  );
}

// ─── Widget ────────────────────────────────────────────────────────────────────

interface Props {
  user: AppUser;
}

export default function WeeklyRingsWidget({ user }: Props) {
  const { theme }       = useTheme();
  const { getWeekStats } = useRoutine();
  const goals            = (user.goals ?? []).slice(0, 3);

  if (goals.length === 0) return null;

  const ringData = goals.map(goalId => ({
    goalId,
    stats: getWeekStats(user, goalId as any),
  }));

  const totalActive  = ringData.reduce((s, r) => s + r.stats.activeDays, 0);
  const daysInWeek   = ringData[0]?.stats.daysInWeek ?? 1;
  const maxActive    = goals.length * daysInWeek;

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
      Shadow.sm,
    ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>This week</Text>
        <Text style={[styles.subtitle, { color: theme.text.tertiary }]}>
          {totalActive} of {maxActive} days active
        </Text>
      </View>

      <View style={styles.rings}>
        {ringData.map(({ goalId, stats }) => (
          <GoalRing
            key={goalId}
            goalId={goalId}
            stats={stats}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius['2xl'],
    borderWidth:  1,
    padding:      Spacing[5],
    gap:          Spacing[4],
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.base,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize:   Typography.size.xs,
  },
  rings: {
    flexDirection:  'row',
    justifyContent: 'space-around',
  },
  ringWrap: {
    alignItems: 'center',
    gap:        Spacing[2],
    flex:       1,
  },
  ringCenter: {
    alignItems:     'center',
    justifyContent: 'center',
    gap:            2,
  },
  ringEmoji: {
    fontSize:   16,
    lineHeight: 20,
  },
  ringCount: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.xs,
  },
  ringCheck: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.xl,
    lineHeight: Typography.size.xl * 1.1,
  },
  ringLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   Typography.size.xs,
    textAlign:  'center',
    lineHeight: Typography.size.xs * 1.4,
    maxWidth:   88,
  },
  streakPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical:   2,
    borderRadius:      Radius.full,
    borderWidth:       1,
  },
  streakText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.xs,
  },
});
