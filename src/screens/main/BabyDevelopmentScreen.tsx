import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Baby, Heart, Lightbulb } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import {
  getPregnancyDevelopment,
  getPostnatalDevelopment,
  getPostnatalAgeLabel,
  DevelopmentInfo,
} from '../../data/babyDevelopment';
import { getGestationalWeek } from '../../utils/chatEngine';

interface Props {
  navigation: any;
}

export default function BabyDevelopmentScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();

  const isPregnancy = user?.stage === 'pregnancy';

  const getContent = (): { label: string; info: DevelopmentInfo } | null => {
    if (!user) return null;
    if (user.stage === 'pregnancy' && user.dueDate) {
      const week = getGestationalWeek(new Date(user.dueDate));
      return { label: `Week ${week}`, info: getPregnancyDevelopment(week) };
    }
    if (user.stage === 'newmom' && user.babyDOB) {
      const ageWeeks = Math.floor((Date.now() - new Date(user.babyDOB).getTime()) / (7 * 86400000));
      return { label: getPostnatalAgeLabel(ageWeeks), info: getPostnatalDevelopment(ageWeeks) };
    }
    return null;
  };

  const content = getContent();
  if (!content) return null;

  const { label, info } = content;

  const heroBg   = isPregnancy ? theme.accent.sky.bg   : theme.accent.rose.bg;
  const heroText = isPregnancy ? theme.accent.sky.text  : theme.accent.rose.text;
  const cardBg   = theme.bg.surface;
  const askPrompt = isPregnancy
    ? `Tell me more about what's happening in pregnancy at ${label} — both for me and for my baby's development.`
    : `Tell me more about what to expect at ${label} for my baby's development and for me as a new mum.`;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg.app }]}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: heroBg, paddingTop: insets.top + Spacing[3] }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={heroText} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.heroBody}>
          <Text style={[styles.heroLabel, { color: heroText }]}>{label}</Text>
          <Text style={styles.heroEmoji}>{info.emoji}</Text>
          <Text style={[styles.heroHeadline, { color: theme.text.primary }]}>{info.headline}</Text>
          <Text style={[styles.heroDetail, { color: theme.text.secondary }]}>{info.detail}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Baby section */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: theme.border.subtle, ...Shadow.sm }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: isPregnancy ? theme.accent.sky.bg : theme.accent.rose.bg }]}>
              <Baby size={16} color={isPregnancy ? theme.accent.sky.text : theme.accent.rose.text} strokeWidth={2} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
              {isPregnancy ? 'Your baby this week' : 'Your little one'}
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: theme.text.secondary }]}>{info.babySection}</Text>
        </View>

        {/* Mother section */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: theme.border.subtle, ...Shadow.sm }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: theme.accent.sage.bg }]}>
              <Heart size={16} color={theme.accent.sage.text} strokeWidth={2} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
              {isPregnancy ? 'How you might feel' : 'For you this week'}
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: theme.text.secondary }]}>{info.motherSection}</Text>
        </View>

        {/* Tip card */}
        {info.tip ? (
          <View style={[styles.card, styles.tipCard, { backgroundColor: theme.accent.gold.bg, borderColor: theme.accent.gold.border }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={16} color={theme.accent.gold.text} strokeWidth={2} />
              <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Did you know?</Text>
            </View>
            <Text style={[styles.cardBody, { color: theme.text.secondary }]}>{info.tip}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky Ask Neo CTA */}
      <View style={[styles.ctaBar, { backgroundColor: theme.bg.surface, borderTopColor: theme.border.subtle, paddingBottom: insets.bottom + Spacing[3] }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Tabs', { screen: 'AskNeo', params: { initialMessage: askPrompt } })}
          style={[styles.ctaBtn, { backgroundColor: theme.interactive.primary }]}
        >
          <Text style={styles.ctaBtnText}>Ask Neo about {label} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
    gap: Spacing[3],
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing[2],
  },
  heroBody: {
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  heroEmoji: {
    fontSize: 52,
    lineHeight: 64,
  },
  heroHeadline: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
  },
  heroDetail: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    gap: Spacing[4],
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  tipCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  cardBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.7,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  ctaBtn: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
});
