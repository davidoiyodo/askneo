import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useRoutine } from '../../hooks/useRoutine';
import { AppUser } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Maps a 0–1 completion ratio to a dot opacity (discrete tiers). */
function dotOpacity(ratio: number): number {
  if (ratio <= 0.25) return 0.22;
  if (ratio <= 0.50) return 0.45;
  if (ratio <= 0.75) return 0.68;
  return 1.0;
}

interface Props {
  user: AppUser;
  onPress: () => void;
}

export default function WeeklyStreakWidget({ user, onPress }: Props) {
  const { theme }   = useTheme();
  const { getOverallStreak, getWeekIntensity } = useRoutine();

  const streak    = getOverallStreak(user);
  const intensity = getWeekIntensity(user);  // [Mon … Sun], 0 = future or missed

  const dow        = new Date().getDay();      // 0=Sun … 6=Sat
  const todayIndex = dow === 0 ? 6 : dow - 1; // Mon=0 … Sun=6

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
        Shadow.sm,
      ]}
    >
      {/* Left: flame + streak number */}
      <View style={styles.streakLeft}>
        <Text style={styles.flame}>🔥</Text>
        <View>
          <Text style={[styles.streakNum, { color: theme.text.primary }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: theme.text.tertiary }]}>day streak</Text>
        </View>
      </View>

      {/* Right: week heat-map dots */}
      <View style={styles.weekCol}>
        <View style={styles.dotsRow}>
          {intensity.map((ratio, i) => {
            const isToday  = i === todayIndex;
            const isFuture = i > todayIndex;
            const hasDone  = ratio > 0;

            // Dot background colour
            const dotBg = isFuture
              ? theme.border.subtle       // not reached yet — lightest
              : hasDone
                ? theme.interactive.primary // active — brand colour at opacity tier
                : theme.border.default;    // past missed — neutral gray

            // Dot fill opacity
            const opacity = isFuture
              ? 0.4                         // dim future
              : hasDone
                ? dotOpacity(ratio)         // intensity tier
                : 1;                        // missed past: full neutral gray

            return (
              <View key={i} style={styles.dotCell}>
                {/* Today ring: thin brand-colour border underneath the dot */}
                {isToday && (
                  <View style={[
                    styles.dotRing,
                    { borderColor: theme.interactive.primary },
                  ]} />
                )}
                <View style={[
                  styles.dot,
                  { backgroundColor: dotBg, opacity },
                ]} />
                <Text style={[
                  styles.dayLabel,
                  { color: isToday ? theme.text.brand : theme.text.tertiary },
                ]}>
                  {DAY_LABELS[i]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius:  Radius['2xl'],
    borderWidth:   1,
    padding:       Spacing[5],
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[4],
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[3],
  },
  flame: {
    fontSize:   36,
    lineHeight: 44,
  },
  streakNum: {
    fontFamily:    Typography.fontFamily.display,
    fontSize:      Typography.size['3xl'],
    lineHeight:    Typography.size['3xl'] * 1.1,
    letterSpacing: -1,
  },
  streakLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize:   Typography.size.xs,
  },
  weekCol: {
    flex:       1,
    alignItems: 'flex-end',
    gap:        Spacing[1],
  },
  dotsRow: {
    flexDirection: 'row',
    gap:           Spacing[1],
  },
  dotCell: {
    alignItems:  'center',
    gap:         2,
    position:    'relative',
  },
  // Outer ring for today — sits behind the dot via absolute position
  dotRing: {
    position:     'absolute',
    top:          -2,
    left:         -2,
    width:        24,
    height:       24,
    borderRadius: Radius.full,
    borderWidth:  1.5,
  },
  dot: {
    width:        20,
    height:       20,
    borderRadius: Radius.full,
  },
  dayLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   9,
  },
});
