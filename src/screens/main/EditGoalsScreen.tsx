import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext, GoalId, SubGoalId, BirthIntention, FeedingIntention } from '../../hooks/useAppContext';
import { getGoalsForStage, SUB_GOALS } from '../../data/goals';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import Icon from '../../components/icons/Icon';

interface Props {
  navigation: any;
}

export default function EditGoalsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, updateUser } = useAppContext();

  const [goals, setGoals] = useState<GoalId[]>(user?.goals ?? []);
  const [subGoals, setSubGoals] = useState<SubGoalId[]>(user?.subGoals ?? []);
  const [birthIntention, setBirthIntention] = useState<BirthIntention | undefined>(user?.birthIntention);
  const [feedingIntention, setFeedingIntention] = useState<FeedingIntention | undefined>(user?.feedingIntention);
  const [personalIntentions, setPersonalIntentions] = useState<string[]>(
    user?.personalIntentions ?? [],
  );
  const [newIntention, setNewIntention] = useState('');

  if (!user) return null;

  const availableGoals = getGoalsForStage(user.stage);
  const showSubGoals = goals.includes('baby-development');
  const showBirthIntention = goals.includes('natural-birth');
  const showFeedingIntention = goals.includes('breastfeeding-readiness') || goals.includes('feeding-success');

  const toggleGoal = (id: GoalId) =>
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const toggleSubGoal = (id: SubGoalId) =>
    setSubGoals(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const removeIntention = (i: number) =>
    setPersonalIntentions(prev => prev.filter((_, idx) => idx !== i));

  const addIntention = () => {
    const t = newIntention.trim();
    if (!t || personalIntentions.includes(t)) return;
    setPersonalIntentions(prev => [...prev, t]);
    setNewIntention('');
  };

  const save = () => {
    updateUser({
      goals,
      subGoals: showSubGoals ? subGoals : [],
      birthIntention: showBirthIntention ? (birthIntention ?? 'undecided') : undefined,
      feedingIntention: showFeedingIntention ? (feedingIntention ?? 'undecided') : undefined,
      personalIntentions,
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Edit goals</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={save} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.saveLink, { color: theme.text.link }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Goals */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>YOUR GOALS</Text>
          <Text style={[styles.sectionNote, { color: theme.text.secondary }]}>
            Select everything you want to focus on. Your daily routine will adapt.
          </Text>
          <View style={styles.goalGrid}>
            {availableGoals.map(goal => {
              const selected = goals.includes(goal.id);
              return (
                <TouchableOpacity
                  key={goal.id}
                  activeOpacity={0.8}
                  onPress={() => toggleGoal(goal.id)}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: selected ? theme.bg.subtle : theme.bg.surface,
                      borderColor: selected ? theme.interactive.primary : theme.border.subtle,
                    },
                  ]}
                >
                  {selected && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.interactive.primary }]}>
                      <Icon name="check" size={11} color="#fff" />
                    </View>
                  )}
                  <Text style={styles.goalIcon}>{goal.icon}</Text>
                  <Text style={[styles.goalLabel, { color: theme.text.primary }]}>{goal.label}</Text>
                  <Text style={[styles.goalDesc, { color: theme.text.secondary }]} numberOfLines={2}>
                    {goal.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sub-goals */}
        {showSubGoals && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>BABY DEVELOPMENT FOCUS</Text>
            <Text style={[styles.sectionNote, { color: theme.text.secondary }]}>
              Refine what to prioritise under healthy baby development.
            </Text>
            <View style={styles.subGoalList}>
              {SUB_GOALS.map(sg => {
                const selected = subGoals.includes(sg.id);
                return (
                  <TouchableOpacity
                    key={sg.id}
                    activeOpacity={0.8}
                    onPress={() => toggleSubGoal(sg.id)}
                    style={[
                      styles.subGoalRow,
                      {
                        backgroundColor: selected ? theme.bg.subtle : theme.bg.surface,
                        borderColor: selected ? theme.interactive.primary : theme.border.subtle,
                      },
                    ]}
                  >
                    <Text style={styles.subGoalIcon}>{sg.icon}</Text>
                    <View style={styles.subGoalMeta}>
                      <Text style={[styles.subGoalLabel, { color: theme.text.primary }]}>{sg.label}</Text>
                      <Text style={[styles.subGoalDesc, { color: theme.text.secondary }]} numberOfLines={1}>
                        {sg.description}
                      </Text>
                    </View>
                    {selected && <Icon name="check" size={16} color={theme.interactive.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Birth intention */}
        {showBirthIntention && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>BIRTH INTENTION</Text>
            <View style={styles.intentionPillRow}>
              {([
                { value: 'natural', label: '🌿 Natural birth' },
                { value: 'caesarean', label: '🏥 C-section' },
                { value: 'undecided', label: '🤷 Undecided' },
              ] as Array<{ value: BirthIntention; label: string }>).map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.8}
                  onPress={() => setBirthIntention(opt.value)}
                  style={[
                    styles.intentionPill,
                    {
                      backgroundColor: birthIntention === opt.value ? theme.bg.subtle : theme.bg.surface,
                      borderColor: birthIntention === opt.value ? theme.interactive.primary : theme.border.subtle,
                    },
                  ]}
                >
                  <Text style={[styles.intentionPillText, { color: theme.text.primary }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Feeding intention */}
        {showFeedingIntention && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>FEEDING INTENTION</Text>
            <View style={styles.intentionPillRow}>
              {([
                { value: 'breast', label: '🤱 Breastfeeding' },
                { value: 'formula', label: '🍼 Formula' },
                { value: 'undecided', label: '🤷 Undecided' },
              ] as Array<{ value: FeedingIntention; label: string }>).map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.8}
                  onPress={() => setFeedingIntention(opt.value)}
                  style={[
                    styles.intentionPill,
                    {
                      backgroundColor: feedingIntention === opt.value ? theme.bg.subtle : theme.bg.surface,
                      borderColor: feedingIntention === opt.value ? theme.interactive.primary : theme.border.subtle,
                    },
                  ]}
                >
                  <Text style={[styles.intentionPillText, { color: theme.text.primary }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Personal intentions */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>PERSONAL INTENTIONS</Text>
          <Text style={[styles.sectionNote, { color: theme.text.secondary }]}>
            Goals or intentions that are personal to you.
          </Text>
          {personalIntentions.map((t, i) => (
            <View key={i} style={[styles.intentionRow, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <Text style={[styles.intentionText, { color: theme.text.primary, flex: 1 }]}>{t}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => removeIntention(i)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.intentionRemove, { color: theme.text.tertiary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={[styles.addRow, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}>
            <TextInput
              style={[styles.addInput, { color: theme.text.primary }]}
              value={newIntention}
              onChangeText={setNewIntention}
              placeholder="Add a personal intention..."
              placeholderTextColor={theme.text.tertiary}
              maxLength={120}
              returnKeyType="done"
              onSubmitEditing={addIntention}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={addIntention}
              style={[styles.addBtn, { backgroundColor: theme.interactive.primary }]}
            >
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button label="Save goals" onPress={save} fullWidth />

      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
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
  saveLink: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[6],
  },
  section: { gap: Spacing[3] },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    letterSpacing: 0.8,
  },
  sectionNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    marginTop: -Spacing[1],
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  goalCard: {
    width: '47%',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing[4],
    gap: Spacing[1],
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIcon: {
    fontSize: 24,
    lineHeight: 32,
  },
  goalLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.3,
  },
  goalDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },
  subGoalList: { gap: Spacing[2] },
  subGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    padding: Spacing[3],
  },
  subGoalIcon: {
    fontSize: 22,
    lineHeight: 30,
  },
  subGoalMeta: { flex: 1 },
  subGoalLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  subGoalDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 1,
  },
  intentionPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  intentionPill: {
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  intentionPillText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  intentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  intentionText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  intentionRemove: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    paddingLeft: Spacing[4],
    paddingRight: Spacing[2],
    paddingVertical: Spacing[2],
    gap: Spacing[2],
  },
  addInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    minHeight: 36,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    color: '#fff',
    lineHeight: Typography.size.lg * 1.2,
  },
});
