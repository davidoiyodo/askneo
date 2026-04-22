import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { GOAL_ACCENT } from '../../utils/goalColors';
import { Typography, Spacing } from '../../theme';

// ─── Ring geometry ─────────────────────────────────────────────────────────────

const SIZE        = 72;
const STROKE_W    = 4;
const GAP         = 3;  // gap between ring inner edge and image
const IMG_SIZE    = SIZE - 2 * (STROKE_W + GAP);   // 58 — image fills this circle
const IMG_OFFSET  = (SIZE - IMG_SIZE) / 2;           // 7 — centres image in container
const RADIUS      = SIZE / 2 - STROKE_W / 2;        // 34 — centre of stroke
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_GAP     = 7.5;  // compensates for round-cap overhang (STROKE_W/2 per end)

function segmentProps(i: number, n: number) {
  if (n === 1) {
    // Single item — full unbroken circle, no gap
    return { dashArray: `${CIRCUMFERENCE} 0`, dashOffset: 0 };
  }
  const totalGap   = n * ARC_GAP;
  const segLen     = (CIRCUMFERENCE - totalGap) / n;
  const dashArray  = `${segLen} ${CIRCUMFERENCE - segLen}`;
  const dashOffset = -(i * (segLen + ARC_GAP));
  return { dashArray, dashOffset };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  goalIcon:   string;   // kept for API compat, no longer rendered
  goalLabel:  string;
  goalId:     string;
  items:      { id: string }[];
  doneIds:    Set<string>;
  imageUri?:  string;
  onPress:    () => void;
}

export default function GoalStoryCircle({
  goalLabel, goalId, items, doneIds, imageUri, onPress,
}: Props) {
  const { theme } = useTheme();
  const accentKey = GOAL_ACCENT[goalId] ?? 'rose';
  const accent    = theme.accent[accentKey];

  const total     = items.length;
  const doneCount = items.filter(it => doneIds.has(it.id)).length;
  const allDone   = total > 0 && doneCount === total;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.wrap}>

      <View style={styles.svgWrap}>

        {/* ── Inner photo, clipped to circle, sits INSIDE the ring ────────── */}
        <View style={[styles.imgInner, { backgroundColor: accent.bg }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : null}

          {/* All-done green overlay + tick */}
          {allDone && (
            <View style={styles.doneMask}>
              <Text style={styles.doneCheck}>✓</Text>
            </View>
          )}
        </View>

        {/* ── Segmented ring drawn AROUND the image ────────────────────────── */}
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFillObject}>
          <G rotation="-90" origin={`${cx}, ${cy}`}>
            {total === 0 ? (
              <Circle
                cx={cx} cy={cy} r={RADIUS}
                stroke={accent.bg}
                strokeWidth={STROKE_W}
                fill="none"
              />
            ) : (
              items.map((item, i) => {
                const done = doneIds.has(item.id);
                const { dashArray, dashOffset } = segmentProps(i, total);
                return (
                  <Circle
                    key={item.id}
                    cx={cx} cy={cy} r={RADIUS}
                    stroke={done ? theme.border.subtle : accent.text}
                    strokeWidth={STROKE_W}
                    fill="none"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                );
              })
            )}
          </G>
        </Svg>

      </View>

      {/* Label */}
      <Text style={[styles.label, { color: theme.text.secondary }]} numberOfLines={1}>
        {goalLabel}
      </Text>

    </TouchableOpacity>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap:        Spacing[1],
    minWidth:   SIZE,
  },
  svgWrap: {
    width:    SIZE,
    height:   SIZE,
  },

  // Photo circle sits inside the ring with a gap
  imgInner: {
    position:     'absolute',
    top:          IMG_OFFSET,
    left:         IMG_OFFSET,
    width:        IMG_SIZE,
    height:       IMG_SIZE,
    borderRadius: IMG_SIZE / 2,
    overflow:     'hidden',
  },

  // Green overlay when all items done
  doneMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34,160,80,0.72)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  doneCheck: {
    fontSize:   22,
    color:      '#fff',
    lineHeight: 28,
  },

  label: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   Typography.size.xs,
    maxWidth:   80,
    textAlign:  'center',
  },
});
