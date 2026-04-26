import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Polyline, Circle as SvgCircle, Line, Text as SvgText, Rect, Defs,
} from 'react-native-svg';
import { Typography } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BBTPoint {
  cd: number;
  temp: number;
}

interface Props {
  points: BBTPoint[];
  currentCD: number;
  avgCycleLength: number;
  ovulationCD: number | null;  // confirmed ovulation CD to draw a vertical marker
  width: number;
  theme: any;
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const H          = 110;
const PAD_LEFT   = 36;
const PAD_RIGHT  = 8;
const PAD_TOP    = 8;
const PAD_BOTTOM = 22;

// ─── Component ────────────────────────────────────────────────────────────────

export default function BBTChart({ points, currentCD, avgCycleLength, ovulationCD, width, theme }: Props) {
  if (width < 10) return null;

  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;

  // Y range
  const temps = points.map(p => p.temp);
  const rawMin = temps.length ? Math.min(...temps) : 36.2;
  const rawMax = temps.length ? Math.max(...temps) : 37.0;
  const span   = Math.max(rawMax - rawMin, 0.4);
  const yMin   = rawMin - span * 0.25;
  const yMax   = rawMax + span * 0.25;

  // X range: always show at least CD1–28
  const maxCD = Math.max(avgCycleLength, currentCD + 1, 28);

  function xAt(cd: number) {
    return PAD_LEFT + ((cd - 1) / (maxCD - 1)) * plotW;
  }
  function yAt(temp: number) {
    return PAD_TOP + (1 - (temp - yMin) / (yMax - yMin)) * plotH;
  }

  // Phase background bands
  const phases = [
    { from: 1,  to: 5,             color: 'rgba(201,90,104,0.12)' }, // period
    { from: 10, to: 16,            color: 'rgba(90,187,138,0.13)' }, // fertile
    { from: 17, to: avgCycleLength, color: 'rgba(80,160,210,0.09)' }, // TWW
  ];

  // Grid Y values: steps of 0.2°C rounded to 1dp
  const yStep = 0.2;
  const gridTemps: number[] = [];
  const start = Math.ceil(yMin / yStep) * yStep;
  for (let t = start; t <= yMax; t = Math.round((t + yStep) * 10) / 10) {
    gridTemps.push(t);
  }

  // Polyline string (only consecutive points, no bridging across gaps > 3 days)
  let polylineStr = '';
  if (points.length >= 2) {
    const sorted = [...points].sort((a, b) => a.cd - b.cd);
    let segments: BBTPoint[][] = [];
    let seg: BBTPoint[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].cd - sorted[i - 1].cd <= 3) {
        seg.push(sorted[i]);
      } else {
        segments.push(seg);
        seg = [sorted[i]];
      }
    }
    segments.push(seg);
    polylineStr = segments
      .filter(s => s.length >= 2)
      .map(s => s.map(p => `${xAt(p.cd).toFixed(1)},${yAt(p.temp).toFixed(1)}`).join(' '))
      .join(' '); // Note: separate polylines needed, see below
  }

  // Build separate polylines per segment
  const sortedPts = [...points].sort((a, b) => a.cd - b.cd);
  const segments: BBTPoint[][] = [];
  if (sortedPts.length) {
    let seg: BBTPoint[] = [sortedPts[0]];
    for (let i = 1; i < sortedPts.length; i++) {
      if (sortedPts[i].cd - sortedPts[i - 1].cd <= 3) {
        seg.push(sortedPts[i]);
      } else {
        segments.push(seg);
        seg = [sortedPts[i]];
      }
    }
    segments.push(seg);
  }

  // X axis label ticks (every 7 days)
  const xTicks = [1];
  for (let cd = 7; cd <= maxCD; cd += 7) xTicks.push(cd);

  const labelColor = theme.text.tertiary;
  const lineColor  = theme.border.default;
  const dotColor   = theme.text.link;
  const lineStroke = theme.text.link;

  return (
    <View>
      <Svg width={width} height={H}>
        <Defs />

        {/* Phase bands */}
        {phases.map(ph => {
          const fromCD = Math.max(ph.from, 1);
          const toCD   = Math.min(ph.to, maxCD);
          if (fromCD >= toCD) return null;
          const x = xAt(fromCD);
          const w = xAt(toCD) - xAt(fromCD);
          return (
            <Rect
              key={ph.from}
              x={x}
              y={PAD_TOP}
              width={w}
              height={plotH}
              fill={ph.color}
            />
          );
        })}

        {/* Horizontal grid lines */}
        {gridTemps.map(t => (
          <Line
            key={t}
            x1={PAD_LEFT}
            y1={yAt(t)}
            x2={PAD_LEFT + plotW}
            y2={yAt(t)}
            stroke={lineColor}
            strokeWidth={0.5}
            strokeDasharray="3 3"
            opacity={0.4}
          />
        ))}

        {/* Y axis labels */}
        {gridTemps.map(t => (
          <SvgText
            key={`yl-${t}`}
            x={PAD_LEFT - 3}
            y={yAt(t) + 3.5}
            textAnchor="end"
            fontSize={8}
            fontFamily={Typography.fontFamily.body}
            fill={labelColor}
          >
            {t.toFixed(1)}
          </SvgText>
        ))}

        {/* X axis ticks + labels */}
        {xTicks.map(cd => (
          <React.Fragment key={`xt-${cd}`}>
            <Line
              x1={xAt(cd)} y1={PAD_TOP + plotH}
              x2={xAt(cd)} y2={PAD_TOP + plotH + 3}
              stroke={labelColor} strokeWidth={0.8}
            />
            <SvgText
              x={xAt(cd)}
              y={H - 4}
              textAnchor="middle"
              fontSize={8}
              fontFamily={Typography.fontFamily.body}
              fill={labelColor}
            >
              {cd}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Ovulation vertical marker */}
        {ovulationCD != null && ovulationCD >= 1 && ovulationCD <= maxCD && (
          <Line
            x1={xAt(ovulationCD)} y1={PAD_TOP}
            x2={xAt(ovulationCD)} y2={PAD_TOP + plotH}
            stroke="#F4B740"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            opacity={0.8}
          />
        )}

        {/* Current day marker */}
        {currentCD >= 1 && currentCD <= maxCD && (
          <Line
            x1={xAt(currentCD)} y1={PAD_TOP}
            x2={xAt(currentCD)} y2={PAD_TOP + plotH}
            stroke={theme.text.brand}
            strokeWidth={1}
            strokeDasharray="2 2"
            opacity={0.5}
          />
        )}

        {/* BBT line segments */}
        {segments.filter(s => s.length >= 2).map((s, i) => (
          <Polyline
            key={`seg-${i}`}
            points={s.map(p => `${xAt(p.cd).toFixed(1)},${yAt(p.temp).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={lineStroke}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* BBT dots */}
        {sortedPts.map(p => (
          <SvgCircle
            key={`dot-${p.cd}`}
            cx={xAt(p.cd)}
            cy={yAt(p.temp)}
            r={3}
            fill={dotColor}
            stroke={theme.bg.surface}
            strokeWidth={1}
          />
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(201,90,104,0.4)' }]} />
          <Text style={[styles.legendLabel, { color: theme.text.tertiary }]}>Period</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(90,187,138,0.5)' }]} />
          <Text style={[styles.legendLabel, { color: theme.text.tertiary }]}>Fertile</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(80,160,210,0.4)' }]} />
          <Text style={[styles.legendLabel, { color: theme.text.tertiary }]}>Luteal</Text>
        </View>
        {ovulationCD != null && (
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#F4B740' }]} />
            <Text style={[styles.legendLabel, { color: theme.text.tertiary }]}>Ovulation CD{ovulationCD}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
    paddingLeft: 36,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLine: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  legendLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 9,
  },
});
