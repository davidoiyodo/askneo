import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useRoutine } from '../../hooks/useRoutine';
import { getGoalById } from '../../data/goals';
import { RoutineItem } from '../../data/routineItems';
import { GOAL_ACCENT } from '../../utils/goalColors';
import { ITEM_IMAGES } from '../../utils/itemImages';
import { GOAL_IMAGES } from '../../utils/goalImages';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import Icon from '../../components/icons/Icon';

interface Props {
  navigation: any;
  route: any;
}

const FREQ_LABEL: Record<string, string> = {
  'daily':           'Daily habit',
  'weekly':          'Weekly habit',
  'trimester-once':  'Do once this trimester',
};

export default function RoutineItemScreen({ navigation, route }: Props) {
  const { item }                              = route.params;
  const { theme }                             = useTheme();
  const { isItemDoneToday, completeItem, uncompleteItem } = useRoutine();

  const insets        = useSafeAreaInsets();
  const primaryGoalId = item.goalIds[0];
  const goalDef       = primaryGoalId ? getGoalById(primaryGoalId) : null;
  const accentKey     = primaryGoalId ? (GOAL_ACCENT[primaryGoalId] ?? 'rose') : 'rose';
  const accent        = theme.accent[accentKey];
  const heroImageUri  = ITEM_IMAGES[item.id] ?? (primaryGoalId ? GOAL_IMAGES[primaryGoalId] : undefined);

  // ── Completion state ────────────────────────────────────────────────────────
  const [achieved, setAchieved] = useState(isItemDoneToday(item.id));

  const btnScaleAnim  = useRef(new Animated.Value(1)).current;
  const checkOpacity  = useRef(new Animated.Value(achieved ? 1 : 0)).current;

  const handleAchieve = () => {
    if (achieved) {
      // Undo
      uncompleteItem(item.id);
      setAchieved(false);
      Animated.timing(checkOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      return;
    }
    // Mark done
    completeItem(item.id);
    setAchieved(true);
    Animated.sequence([
      Animated.timing(btnScaleAnim,  { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(btnScaleAnim,  { toValue: 1.0,  duration: 180, useNativeDriver: true }),
    ]).start();
    Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    // Navigate back after a beat so the user sees the green state
    setTimeout(() => navigation.goBack(), 1400);
  };

  return (
    <View style={[styles.safe, { backgroundColor: theme.bg.app }]}>

      {/* ── Back button — floats over hero, mirrors ArticleScreen placement ───── */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        style={[styles.backBtn, { top: insets.top + Spacing[3] }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="left" size={20} color="#fff" />
      </TouchableOpacity>

      {/* ── Scrollable content ───────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero area — full-bleed photo */}
        <ImageBackground
          source={heroImageUri ? { uri: heroImageUri } : undefined}
          style={[styles.hero, { backgroundColor: accent.bg }]}
          resizeMode="cover"
        >
          <View style={styles.heroScrim} />
          {achieved && (
            <Animated.View style={[styles.heroDoneOverlay, { opacity: checkOpacity }]}>
              <Icon name="check_circle" size={40} color="#fff" />
              <Text style={styles.heroDoneText}>Done!</Text>
            </Animated.View>
          )}
        </ImageBackground>

        <View style={styles.body}>
          {/* Goal chip + frequency */}
          <View style={styles.metaRow}>
            {goalDef && (
              <View style={[styles.goalChip, { backgroundColor: accent.bg }]}>
                <Text style={[styles.goalChipText, { color: accent.text }]}>
                  {goalDef.icon} {goalDef.label}
                </Text>
              </View>
            )}
            <View style={[styles.freqChip, { backgroundColor: theme.bg.subtle }]}>
              <Text style={[styles.freqChipText, { color: theme.text.tertiary }]}>
                {FREQ_LABEL[item.frequency] ?? item.frequency}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {item.title}
          </Text>

          {/* Why this matters */}
          {item.why ? (
            <View style={[styles.section, { borderLeftColor: accent.border }]}>
              <Text style={[styles.sectionLabel, { color: accent.text }]}>Why this matters</Text>
              <Text style={[styles.sectionBody, { color: theme.text.secondary }]}>
                {item.why}
              </Text>
            </View>
          ) : null}

          {/* How to do it */}
          {item.description ? (
            <View style={[styles.section, { borderLeftColor: theme.border.default }]}>
              <Text style={[styles.sectionLabel, { color: theme.text.primary }]}>How to do it</Text>
              <Text style={[styles.sectionBody, { color: theme.text.secondary }]}>
                {item.description}
              </Text>
            </View>
          ) : null}

          {/* Clinical note */}
          {item.note ? (
            <View style={[styles.noteCard, { backgroundColor: theme.accent.gold.bg, borderColor: theme.accent.gold.border }]}>
              <Text style={[styles.noteText, { color: theme.accent.gold.text }]}>
                💡 {item.note}
              </Text>
            </View>
          ) : null}

          {/* ── Ask Neo about this ────────────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Tabs', { screen: 'AskNeo', params: { prefill: `About "${item.title}": ` } })}
            style={[styles.askNeoBtn, { borderColor: theme.border.subtle }]}
          >
            <Text style={[styles.askNeoText, { color: theme.text.link }]}>
              Ask Neo about this →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Sticky bottom action bar ─────────────────────────────────────────── */}
      <View style={[
        styles.bottomBar,
        {
          backgroundColor: theme.bg.surface,
          borderTopColor:  theme.border.subtle,
          paddingBottom:   insets.bottom > 0 ? insets.bottom : Spacing[4],
        },
      ]}>
        <Animated.View style={[styles.btnWrap, { transform: [{ scale: btnScaleAnim }] }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleAchieve}
            style={[
              styles.achieveBtn,
              {
                backgroundColor: achieved ? theme.accent.sage.bg   : theme.interactive.primary,
                borderWidth:     achieved ? 1                       : 0,
                borderColor:     achieved ? theme.accent.sage.border : 'transparent',
              },
            ]}
          >
            {achieved
              ? <Icon name="check_circle" size={18} color={theme.accent.sage.text} />
              : null
            }
            <Text style={[
              styles.achieveBtnText,
              { color: achieved ? theme.accent.sage.text : '#fff' },
            ]}>
              {achieved ? 'Achieved ✓' : 'Mark as achieved'}
            </Text>
            {achieved
              ? <Icon name="refresh_anticlockwise_1" size={14} color={theme.accent.sage.text} />
              : null
            }
          </TouchableOpacity>
        </Animated.View>
      </View>

    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  backBtn: {
    position:        'absolute',
    left:            Spacing[5],
    zIndex:          10,
    width:           36,
    height:          36,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  scroll: {
    paddingBottom: Spacing[8],
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    height:         260,
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  heroDoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing[2],
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroDoneText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.xl,
    color:      '#fff',
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[5],
    gap:               Spacing[5],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Spacing[2],
  },
  goalChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1],
    borderRadius:      Radius.full,
  },
  goalChipText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.xs,
  },
  freqChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1],
    borderRadius:      Radius.full,
  },
  freqChipText: {
    fontFamily: Typography.fontFamily.body,
    fontSize:   Typography.size.xs,
  },
  title: {
    fontFamily:    Typography.fontFamily.bodyBold,
    fontSize:      Typography.size['2xl'],
    lineHeight:    Typography.size['2xl'] * 1.25,
    letterSpacing: -0.4,
  },
  section: {
    borderLeftWidth: 3,
    paddingLeft:     Spacing[4],
    gap:             Spacing[2],
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize:   Typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing:  0.5,
  },
  sectionBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize:   Typography.size.base,
    lineHeight: Typography.size.base * 1.65,
  },
  noteCard: {
    borderRadius: Radius.xl,
    borderWidth:  1,
    padding:      Spacing[4],
  },
  noteText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },

  // ── Ask Neo button ────────────────────────────────────────────────────────
  askNeoBtn: {
    alignSelf:         'flex-start',
    paddingVertical:   Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius:      Radius.full,
    borderWidth:       1,
  },
  askNeoText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.sm,
  },

  // ── Bottom bar ────────────────────────────────────────────────────────────
  bottomBar: {
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[4],
    borderTopWidth:    StyleSheet.hairlineWidth,
  },
  btnWrap: {
    width: '100%',
  },
  achieveBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing[2],
    height:         52,
    borderRadius:   Radius['2xl'],
  },
  achieveBtnText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.base,
  },
});
