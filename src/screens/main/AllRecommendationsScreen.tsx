import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import Card from '../../components/ui/Card';
import {
  pregnancyPrompts, babyPrompts, ttcPrompts, partnerPrompts, TimelinePrompt,
} from '../../data/timelinePrompts';
import { getGestationalWeek } from '../../utils/chatEngine';
import Icon from '../../components/icons/Icon';

const DISMISSED_KEY = 'askneo_dismissed_prompts';

const ACCENTS = [
  { bg: 'gold', border: 'gold', text: 'gold' },
  { bg: 'sky',  border: 'sky',  text: 'sky'  },
  { bg: 'peach', border: 'peach', text: 'peach' },
  { bg: 'sage', border: 'sage', text: 'sage' },
  { bg: 'rose', border: 'rose', text: 'rose' },
];

export default function AllRecommendationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY).then(val => {
      if (val) setDismissedIds(JSON.parse(val));
    });
  }, []);

  const saveDismissed = (next: string[]) => {
    setDismissedIds(next);
    AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  };

  const dismiss = (id: string) => saveDismissed([...dismissedIds, id]);
  const restore = (id: string) => saveDismissed(dismissedIds.filter(x => x !== id));
  const toggleExpand = (id: string) =>
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getAllPrompts = (): TimelinePrompt[] => {
    if (!user) return [];
    switch (user.stage) {
      case 'pregnancy': return pregnancyPrompts;
      case 'newmom':    return babyPrompts;
      case 'partner':   return partnerPrompts;
      case 'ttc':       return ttcPrompts;
    }
  };

  const getContextLabel = (p: TimelinePrompt): string | null => {
    if (p.week != null) {
      const tri = p.week <= 12 ? '1st trimester' : p.week <= 26 ? '2nd trimester' : '3rd trimester';
      return `Week ${p.week} · ${tri}`;
    }
    if (p.dayPostpartum != null) {
      if (p.dayPostpartum < 7) return `Day ${p.dayPostpartum}`;
      if (p.dayPostpartum < 30) return `Week ${Math.floor(p.dayPostpartum / 7)}`;
      return `Month ${Math.floor(p.dayPostpartum / 30)}`;
    }
    return null;
  };

  const allPrompts = getAllPrompts();
  const active   = allPrompts.filter(p => !dismissedIds.includes(p.id));
  const dismissed = allPrompts.filter(p =>  dismissedIds.includes(p.id));

  const renderPrompt = (p: TimelinePrompt, index: number, isDismissed: boolean) => {
    const accent = ACCENTS[index % ACCENTS.length];
    const accentBg     = (theme.accent as any)[accent.bg]?.bg     ?? theme.bg.subtle;
    const accentBorder = (theme.accent as any)[accent.border]?.border ?? theme.border.subtle;
    const accentText   = (theme.accent as any)[accent.text]?.text  ?? theme.text.secondary;
    const isExpanded   = expandedIds.includes(p.id);
    const contextLabel = getContextLabel(p);

    return (
      <Card
        key={p.id}
        style={{
          ...styles.promptCard,
          backgroundColor: isDismissed ? theme.bg.subtle : accentBg,
          borderColor: 'transparent',
          opacity: isDismissed ? 0.55 : 1,
        }}
      >
        <View style={[styles.promptAccentBar, { backgroundColor: isDismissed ? theme.border.subtle : accentBorder }]} />

        {contextLabel && (
          <Text style={[styles.contextLabel, { color: isDismissed ? theme.text.tertiary : accentText }]}>
            {contextLabel}
          </Text>
        )}

        <View style={styles.promptHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => !isDismissed && toggleExpand(p.id)}
            style={styles.promptHeaderText}
          >
            <Text style={[styles.promptTitle, { color: theme.text.primary }]}>{p.title}</Text>
          </TouchableOpacity>

          {isDismissed ? (
            <TouchableOpacity
              onPress={() => restore(p.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.restoreChip, { borderColor: theme.border.default }]}
            >
              <Icon name="refresh_anticlockwise_1" size={12} color={theme.text.secondary} />
              <Text style={[styles.restoreText, { color: theme.text.secondary }]}>Restore</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => dismiss(p.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={16} color={theme.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {!isDismissed && (
          <>
            <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(p.id)}>
              <Text
                style={[styles.promptBody, { color: theme.text.secondary }]}
                numberOfLines={isExpanded ? undefined : 3}
              >
                {p.body}
              </Text>
            </TouchableOpacity>
            <View style={styles.promptFooter}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(p.id)}>
                <Text style={[styles.readMore, { color: accentText }]}>
                  {isExpanded ? 'Read less' : 'Read more'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Tabs', { screen: 'AskNeo', params: { prompt: p } })}
              >
                <Text style={[styles.askNeo, { color: accentText }]}>Ask Neo →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
        >
          <Icon name="left" size={20} color={theme.text.primary} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>All recommendations</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Active */}
        {active.length > 0 && (
          <View style={styles.group}>
            <Text style={[styles.groupLabel, { color: theme.text.secondary }]}>
              {active.length} tip{active.length !== 1 ? 's' : ''} for you
            </Text>
            {active.map((p, i) => renderPrompt(p, i, false))}
          </View>
        )}

        {/* Dismissed */}
        {dismissed.length > 0 && (
          <View style={styles.group}>
            <Text style={[styles.groupLabel, { color: theme.text.tertiary }]}>
              {dismissed.length} removed — tap Restore to bring back
            </Text>
            {dismissed.map((p, i) => renderPrompt(p, i + active.length, true))}
          </View>
        )}

        {allPrompts.length === 0 && (
          <Text style={[styles.empty, { color: theme.text.tertiary }]}>
            No recommendations yet. Check back soon.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  backLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[6],
  },
  group: { gap: Spacing[3] },
  groupLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    letterSpacing: 0.3,
    marginBottom: -Spacing[1],
  },
  promptCard: { gap: Spacing[2], overflow: 'hidden' },
  promptAccentBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 3,
    borderTopLeftRadius: Radius['2xl'],
    borderBottomLeftRadius: Radius['2xl'],
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  promptHeaderText: { flex: 1 },
  promptTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  restoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
  },
  restoreText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  promptBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  promptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing[1],
  },
  readMore: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  askNeo: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  empty: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    textAlign: 'center',
    marginTop: Spacing[10],
  },
});
