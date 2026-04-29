import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useRoutine } from '../../hooks/useRoutine';
import { getGoalById } from '../../data/goals';
import { RoutineItem } from '../../data/routineItems';
import { Typography, Spacing, Radius } from '../../theme';
import Icon from '../../components/icons/Icon';

interface Props {
  navigation: any;
}

type Tab = 'today' | 'goals';

export default function RoutineScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const {
    getTodayItems,
    getGoalItems,
    getGoalProgress,
    completeItem,
    uncompleteItem,
    isItemDoneToday,
  } = useRoutine();

  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!user) return null;

  const userGoals = user.goals ?? [];

  // ── Today tab ─────────────────────────────────────────────────────────────

  // Collect all eligible items across all goals, deduplicated
  const allItems: RoutineItem[] = [];
  const seen = new Set<string>();
  for (const goalId of userGoals) {
    for (const item of getGoalItems(user, goalId)) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        allItems.push(item);
      }
    }
  }
  if (allItems.length === 0) {
    // Fallback: use scored today items
    for (const item of getTodayItems(user)) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        allItems.push(item);
      }
    }
  }

  const todoItems = allItems.filter(i => !isItemDoneToday(i.id));
  const doneItems = allItems.filter(i => isItemDoneToday(i.id));

  // ── Helpers ───────────────────────────────────────────────────────────────

  const toggleGoal = (id: string) =>
    setExpandedGoals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleItem = (id: string) =>
    setExpandedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const freqLabel = (freq: RoutineItem['frequency']) =>
    freq === 'daily' ? 'Daily' : freq === 'weekly' ? 'Weekly' : 'One-time';

  // ── Sub-components ────────────────────────────────────────────────────────

  const ItemRow = ({ item, isLast }: { item: RoutineItem; isLast: boolean }) => {
    const done = isItemDoneToday(item.id);
    const expanded = expandedItems.includes(item.id);
    const goalIcon = getGoalById(item.goalIds[0])?.icon ?? '✦';

    return (
      <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleItem(item.id)}
          style={[styles.itemRow, done && { opacity: 0.5 }]}
        >
          <Text style={styles.itemEmoji}>{goalIcon}</Text>
          <View style={styles.itemContent}>
            <Text style={[
              styles.itemTitle,
              { color: theme.text.primary },
              done && styles.strikethrough,
            ]}>
              {item.title}
            </Text>
            <Text style={[styles.itemFreq, { color: theme.text.tertiary }]}>
              {freqLabel(item.frequency)}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => done ? uncompleteItem(item.id) : completeItem(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {done
              ? <Icon name="check_circle" size={22} color={theme.accent.sage.text} />
              : <Icon name="circle_dash" size={22} color={theme.border.default} />
            }
          </TouchableOpacity>
        </TouchableOpacity>

        {expanded && (
          <View style={[styles.itemExpanded, { borderTopColor: theme.border.subtle }]}>
            <Text style={[styles.itemDesc, { color: theme.text.secondary }]}>{item.description}</Text>
            {item.why ? (
              <View style={[styles.whyBox, { backgroundColor: theme.bg.subtle }]}>
                <Text style={[styles.whyLabel, { color: theme.text.brand }]}>Why it matters</Text>
                <Text style={[styles.whyText, { color: theme.text.secondary }]}>{item.why}</Text>
              </View>
            ) : null}
            {item.note ? (
              <Text style={[styles.itemNote, { color: theme.accent.gold.text }]}>⚠ {item.note}</Text>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="left" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>My routine</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.bg.surface, borderBottomColor: theme.border.subtle }]}>
        {(['today', 'goals'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && [styles.tabActive, { borderBottomColor: theme.interactive.primary }],
            ]}
          >
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab ? theme.text.brand : theme.text.tertiary },
            ]}>
              {tab === 'today' ? 'Today' : 'My Goals'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TODAY TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'today' && (
          <>
            {allItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No items yet</Text>
                <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
                  Your personalised routine will appear here once your goals are set.
                </Text>
              </View>
            ) : (
              <>
                {todoItems.length > 0 && (
                  <View style={[styles.listCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                    {todoItems.map((item, i) => (
                      <ItemRow key={item.id} item={item} isLast={i === todoItems.length - 1} />
                    ))}
                  </View>
                )}

                {doneItems.length > 0 && (
                  <View style={styles.subsection}>
                    <Text style={[styles.subsectionLabel, { color: theme.text.tertiary }]}>
                      Done today ({doneItems.length})
                    </Text>
                    <View style={[styles.listCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                      {doneItems.map((item, i) => (
                        <ItemRow key={item.id} item={item} isLast={i === doneItems.length - 1} />
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* ── MY GOALS TAB ──────────────────────────────────────────────── */}
        {activeTab === 'goals' && (
          <>
            {userGoals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No goals set</Text>
                <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
                  Update your goals in Profile → Edit goals.
                </Text>
              </View>
            ) : (
              userGoals.map(goalId => {
                const goal = getGoalById(goalId);
                if (!goal) return null;
                const items = getGoalItems(user, goalId);
                const progress = getGoalProgress(user, goalId, 7);
                const doneToday = items.filter(i => isItemDoneToday(i.id)).length;
                const isExpanded = expandedGoals.includes(goalId);

                return (
                  <View key={goalId} style={[styles.goalCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                    {/* Goal header */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleGoal(goalId)}
                      style={styles.goalHeader}
                    >
                      <Text style={styles.goalIcon}>{goal.icon}</Text>
                      <View style={styles.goalMeta}>
                        <Text style={[styles.goalLabel, { color: theme.text.primary }]}>{goal.label}</Text>
                        <Text style={[styles.goalSub, { color: theme.text.tertiary }]}>
                          {doneToday}/{items.length} today · {Math.round(progress * 100)}% this week
                        </Text>
                        {/* Progress bar */}
                        <View style={[styles.progressBg, { backgroundColor: theme.border.subtle }]}>
                          <View style={[
                            styles.progressFill,
                            {
                              backgroundColor: theme.accent.sage.text,
                              width: `${Math.round(progress * 100)}%` as any,
                            },
                          ]} />
                        </View>
                      </View>
                      {isExpanded
                        ? <Icon name="up" size={18} color={theme.text.tertiary} />
                        : <Icon name="down" size={18} color={theme.text.tertiary} />
                      }
                    </TouchableOpacity>

                    {/* Goal items */}
                    {isExpanded && items.length > 0 && (
                      <View style={[styles.goalItems, { borderTopColor: theme.border.subtle }]}>
                        {items.map((item, i) => (
                          <ItemRow key={item.id} item={item} isLast={i === items.length - 1} />
                        ))}
                      </View>
                    )}

                    {isExpanded && items.length === 0 && (
                      <View style={[styles.goalItems, { borderTopColor: theme.border.subtle }]}>
                        <Text style={[styles.emptyBody, { color: theme.text.tertiary, padding: Spacing[4] }]}>
                          No items available for your current stage and week.
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[4],
  },
  subsection: { gap: Spacing[2] },
  subsectionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  listCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  itemEmoji: {
    fontSize: Typography.size.lg,
    lineHeight: Typography.size.lg * 1.4,
  },
  itemContent: { flex: 1, gap: 2 },
  itemTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  itemFreq: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  itemExpanded: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[4],
    paddingTop: Spacing[3],
    gap: Spacing[3],
  },
  itemDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  whyBox: {
    borderRadius: Radius.lg,
    padding: Spacing[3],
    gap: Spacing[1],
  },
  whyLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  whyText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
  },
  itemNote: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },
  goalCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
  },
  goalIcon: {
    fontSize: 28,
    lineHeight: 36,
  },
  goalMeta: { flex: 1, gap: Spacing[1] },
  goalLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  goalSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    marginTop: Spacing[1],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 4,
  },
  goalItems: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing[16],
    gap: Spacing[2],
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  emptyBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
    maxWidth: 260,
  },
});
