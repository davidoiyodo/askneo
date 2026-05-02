import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Platform, KeyboardAvoidingView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../../components/icons/Icon';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import OnboardingBackButton from '../../components/ui/OnboardingBackButton';
import {
  useAppContext, UserStage, GoalId, SubGoalId,
  BirthIntention, FeedingIntention, EmergencyContact, AppUser,
} from '../../hooks/useAppContext';
import { registerUser } from '../../services/auth';
import { GOALS, SUB_GOALS } from '../../data/goals';

// ─── Types ────────────────────────────────────────────────────────────────────

type InternalStep = 'ttc-profile' | 'goals' | 'affirm' | 'subgoals' | 'intentions' | 'personal' | 'preview' | 'ready';
type TtcDuration = '0-3m' | '3-6m' | '6-12m' | '12m+';

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
      partnerStage?: string;
      partnerDueDate?: string;
      partnerBabyDOB?: string;
    };
  };
};

// ─── Step progression logic ───────────────────────────────────────────────────

function nextStep(current: InternalStep, goals: GoalId[], stage: UserStage): InternalStep | 'done' {
  const needsSubs  = goals.includes('baby-development');
  const needsIntentions = stage !== 'ttc' && goals.some(g =>
    ['natural-birth', 'breastfeeding-readiness', 'feeding-success'].includes(g)
  );
  switch (current) {
    case 'ttc-profile': return 'goals';
    case 'goals':       return 'affirm';
    case 'affirm':
      if (needsSubs) return 'subgoals';
      if (needsIntentions) return 'intentions';
      return 'personal';
    case 'subgoals':
      return needsIntentions ? 'intentions' : 'personal';
    case 'intentions':
      return 'personal';
    case 'personal':
      return 'preview';
    case 'preview':
      return 'done';
    case 'ready':
      return 'done';
  }
}

function prevStep(current: InternalStep, goals: GoalId[], stage: UserStage): InternalStep | 'nav-back' {
  const needsSubs = goals.includes('baby-development');
  const needsIntentions = stage !== 'ttc' && goals.some(g =>
    ['natural-birth', 'breastfeeding-readiness', 'feeding-success'].includes(g)
  );
  switch (current) {
    case 'ttc-profile': return 'nav-back';
    case 'goals':      return stage === 'ttc' ? 'ttc-profile' : 'nav-back';
    case 'affirm':     return 'goals';
    case 'subgoals':   return 'goals';
    case 'intentions': return needsSubs ? 'subgoals' : 'goals';
    case 'personal':
      if (needsIntentions) return 'intentions';
      if (needsSubs)       return 'subgoals';
      return 'goals';
    case 'preview':    return 'personal';
    case 'ready':      return 'personal';
  }
}

// Compute ttcStartDate from duration selection
function computeTtcStartDate(duration: TtcDuration | null): string | undefined {
  if (!duration) return undefined;
  const now = new Date();
  const monthsMap: Record<TtcDuration, number> = { '0-3m': 1, '3-6m': 4, '6-12m': 9, '12m+': 14 };
  now.setMonth(now.getMonth() - monthsMap[duration]);
  return now.toISOString().split('T')[0];
}

// ─── Affirm-screen copy ────────────────────────────────────────────────────────

const AFFIRM_COPY: Record<UserStage, { emoji: string; headline: string; message: string }> = {
  pregnancy: {
    emoji: '🤰',
    headline: 'Great choices.',
    message: "Preparing well makes all the difference. We'll make sure you have the right support at every step of your pregnancy.",
  },
  newmom: {
    emoji: '👶',
    headline: "You're doing great.",
    message: "The fact that you're thinking about these things already makes you an incredible parent. We're here with you.",
  },
  ttc: {
    emoji: '🌱',
    headline: "You've got this.",
    message: "Understanding your cycle is the most powerful thing you can do right now. Neo will help you track, learn, and act.",
  },
  partner: {
    emoji: '🤝',
    headline: 'Your support matters.',
    message: "Involved partners make a real difference. We'll make sure you always know how to show up.",
  },
};

// ─── Preview-screen features ───────────────────────────────────────────────────

const PREVIEW_FEATURES: Record<UserStage, Array<{ emoji: string; title: string; desc: string; accent: 'rose' | 'gold' | 'sky' }>> = {
  ttc: [
    { emoji: '🗓', title: 'Cycle Tracker', desc: 'Log your period, BBT, and OPK results. See your fertile window mapped out day by day.', accent: 'rose' },
    { emoji: '💬', title: 'Ask Neo', desc: 'Get instant, personalised answers to your TTC questions — any time, day or night.', accent: 'gold' },
    { emoji: '✅', title: 'Preconception Checklist', desc: 'A step-by-step guide to prepare your body and your life for conception.', accent: 'sky' },
  ],
  pregnancy: [
    { emoji: '🏥', title: 'ANC Visit Tracker', desc: 'Log every antenatal visit, track your baby\'s growth, and prep your next appointment.', accent: 'rose' },
    { emoji: '💬', title: 'Ask Neo', desc: 'Get clear, calm answers about your symptoms, scan results, and what to expect each week.', accent: 'gold' },
    { emoji: '🍼', title: 'Week-by-Week Guide', desc: 'Follow your baby\'s development with personalised updates matched to your pregnancy week.', accent: 'sky' },
  ],
  newmom: [
    { emoji: '📊', title: 'Daily Logs', desc: 'Track feeds, sleep, nappies, and baby milestones — everything in one organised place.', accent: 'rose' },
    { emoji: '💬', title: 'Ask Neo', desc: 'Not sure if something is normal? Ask Neo any time and get triage-level guidance instantly.', accent: 'gold' },
    { emoji: '👶', title: 'Baby Development', desc: 'Age-appropriate milestones and practical tips matched to exactly where your baby is today.', accent: 'sky' },
  ],
  partner: [
    { emoji: '📰', title: 'Weekly Updates', desc: 'Stay in the loop with what\'s happening in your partner\'s pregnancy, week by week.', accent: 'rose' },
    { emoji: '💬', title: 'Ask Neo', desc: 'Ask the questions you might feel awkward asking anyone else — Neo is here for partners too.', accent: 'gold' },
    { emoji: '🤝', title: 'Care Tips', desc: 'Practical, specific advice on how to show up for your partner and baby at every stage.', accent: 'sky' },
  ],
};

// ─── Ready-screen copy ─────────────────────────────────────────────────────────

const READY_COPY: Record<UserStage, string> = {
  pregnancy:  'Your pregnancy companion is ready',
  newmom:     'Your newborn support is ready',
  ttc:        'Your cycle tracker is ready',
  partner:    'Your family companion is ready',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function GoalsScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { setUser } = useAppContext();
  const { stage, name, email, password, date, inviteCode, emergencyContacts, partnerName, partnerStatus, partnerStage, partnerDueDate, partnerBabyDOB } = route.params;

  const [step, setStep] = useState<InternalStep>(stage === 'ttc' ? 'ttc-profile' : 'goals');
  const [selectedGoals, setSelectedGoals]         = useState<GoalId[]>([]);
  const [selectedSubGoals, setSelectedSubGoals]   = useState<SubGoalId[]>([]);
  const [birthIntention, setBirthIntention]       = useState<BirthIntention>('undecided');
  const [feedingIntention, setFeedingIntention]   = useState<FeedingIntention>('undecided');
  const [personalIntention, setPersonalIntention] = useState('');
  // TTC-specific
  const [ttcDuration, setTtcDuration]             = useState<TtcDuration | null>(null);
  const [knownConditions, setKnownConditions]     = useState<string[]>([]);
  // Ready-step state
  const [pendingUser, setPendingUser]             = useState<AppUser | null>(null);
  const readyFade     = useRef(new Animated.Value(0)).current;
  const readyProgress = useRef(new Animated.Value(0)).current;
  const affirmFade    = useRef(new Animated.Value(0)).current;

  // Affirm step: fade in + auto-advance
  useEffect(() => {
    if (step !== 'affirm') return;
    affirmFade.setValue(0);
    Animated.timing(affirmFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const next = nextStep('affirm', selectedGoals, stage);
    const t = setTimeout(() => {
      if (next === 'done') finish();
      else setStep(next as InternalStep);
    }, 2600);
    return () => clearTimeout(t);
  }, [step]);

  // Kick off animations when ready step mounts
  useEffect(() => {
    if (step !== 'ready') return;
    readyFade.setValue(0);
    readyProgress.setValue(0);
    Animated.sequence([
      Animated.timing(readyFade,     { toValue: 1, duration: 600,  useNativeDriver: true }),
      Animated.timing(readyProgress, { toValue: 1, duration: 2000, useNativeDriver: false }),
    ]).start();
  }, [step]);

  // Commit user after animation completes
  useEffect(() => {
    if (step !== 'ready' || !pendingUser) return;
    const t = setTimeout(() => setUser(pendingUser), 2800);
    return () => clearTimeout(t);
  }, [step, pendingUser]);

  const stageGoals = GOALS.filter(g => g.stages.includes(stage));

  const needsBirthQ   = selectedGoals.includes('natural-birth');
  const needsFeedingQ = selectedGoals.some(g =>
    ['breastfeeding-readiness', 'feeding-success'].includes(g)
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleBack = () => {
    const prev = prevStep(step, selectedGoals, stage);
    if (prev === 'nav-back') navigation.goBack();
    else setStep(prev);
  };

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
    const next = nextStep(step, selectedGoals, stage);
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
    const cyclesIrregular = knownConditions.some(c =>
      ['pcos', 'irregular-cycles', 'endometriosis'].includes(c)
    );
    const newUser: AppUser = {
      name,
      email,
      password,
      stage,
      dueDate,
      babyDOB,
      inviteCode: inviteCode || undefined,
      partnerName:    partnerName    || undefined,
      partnerStatus:  partnerStatus  || undefined,
      partnerStage:   (partnerStage  as AppUser['partnerStage'])  || undefined,
      partnerDueDate: partnerDueDate || undefined,
      partnerBabyDOB: partnerBabyDOB || undefined,
      emergencyContacts,
      goals:     selectedGoals,
      subGoals:  selectedSubGoals,
      birthIntention:   birthIntention  !== 'undecided' ? birthIntention  : undefined,
      feedingIntention: feedingIntention !== 'undecided' ? feedingIntention : undefined,
      personalIntentions:
        !skipPersonal && personalIntention.trim()
          ? [personalIntention.trim()]
          : [],
      ...(stage === 'ttc' ? {
        ttcStartDate: computeTtcStartDate(ttcDuration),
        knownConditions: knownConditions.length > 0 ? knownConditions : undefined,
        cyclesIrregular: knownConditions.length > 0 ? cyclesIrregular : undefined,
      } : {}),
      onboardingComplete: true,
    };
    setPendingUser(newUser);
    setStep('ready');
    // Fire registration in background alongside the ready animation.
    // Local setUser still runs after the animation — app stays functional
    // even if the request fails. Replace with blocking flow once login + /me are live.
    registerUser(newUser).catch(err => {
      console.warn('[Auth] Registration failed:', err);
    });
  };

  // ── Grid goal card ────────────────────────────────────────────────────────

  const GridGoalCard = ({
    icon, label, description, selected, onPress,
  }: { icon: string; label: string; description: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[
        styles.gridCard,
        {
          backgroundColor: selected ? theme.bg.subtle : theme.bg.surface,
          borderColor: selected ? theme.interactive.primary : theme.border.subtle,
        },
      ]}
    >
      {selected ? (
        <View style={[styles.gridBadge, { backgroundColor: theme.interactive.primary }]}>
          <Icon name="check" size={11} color="#fff" />
        </View>
      ) : (
        <View style={[styles.gridBadge, { backgroundColor: theme.bg.app, borderWidth: 1.5, borderColor: theme.border.default }]}>
          <Icon name="add" size={11} color={theme.text.tertiary} />
        </View>
      )}
      <Text style={styles.gridEmoji}>{icon}</Text>
      <Text style={[styles.gridCardLabel, { color: theme.text.primary }]}>{label}</Text>
      <Text style={[styles.gridCardDesc, { color: theme.text.secondary }]} numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
  );

  const IntentionPill = ({
    label, selected, onPress,
  }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? theme.interactive.primary : theme.bg.surface,
          borderColor: selected ? theme.interactive.primary : theme.border.default,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: selected ? theme.interactive.primaryText : theme.text.primary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const toggleCondition = (id: string) => {
    setKnownConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const progressWidth = readyProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const { emoji: affirmEmoji, headline: affirmHeadline, message: affirmMessage } = AFFIRM_COPY[stage];
  const previewFeatures = PREVIEW_FEATURES[stage];

  // ── AFFIRM ────────────────────────────────────────────────────────────────

  if (step === 'affirm') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.brand }]}>
        <Animated.View style={[styles.readyContainer, { opacity: affirmFade }]}>
          <View style={styles.readyBody}>
            <Text style={styles.readyGlobe}>{affirmEmoji}</Text>
            <Text style={[styles.readyHeadline, { color: theme.text.inverse }]}>
              {affirmHeadline}
            </Text>
            <Text style={[styles.readySub, { color: theme.text.inverse, opacity: 0.85, paddingHorizontal: Spacing[4] }]}>
              {affirmMessage}
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── PREVIEW ───────────────────────────────────────────────────────────────

  if (step === 'preview') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: theme.text.link }]}>What you'll find inside</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              Everything you need,{'\n'}in one place
            </Text>
          </View>

          <View style={styles.previewList}>
            {previewFeatures.map((f, i) => {
              const accent = theme.accent[f.accent];
              return (
                <View
                  key={i}
                  style={[styles.previewCard, { backgroundColor: accent.bg, borderColor: accent.border }]}
                >
                  <View style={[styles.previewIconWrap, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
                    <Text style={styles.previewEmoji}>{f.emoji}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardLabel, { color: accent.text }]}>{f.title}</Text>
                    <Text style={[styles.cardDesc, { color: accent.text, opacity: 0.8 }]}>{f.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Button label="Enter AskNeo" onPress={advance} fullWidth />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'ready') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.brand }]}>
        <Animated.View style={[styles.readyContainer, { opacity: readyFade }]}>
          <View style={styles.readyBody}>
            <Text style={styles.readyGlobe}>🌍</Text>
            <Text style={[styles.readyHeadline, { color: theme.text.inverse }]}>
              {'Setting up your\nNeo experience'}
            </Text>
            <Text style={[styles.readySub, { color: theme.text.inverse }]}>
              {READY_COPY[stage]}
            </Text>
          </View>
          <View style={styles.progressWrap}>
            <View style={[styles.progressBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth, backgroundColor: theme.text.inverse }]}
              />
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <OnboardingBackButton onPress={handleBack} />

          {/* ── STEP: TTC PROFILE ─────────────────────────────────────── */}
          {step === 'ttc-profile' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.eyebrow, { color: theme.text.link }]}>Your journey</Text>
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  Tell us about your TTC journey
                </Text>
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  This helps us give you the most relevant cycle insights and guidance. Everything is optional and can be updated anytime.
                </Text>
              </View>

              {/* How long trying */}
              <View style={styles.question}>
                <Text style={[styles.questionLabel, { color: theme.text.primary }]}>
                  How long have you been trying to conceive?
                </Text>
                <View style={styles.pillRow}>
                  {([
                    { value: '0-3m',  label: 'Under 3 months' },
                    { value: '3-6m',  label: '3–6 months' },
                    { value: '6-12m', label: '6–12 months' },
                    { value: '12m+',  label: 'Over a year' },
                  ] as { value: TtcDuration; label: string }[]).map(opt => (
                    <IntentionPill
                      key={opt.value}
                      label={opt.label}
                      selected={ttcDuration === opt.value}
                      onPress={() => setTtcDuration(opt.value)}
                    />
                  ))}
                </View>
              </View>

              {/* Known conditions */}
              <View style={styles.question}>
                <Text style={[styles.questionLabel, { color: theme.text.primary }]}>
                  Any of these apply to you? (optional)
                </Text>
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  We use this to tailor your cycle insights.
                </Text>
                <View style={styles.pillRow}>
                  {([
                    { id: 'pcos',             label: 'PCOS' },
                    { id: 'endometriosis',     label: 'Endometriosis' },
                    { id: 'thyroid',           label: 'Thyroid condition' },
                    { id: 'fibroids',          label: 'Fibroids / polyps' },
                    { id: 'irregular-cycles',  label: 'Irregular cycles' },
                    { id: 'none',              label: 'None of these' },
                  ]).map(opt => {
                    const isSelected = opt.id === 'none'
                      ? knownConditions.length === 0
                      : knownConditions.includes(opt.id);
                    return (
                      <IntentionPill
                        key={opt.id}
                        label={opt.label}
                        selected={isSelected}
                        onPress={() => {
                          if (opt.id === 'none') setKnownConditions([]);
                          else toggleCondition(opt.id);
                        }}
                      />
                    );
                  })}
                </View>
              </View>

              <Button label="Continue" onPress={advance} fullWidth />
              <TouchableOpacity onPress={advance} style={styles.skip}>
                <Text style={[styles.skipText, { color: theme.text.tertiary }]}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}

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

              <View style={styles.goalGrid}>
                {stageGoals.map(goal => (
                  <GridGoalCard
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

              <View style={styles.goalGrid}>
                {SUB_GOALS.map(sg => (
                  <GridGoalCard
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
              <TouchableOpacity onPress={() => setStep(nextStep('subgoals', selectedGoals, stage) as InternalStep)} style={styles.skip}>
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
                label="Continue"
                onPress={advance}
                fullWidth
              />
              <TouchableOpacity onPress={() => { setPersonalIntention(''); advance(); }} style={styles.skip}>
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
    paddingTop: Spacing[4],
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
  // Goal / sub-goal grid
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  gridCard: {
    width: '47%',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing[4],
    gap: Spacing[1],
    position: 'relative',
    minHeight: 120,
  },
  gridBadge: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridEmoji: {
    fontSize: 28,
    lineHeight: 38,
  },
  gridCardLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.3,
    marginTop: 2,
  },
  gridCardDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },

  // Preview card text (reused in preview step)
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

  // Preview step
  previewList: { gap: Spacing[3] },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius['2xl'],
    borderWidth: 1.5,
    padding: Spacing[4],
  },
  previewIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewEmoji: { fontSize: 24 },

  // Ready step
  readyContainer: {
    flex: 1,
    paddingHorizontal: Spacing[8],
    paddingBottom: Spacing[12],
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[5],
  },
  readyGlobe: { fontSize: 64 },
  readyHeadline: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: Typography.size['2xl'] * 1.25,
  },
  readySub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    textAlign: 'center',
    opacity: 0.8,
  },
  progressWrap: { width: '100%' },
  progressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
