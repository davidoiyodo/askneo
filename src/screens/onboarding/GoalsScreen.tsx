import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import {
  useAppContext, UserStage, GoalId, SubGoalId,
  BirthIntention, FeedingIntention, EmergencyContact,
} from '../../hooks/useAppContext';
import { GOALS, SUB_GOALS } from '../../data/goals';

// ─── Types ────────────────────────────────────────────────────────────────────

type InternalStep = 'goals' | 'subgoals' | 'intentions' | 'personal';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      stage: UserStage;
      name: string;
      email: string;
      password: string;
      date: string;
      inviteCode: string;
      emergencyContacts: EmergencyContact[];
      partnerName?: string;
      partnerStatus?: 'invited' | 'active';
    };
  };
};

// ─── Step progression logic ───────────────────────────────────────────────────

function nextStep(current: InternalStep, goals: GoalId[]): InternalStep | 'done' {
  const needsSubs  = goals.includes('baby-development');
  const needsIntentions = goals.some(g =>
    ['natural-birth', 'breastfeeding-readiness', 'feeding-success'].includes(g)
  );
  switch (current) {
    case 'goals':
      if (needsSubs) return 'subgoals';
      if (needsIntentions) return 'intentions';
      return 'personal';
    case 'subgoals':
      return needsIntentions ? 'intentions' : 'personal';
    case 'intentions':
      return 'personal';
    case 'personal':
      return 'done';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GoalsScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { setUser } = useAppContext();
  const { stage, name, email, password, date, inviteCode, emergencyContacts, partnerName, partnerStatus } = route.params;

  const [step, setStep] = useState<InternalStep>('goals');
  const [selectedGoals, setSelectedGoals]         = useState<GoalId[]>([]);
  const [selectedSubGoals, setSelectedSubGoals]   = useState<SubGoalId[]>([]);
  const [birthIntention, setBirthIntention]       = useState<BirthIntention>('undecided');
  const [feedingIntention, setFeedingIntention]   = useState<FeedingIntention>('undecided');
  const [personalIntention, setPersonalIntention] = useState('');

  const stageGoals = GOALS.filter(g => g.stages.includes(stage));

  const needsBirthQ   = selectedGoals.includes('natural-birth');
  const needsFeedingQ = selectedGoals.some(g =>
    ['breastfeeding-readiness', 'feeding-success'].includes(g)
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const toggleGoal = (id: GoalId) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleSubGoal = (id: SubGoalId) => {
    setSelectedSubGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const advance = () => {
    const next = nextStep(step, selectedGoals);
    if (next === 'done') {
      finish();
    } else {
      setStep(next);
    }
  };

  const finish = (skipPersonal = false) => {
    let dueDate: string | undefined;
    let babyDOB: string | undefined;
    if (date) {
      if (stage === 'newmom') babyDOB = date;
      else dueDate = date;
    }
    setUser({
      name,
      email,
      password,
      stage,
      dueDate,
      babyDOB,
      inviteCode: inviteCode || undefined,
      partnerName:   partnerName   || undefined,
      partnerStatus: partnerStatus || undefined,
      emergencyContacts,
      goals:     selectedGoals,
      subGoals:  selectedSubGoals,
      birthIntention:   birthIntention  !== 'undecided' ? birthIntention  : undefined,
      feedingIntention: feedingIntention !== 'undecided' ? feedingIntention : undefined,
      personalIntentions:
        !skipPersonal && personalIntention.trim()
          ? [personalIntention.trim()]
          : [],
      onboardingComplete: true,
    });
    navigation.replace('MainApp');
  };

  // ── Shared card renderer ─────────────────────────────────────────────────

  const GoalCard = ({
    icon, label, description, selected, onPress,
  }: { icon: string; label: string; description: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        {
          backgroundColor: selected ? theme.bg.brand : theme.bg.surface,
          borderColor: selected ? theme.border.brand : theme.border.subtle,
        },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: selected ? theme.interactive.primary + '22' : theme.bg.subtle }]}>
        <Text style={styles.cardEmoji}>{icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardLabel, { color: theme.text.primary }]}>{label}</Text>
        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>{description}</Text>
      </View>
      <View style={[
        styles.check,
        {
          backgroundColor: selected ? theme.interactive.primary : 'transparent',
          borderColor: selected ? theme.interactive.primary : theme.border.default,
        },
      ]}>
        {selected && <Check size={12} color="#fff" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );

  const IntentionPill = ({
    label, selected, onPress,
  }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? theme.interactive.primary : theme.bg.surface,
          borderColor: selected ? theme.interactive.primary : theme.border.default,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: selected ? '#fff' : theme.text.primary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── STEP: GOALS ───────────────────────────────────────────── */}
          {step === 'goals' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.eyebrow, { color: theme.text.link }]}>Almost there</Text>
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  What matters most to you?
                </Text>
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  Pick the things you'd like help preparing for. We'll personalise your daily routine around these. You can change them any time.
                </Text>
              </View>

              <View style={styles.list}>
                {stageGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    icon={goal.icon}
                    label={goal.label}
                    description={goal.description}
                    selected={selectedGoals.includes(goal.id)}
                    onPress={() => toggleGoal(goal.id)}
                  />
                ))}
              </View>

              <Button
                label="Continue"
                onPress={advance}
                disabled={selectedGoals.length === 0}
                fullWidth
              />
              <TouchableOpacity onPress={() => advance()} style={styles.skip}>
                <Text style={[styles.skipText, { color: theme.text.tertiary }]}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP: SUB-GOALS ───────────────────────────────────────── */}
          {step === 'subgoals' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.eyebrow, { color: theme.text.link }]}>Baby development</Text>
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  What areas matter most to you?
                </Text>
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  We'll make sure your routine covers the specific things you care about for your baby's development.
                </Text>
              </View>

              <View style={styles.list}>
                {SUB_GOALS.map(sg => (
                  <GoalCard
                    key={sg.id}
                    icon={sg.icon}
                    label={sg.label}
                    description={sg.description}
                    selected={selectedSubGoals.includes(sg.id)}
                    onPress={() => toggleSubGoal(sg.id)}
                  />
                ))}
              </View>

              <Button label="Continue" onPress={advance} fullWidth />
              <TouchableOpacity onPress={() => setStep(nextStep('subgoals', selectedGoals) as InternalStep)} style={styles.skip}>
                <Text style={[styles.skipText, { color: theme.text.tertiary }]}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP: INTENTIONS ──────────────────────────────────────── */}
          {step === 'intentions' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.eyebrow, { color: theme.text.link }]}>Your preferences</Text>
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  A couple of quick questions
                </Text>
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  This helps us show you the right routine items. You can update these any time.
                </Text>
              </View>

              <View style={styles.intentionBlock}>
                {needsBirthQ && (
                  <View style={styles.question}>
                    <Text style={[styles.questionLabel, { color: theme.text.primary }]}>
                      Are you hoping for a natural birth?
                    </Text>
                    <View style={styles.pillRow}>
                      {([
                        { value: 'natural',    label: '🌿 Natural birth' },
                        { value: 'caesarean',  label: '🏥 Planned C-section' },
                        { value: 'undecided',  label: '🤔 Not sure yet' },
                      ] as { value: BirthIntention; label: string }[]).map(opt => (
                        <IntentionPill
                          key={opt.value}
                          label={opt.label}
                          selected={birthIntention === opt.value}
                          onPress={() => setBirthIntention(opt.value)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {needsFeedingQ && (
                  <View style={styles.question}>
                    <Text style={[styles.questionLabel, { color: theme.text.primary }]}>
                      How do you plan to feed your baby?
                    </Text>
                    <View style={styles.pillRow}>
                      {([
                        { value: 'breast',    label: '🤱 Breastfeeding' },
                        { value: 'formula',   label: '🍼 Formula' },
                        { value: 'undecided', label: '🤔 Haven\'t decided' },
                      ] as { value: FeedingIntention; label: string }[]).map(opt => (
                        <IntentionPill
                          key={opt.value}
                          label={opt.label}
                          selected={feedingIntention === opt.value}
                          onPress={() => setFeedingIntention(opt.value)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <Button label="Continue" onPress={advance} fullWidth />
            </>
          )}

          {/* ── STEP: PERSONAL INTENTION ──────────────────────────────── */}
          {step === 'personal' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.eyebrow, { color: theme.text.link }]}>One last thing</Text>
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  Anything else on your mind?
                </Text>
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  Add a personal intention — something important to you that isn't on the list above. This is completely optional.
                </Text>
              </View>

              <View style={[styles.intentionInputWrap, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}>
                <TextInput
                  style={[styles.intentionInput, { color: theme.text.primary }]}
                  placeholder='e.g. "I want my baby to develop a strong immune system"'
                  placeholderTextColor={theme.text.tertiary}
                  value={personalIntention}
                  onChangeText={setPersonalIntention}
                  multiline
                  maxLength={120}
                />
                {personalIntention.length > 0 && (
                  <Text style={[styles.charCount, { color: theme.text.tertiary }]}>
                    {personalIntention.length}/120
                  </Text>
                )}
              </View>

              <Button
                label="Enter AskNeo"
                onPress={() => finish(false)}
                fullWidth
              />
              <TouchableOpacity onPress={() => finish(true)} style={styles.skip}>
                <Text style={[styles.skipText, { color: theme.text.tertiary }]}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[12],
    gap: Spacing[6],
  },
  header: { gap: Spacing[2] },
  eyebrow: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
    lineHeight: Typography.size['2xl'] * 1.25,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.55,
  },
  list: { gap: Spacing[3] },

  // Goal / sub-goal card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
    borderWidth: 1.5,
    padding: Spacing[4],
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardEmoji: { fontSize: 22 },
  cardBody: { flex: 1, gap: 2 },
  cardLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  cardDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Intention pills
  intentionBlock: { gap: Spacing[6] },
  question: { gap: Spacing[3] },
  questionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  pill: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  pillText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },

  // Personal intention input
  intentionInputWrap: {
    borderWidth: 1.5,
    borderRadius: Radius['2xl'],
    padding: Spacing[4],
    gap: Spacing[2],
    minHeight: 100,
  },
  intentionInput: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
    flex: 1,
  },
  charCount: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'right',
  },

  // Skip link
  skip: { alignItems: 'center', paddingVertical: Spacing[2] },
  skipText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
});
