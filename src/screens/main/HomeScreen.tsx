import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  TextInput, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeartPulse, Activity, NotebookPen, X, Circle, Siren, Send, CheckCircle2, Stethoscope, ChevronDown, ChevronUp, CalendarHeart } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { getPregnancyDevelopment, getPostnatalDevelopment, getPostnatalAgeLabel } from '../../data/babyDevelopment';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useRoutine } from '../../hooks/useRoutine';
import { useANCVisits } from '../../hooks/useANCVisits';
import { useCycleLogs } from '../../hooks/useCycleLogs';
import { getGoalById } from '../../data/goals';
import { GOAL_ACCENT } from '../../utils/goalColors';
import { ITEM_IMAGES } from '../../utils/itemImages';
import WeeklyStreakWidget from '../../components/home/WeeklyStreakWidget';
import ConsultationWidget from '../../components/home/ConsultationWidget';
import GoalStoryCircle from '../../components/home/GoalStoryCircle';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import Card from '../../components/ui/Card';
import { pregnancyPrompts, babyPrompts, ttcPrompts, partnerPrompts, TimelinePrompt } from '../../data/timelinePrompts';
import { getArticlesForUser } from '../../data/articles';
import { getGestationalWeek, getBabyAgeLabel } from '../../utils/chatEngine';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, highlights, removeHighlight, tasks, toggleTask, updateUser } = useAppContext();
  const { getGoalItems, isItemDoneToday } = useRoutine();
  const { visits, totalVisitCount, nextAppointment, loaded: ancLoaded, setupCount, saveSetupCount, reload: reloadANC } = useANCVisits();
  const { cycleDay, isFertileToday, daysUntilTestDay, avgCycleLength, nextFertileWindow } = useCycleLogs();

  useFocusEffect(useCallback(() => { reloadANC(); }, [reloadANC]));

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStageLabel = () => {
    if (!user) return '';
    if (user.stage === 'pregnancy' && user.dueDate) {
      const week = getGestationalWeek(new Date(user.dueDate));
      const trimester = week <= 12 ? 'First trimester' : week <= 26 ? 'Second trimester' : 'Third trimester';
      return `Week ${week} · ${trimester}`;
    }
    if (user.stage === 'newmom' && user.babyDOB) {
      return `Baby is ${getBabyAgeLabel(new Date(user.babyDOB))}`;
    }
    if (user.stage === 'ttc') return 'Trying to Conceive';
    if (user.stage === 'partner') return 'Partner & Support';
    return '';
  };

  const getActivePrompts = (): TimelinePrompt[] => {
    if (!user) return [];
    if (user.stage === 'pregnancy' && user.dueDate) {
      const week = getGestationalWeek(new Date(user.dueDate));
      // show up to 6 prompts: recent past (up to 4 weeks ago) + upcoming
      const relevant = pregnancyPrompts
        .filter(p => p.week != null && p.week >= week - 4 && p.week <= week + 20)
        .sort((a, b) => (a.week ?? 0) - (b.week ?? 0));
      return relevant.length >= 3 ? relevant.slice(0, 6) : pregnancyPrompts.slice(0, 6);
    }
    if (user.stage === 'newmom' && user.babyDOB) {
      const day = Math.floor((Date.now() - new Date(user.babyDOB).getTime()) / 86400000);
      const relevant = babyPrompts
        .filter(p => p.dayPostpartum != null && p.dayPostpartum >= day - 7 && p.dayPostpartum <= day + 60)
        .sort((a, b) => (a.dayPostpartum ?? 0) - (b.dayPostpartum ?? 0));
      return relevant.length >= 3 ? relevant.slice(0, 6) : babyPrompts.slice(0, 6);
    }
    if (user.stage === 'partner') return partnerPrompts.slice(0, 6);
    return ttcPrompts.slice(0, 6);
  };

  const getArticles = () => {
    if (!user) return [];
    const week = user.stage === 'pregnancy' && user.dueDate
      ? getGestationalWeek(new Date(user.dueDate)) : 0;
    const day = user.stage === 'newmom' && user.babyDOB
      ? Math.floor((Date.now() - new Date(user.babyDOB).getTime()) / 86400000) : 0;
    return getArticlesForUser(user.stage, week, day).slice(0, 5);
  };

  const getDevCard = () => {
    if (!user) return null;
    if (user.stage === 'pregnancy' && user.dueDate) {
      const week = getGestationalWeek(new Date(user.dueDate));
      return { label: `Week ${week}`, cardTitle: 'Your baby this week', ...getPregnancyDevelopment(week) };
    }
    if (user.stage === 'newmom' && user.babyDOB) {
      const ageWeeks = Math.floor((Date.now() - new Date(user.babyDOB).getTime()) / (7 * 86400000));
      return { label: getPostnatalAgeLabel(ageWeeks), cardTitle: 'Your little one this week', ...getPostnatalDevelopment(ageWeeks) };
    }
    return null;
  };

  const getANCStartInfo = () => {
    if (!user?.dueDate) return null;
    const currentWeek = getGestationalWeek(new Date(user.dueDate));
    if (currentWeek < 8) {
      const weeksToGo = 8 - currentWeek;
      return {
        status: 'upcoming' as const,
        badge: `Week 8 in ${weeksToGo} week${weeksToGo !== 1 ? 's' : ''}`,
        message: `You're at week ${currentWeek}. In Nigeria, the first ANC visit is recommended at 8–12 weeks. ${weeksToGo} week${weeksToGo !== 1 ? 's' : ''} to go — we'll help you prepare.`,
        cta: "Got it — I'll book at week 8",
      };
    } else if (currentWeek <= 12) {
      return {
        status: 'now' as const,
        badge: 'Now is the ideal time!',
        message: `You're at week ${currentWeek} — this is the ideal window to start antenatal care. Book your first visit as soon as you can.`,
        cta: "Got it — I'll book soon",
      };
    } else {
      return {
        status: 'late' as const,
        badge: 'Start as soon as possible',
        message: `You're at week ${currentWeek}. It's not too late — starting ANC now still makes a real difference. Book your first visit soon.`,
        cta: "Got it — I'll book now",
      };
    }
  };

  const devCard = getDevCard();
  const prompts = getActivePrompts();
  const journalArticles = getArticles();
  const initials = (user?.name ?? 'M')[0].toUpperCase();
  const [askExpanded, setAskExpanded] = useState(false);
  const [askText, setAskText] = useState('');
  const askInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const pendingTasks = tasks.filter(t => !t.done);

  // ANC setup gateway card state
  const [ancSetupStep, setAncSetupStep] = useState<'question' | 'yes' | 'no'>('question');
  const [ancSetupCount, setAncSetupCount] = useState(0);
  const [ancSetupNextAppt, setAncSetupNextAppt] = useState('');
  const [ancSetupShowCal, setAncSetupShowCal] = useState(false);

  // Appointment nudge card
  const [apptCardDismissed, setApptCardDismissed] = useState(false);
  const daysUntilAppt = user?.nextAppointmentDate
    ? Math.ceil((new Date(user.nextAppointmentDate).getTime() - Date.now()) / 86400000)
    : null;
  const isApptToday     = daysUntilAppt === 0;
  const isApptUpcoming  = daysUntilAppt !== null && daysUntilAppt > 0 && daysUntilAppt <= 7;
  const isApptPassed    = daysUntilAppt !== null && daysUntilAppt < 0 && daysUntilAppt >= -3;
  const showApptCard    = (isApptToday || isApptUpcoming || isApptPassed) && !apptCardDismissed;
  const apptDaysLabel   = daysUntilAppt === 1 ? 'tomorrow' : `in ${daysUntilAppt} days`;
  const isPregnancy     = user?.stage === 'pregnancy';

  // Pre-compute TTC cycle card props to avoid IIFE in JSX
  const ttcLmpSeed    = user?.stage === 'ttc' ? user?.dueDate ?? undefined : undefined;
  const ttcCD         = user?.stage === 'ttc' ? cycleDay(ttcLmpSeed) : 0;
  const ttcFertile    = user?.stage === 'ttc' ? isFertileToday(ttcLmpSeed) : false;
  const ttcIsTWW      = ttcCD >= 17 && ttcCD <= avgCycleLength + 2;
  const ttcDaysLeft   = user?.stage === 'ttc' ? daysUntilTestDay(ttcLmpSeed) : 0;
  const ttcPrediction = user?.stage === 'ttc' ? nextFertileWindow(ttcLmpSeed) : null;
  const ttcNextLabel  = ttcPrediction && !ttcPrediction.isCurrentWindow && ttcPrediction.daysUntilStart >= 0
    ? ttcPrediction.daysUntilStart === 0 ? '🌱 Fertile starts today' : `🌱 Fertile in ${ttcPrediction.daysUntilStart}d`
    : null;
  const ttcSubLabel   = ttcFertile
    ? '🌱 Fertile window'
    : ttcIsTWW
    ? (ttcDaysLeft > 0 ? `Test in ~${ttcDaysLeft}d` : 'Test now 🤞')
    : ttcNextLabel ?? 'Cycle Tracker';
  const ttcCardBg     = ttcFertile ? theme.accent.sage.bg : ttcIsTWW ? theme.accent.sky.bg : theme.accent.rose.bg;
  const ttcCardText   = ttcFertile ? theme.accent.sage.text : ttcIsTWW ? theme.accent.sky.text : theme.accent.rose.text;

  useEffect(() => {
    AsyncStorage.getItem('askneo_dismissed_prompts').then(val => {
      if (val) setDismissedIds(JSON.parse(val));
    });
  }, []);

  const handleAskExpand = () => {
    setAskExpanded(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => askInputRef.current?.focus(), 80);
  };

  const handleAskSubmit = () => {
    const text = askText.trim();
    if (!text) return;
    setAskExpanded(false);
    setAskText('');
    Keyboard.dismiss();
    navigation.navigate('AskNeo', { initialMessage: text });
  };

  const handleAskDismiss = () => {
    setAskExpanded(false);
    setAskText('');
    Keyboard.dismiss();
  };

  const toggleExpand = (id: string) =>
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const dismissPrompt = (id: string) =>
    setDismissedIds(prev => {
      const next = [...prev, id];
      AsyncStorage.setItem('askneo_dismissed_prompts', JSON.stringify(next));
      return next;
    });


  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header row: greeting + profile avatar */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.text.secondary }]}>{getGreeting()}</Text>
            <Text style={[styles.greetingName, { color: theme.text.brand }]}>{user?.name || 'Mama'}</Text>
            {getStageLabel() ? (
              <View style={[styles.stageBadge, { backgroundColor: theme.bg.subtle }]}>
                <Text style={[styles.stageBadgeText, { color: theme.text.brand }]}>{getStageLabel()}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('QuickHelp')}
              activeOpacity={0.8}
              style={[styles.sosBtn, { backgroundColor: theme.accent.rose.bg }]}
            >
              <Siren size={18} color={theme.accent.rose.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
              style={[styles.profileBtn, { backgroundColor: theme.interactive.primary }]}
            >
              <Text style={styles.profileInitial}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ask Neo CTA */}
        <View style={[styles.askCard, { backgroundColor: theme.interactive.primary, overflow: 'hidden' }]}>
          <View style={styles.askCircle1} />
          <View style={styles.askCircle2} />
          {askExpanded ? (
            <View style={styles.askInputRow}>
              <TextInput
                ref={askInputRef}
                style={[styles.askInput, { color: '#fff' }]}
                value={askText}
                onChangeText={setAskText}
                placeholder="Type your question..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                returnKeyType="send"
                onSubmitEditing={handleAskSubmit}
                autoFocus
              />
              <TouchableOpacity
                onPress={handleAskDismiss}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <X size={18} color="rgba(255,255,255,0.7)" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAskSubmit}
                activeOpacity={0.7}
                style={[styles.askSendBtn, { backgroundColor: 'rgba(255,255,255,0.2)', opacity: askText.trim() ? 1 : 0.4 }]}
              >
                <Send size={16} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAskExpand}
              style={styles.askCollapsed}
            >
              <Text style={[styles.askPrompt, { color: 'rgba(255,255,255,0.85)' }]}>What's on your mind?</Text>
              <View style={[styles.askBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                <Text style={[styles.askBadgeText, { color: '#FFF6F7' }]}>Ask Neo →</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Weekly rings + Goal story circles */}
        {user && (user.goals ?? []).length > 0 && (() => {
          const goals = user.goals ?? [];
          return (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Today's focus</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.storyRow}
                >
                  {(() => {
                    return goals.map(goalId => {
                      const goalDef = getGoalById(goalId as any);
                      if (!goalDef) return null;
                      const allItems = getGoalItems(user, goalId as any);
                      // Each item is shown in the circle whose goalId appears FIRST in the item's
                      // own goalIds array (among the user's selected goals). This distributes items
                      // fairly rather than giving everything to whichever goal the user picked first.
                      const items = allItems.filter(it => {
                        if (it.universalItem) return goals[0] === goalId;
                        const primary = it.goalIds.find(g => goals.includes(g as any));
                        return primary === goalId;
                      });
                      if (items.length === 0) return null;
                      const doneIds       = new Set(items.filter(it => isItemDoneToday(it.id)).map(it => it.id));
                      const initialIndex  = items.findIndex(it => !doneIds.has(it.id));
                      const specificItems = items.filter(it => !it.universalItem);
                      const coverItem     = specificItems[specificItems.length - 1] ?? items[0];
                      const coverImageUri = ITEM_IMAGES[coverItem.id];
                      return (
                        <GoalStoryCircle
                          key={goalId}
                          goalId={goalId}
                          goalIcon={goalDef.icon}
                          goalLabel={goalDef.label}
                          items={items}
                          doneIds={doneIds}
                          imageUri={coverImageUri}
                          onPress={() => navigation.navigate('GoalStory', { goalId, initialIndex: Math.max(0, initialIndex) })}
                        />
                      );
                    });
                  })()}
                </ScrollView>
              </View>

              <WeeklyStreakWidget
                user={user}
                onPress={() => navigation.navigate('StreakDetail')}
              />
            </>
          );
        })()}

        {/* Quick actions */}
        <View style={styles.quickGrid}>
          {devCard ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BabyDevelopment')}
              style={[styles.quickCard, styles.devCard, { backgroundColor: theme.accent.sky.bg, borderColor: 'transparent' }]}
            >
              <View style={[styles.devWeekPill, { backgroundColor: theme.accent.sky.border }]}>
                <Text style={[styles.devWeekPillText, { color: theme.accent.sky.text }]}>{devCard.label}</Text>
              </View>
              <Text style={[styles.devCardLabel, { color: theme.accent.sky.text }]}>{devCard.cardTitle}</Text>
              <Text style={[styles.devHeadline, { color: theme.text.primary }]} numberOfLines={2}>{devCard.headline}</Text>
            </TouchableOpacity>
          ) : user?.stage === 'ttc' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CycleTracker')}
              style={[styles.quickCard, { backgroundColor: ttcCardBg, borderColor: 'transparent' }]}
            >
              <CalendarHeart size={24} color={ttcCardText} strokeWidth={1.75} />
              <Text style={[styles.quickLabel, { color: ttcCardText }]}>{`CD ${ttcCD}`}</Text>
              <Text style={[styles.quickSublabel, { color: ttcCardText }]}>{ttcSubLabel}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('QuickHelp')}
              style={[styles.quickCard, { backgroundColor: theme.accent.rose.bg, borderColor: 'transparent' }]}
            >
              <HeartPulse size={24} color={theme.accent.rose.text} strokeWidth={1.75} />
              <Text style={[styles.quickLabel, { color: theme.accent.rose.text }]}>{'Symptom\ncheck'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SymptomLog')}
            style={[styles.quickCard, { backgroundColor: theme.accent.sage.bg, borderColor: 'transparent' }]}
          >
            <NotebookPen size={24} color={theme.accent.sage.text} strokeWidth={1.75} />
            <Text style={[styles.quickLabel, { color: theme.accent.sage.text }]}>{'Wellness\nDiary'}</Text>
          </TouchableOpacity>
        </View>

        {/* ANC one-time setup gateway — shows until setupCount is set */}
        {user?.stage === 'pregnancy' && ancLoaded && setupCount === null && (() => {
          const ancInfo = getANCStartInfo();
          const handleSaveYes = () => {
            saveSetupCount(ancSetupCount);
            if (ancSetupNextAppt) updateUser({ nextAppointmentDate: ancSetupNextAppt });
          };
          const handleSaveNo = () => saveSetupCount(0);

          return (
            <View style={[styles.ancSetupCard, { backgroundColor: theme.accent.gold.bg, borderColor: theme.accent.gold.border }]}>
              <View style={styles.ancSetupHeaderRow}>
                <View style={[styles.ancIconWrap, { backgroundColor: theme.accent.gold.border }]}>
                  <Stethoscope size={18} color={theme.accent.gold.text} strokeWidth={1.75} />
                </View>
                <Text style={[styles.ancSetupTitle, { color: theme.text.primary }]}>Antenatal care</Text>
              </View>

              {ancSetupStep === 'question' && (
                <View style={styles.ancSetupBody}>
                  <Text style={[styles.ancSetupQuestion, { color: theme.text.secondary }]}>
                    Have you started your antenatal visits?
                  </Text>
                  <View style={styles.ancSetupBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setAncSetupStep('yes')}
                      style={[styles.ancSetupPrimaryBtn, { backgroundColor: theme.interactive.primary }]}
                    >
                      <Text style={styles.ancSetupPrimaryBtnLabel}>Yes, I have</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setAncSetupStep('no')}
                      style={[styles.ancSetupOutlineBtn, { borderColor: theme.accent.gold.text }]}
                    >
                      <Text style={[styles.ancSetupOutlineBtnLabel, { color: theme.text.primary }]}>Not yet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {ancSetupStep === 'yes' && (
                <View style={styles.ancSetupBody}>
                  <Text style={[styles.ancSetupQuestion, { color: theme.text.secondary }]}>
                    How many visits have you had so far?
                  </Text>
                  <View style={styles.ancCounter}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setAncSetupCount(c => Math.max(0, c - 1))}
                      style={[styles.ancCounterBtn, { borderColor: theme.border.default }]}
                    >
                      <Text style={[styles.ancCounterBtnLabel, { color: theme.text.primary }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.ancCounterValue, { color: theme.text.primary }]}>{ancSetupCount}</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setAncSetupCount(c => Math.min(20, c + 1))}
                      style={[styles.ancCounterBtn, { borderColor: theme.border.default }]}
                    >
                      <Text style={[styles.ancCounterBtnLabel, { color: theme.text.primary }]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.ancSetupQuestion, { color: theme.text.secondary, marginTop: Spacing[3] }]}>
                    When is your next appointment?
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setAncSetupShowCal(v => !v)}
                    style={[styles.ancDateBtn, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}
                  >
                    <Text style={[styles.ancDateBtnLabel, { color: ancSetupNextAppt ? theme.text.primary : theme.text.tertiary }]}>
                      {ancSetupNextAppt
                        ? new Date(ancSetupNextAppt + 'T12:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Select date (optional)'}
                    </Text>
                    {ancSetupShowCal
                      ? <ChevronUp size={14} color={theme.text.tertiary} strokeWidth={2} />
                      : <ChevronDown size={14} color={theme.text.tertiary} strokeWidth={2} />}
                  </TouchableOpacity>
                  {ancSetupShowCal && (
                    <Calendar
                      current={ancSetupNextAppt || new Date().toISOString().split('T')[0]}
                      minDate={new Date().toISOString().split('T')[0]}
                      onDayPress={(day: { dateString: string }) => {
                        setAncSetupNextAppt(day.dateString);
                        setAncSetupShowCal(false);
                      }}
                      markedDates={ancSetupNextAppt ? { [ancSetupNextAppt]: { selected: true, selectedColor: theme.interactive.primary } } : {}}
                      theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        todayTextColor: theme.interactive.primary,
                        selectedDayBackgroundColor: theme.interactive.primary,
                      }}
                    />
                  )}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSaveYes}
                    style={[styles.ancSetupPrimaryBtn, { backgroundColor: theme.interactive.primary, marginTop: Spacing[3] }]}
                  >
                    <Text style={styles.ancSetupPrimaryBtnLabel}>Save →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {ancSetupStep === 'no' && (
                <View style={styles.ancSetupBody}>
                  {ancInfo ? (
                    <>
                      <View style={[
                        styles.ancStatusPill,
                        ancInfo.status === 'upcoming' && { backgroundColor: theme.accent.sky.bg, borderColor: theme.accent.sky.border },
                        ancInfo.status === 'now'      && { backgroundColor: theme.accent.sage.bg, borderColor: theme.accent.sage.border },
                        ancInfo.status === 'late'     && { backgroundColor: theme.accent.rose.bg, borderColor: theme.accent.rose.border },
                      ]}>
                        <Text style={[
                          styles.ancStatusPillLabel,
                          ancInfo.status === 'upcoming' && { color: theme.accent.sky.text },
                          ancInfo.status === 'now'      && { color: theme.accent.sage.text },
                          ancInfo.status === 'late'     && { color: theme.accent.rose.text },
                        ]}>
                          {ancInfo.badge}
                        </Text>
                      </View>
                      <Text style={[styles.ancSetupQuestion, { color: theme.text.secondary }]}>
                        {ancInfo.message}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleSaveNo}
                        style={[styles.ancSetupPrimaryBtn, { backgroundColor: theme.interactive.primary }]}
                      >
                        <Text style={styles.ancSetupPrimaryBtnLabel}>{ancInfo.cta}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.ancSetupQuestion, { color: theme.text.secondary }]}>
                        ANC is recommended as early as 8–12 weeks into pregnancy. When you're ready, we'll help you prepare.
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleSaveNo}
                        style={[styles.ancSetupPrimaryBtn, { backgroundColor: theme.interactive.primary }]}
                      >
                        <Text style={styles.ancSetupPrimaryBtnLabel}>Got it — I'll book soon</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })()}

        {/* ANC persistent reminder — shown while setupCount===0 and no visits logged yet */}
        {user?.stage === 'pregnancy' && ancLoaded && setupCount === 0 && visits.length === 0 && (() => {
          const ancInfo = getANCStartInfo();
          if (!ancInfo) return null;
          const currentWeek  = user.dueDate ? getGestationalWeek(new Date(user.dueDate)) : 0;
          const accentBg     = ancInfo.status === 'upcoming' ? theme.accent.sky.bg     : ancInfo.status === 'now' ? theme.accent.sage.bg     : theme.accent.rose.bg;
          const accentBorder = ancInfo.status === 'upcoming' ? theme.accent.sky.border : ancInfo.status === 'now' ? theme.accent.sage.border : theme.accent.rose.border;
          const accentText   = ancInfo.status === 'upcoming' ? theme.accent.sky.text   : ancInfo.status === 'now' ? theme.accent.sage.text   : theme.accent.rose.text;
          const shortMsg =
            ancInfo.status === 'upcoming'
              ? `You're at week ${currentWeek}. First ANC visit recommended at 8–12 weeks — ${8 - currentWeek} week${8 - currentWeek !== 1 ? 's' : ''} to go.`
              : ancInfo.status === 'now'
              ? `You're at week ${currentWeek} — now is the ideal window to book your first antenatal visit.`
              : `You're at week ${currentWeek}. Book your first ANC visit as soon as you can.`;
          const cta = ancInfo.status === 'upcoming' ? 'Prepare for week 8 →' : 'Log first visit →';
          return (
            <View style={[styles.ancReminderCard, { backgroundColor: accentBg, borderColor: accentBorder }]}>
              <View style={[styles.ancStatusPill, { backgroundColor: accentBg, borderColor: accentBorder }]}>
                <Text style={[styles.ancStatusPillLabel, { color: accentText }]}>{ancInfo.badge}</Text>
              </View>
              <Text style={[styles.ancReminderTitle, { color: theme.text.primary }]}>First antenatal visit</Text>
              <Text style={[styles.ancReminderMsg, { color: theme.text.secondary }]}>{shortMsg}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ANCVisits')}
                style={[styles.ancReminderBtn, { backgroundColor: theme.interactive.primary }]}
              >
                <Text style={styles.ancReminderBtnLabel}>{cta}</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Consultation widget */}
        <ConsultationWidget navigation={navigation} />

        {/* Chat Highlights */}
        {highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Your highlights</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsRow}>
              {highlights.map((h, i) => (
                <View key={i} style={[styles.highlightChip, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle, ...Shadow.sm }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('AskNeo')}
                    style={styles.highlightTextArea}
                  >
                    <Text style={[styles.highlightText, { color: theme.text.secondary }]} numberOfLines={2}>{h}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeHighlight(i)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                    style={styles.highlightDeleteBtn}
                  >
                    <X size={12} color={theme.text.tertiary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Pending one-time tasks from Neo */}
        {pendingTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Tasks</Text>
            <View style={[styles.taskCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              {pendingTasks.map((task, i) => (
                <TouchableOpacity
                  key={task.id}
                  activeOpacity={0.7}
                  onPress={() => toggleTask(task.id)}
                  style={[
                    styles.taskRow,
                    { borderTopColor: theme.border.subtle },
                    i === 0 && { borderTopWidth: 0 },
                  ]}
                >
                  <Circle size={20} color={theme.border.default} strokeWidth={2} />
                  <Text style={[styles.taskLabel, { color: theme.text.primary, flex: 1 }]}>{task.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


        {/* Appointment nudge card */}
        {showApptCard && (
          <View style={[styles.apptCard, {
            backgroundColor: isApptToday ? theme.accent.sage.bg : isApptPassed ? theme.accent.peach.bg : theme.accent.gold.bg,
            borderColor: isApptToday ? theme.accent.sage.border : isApptPassed ? theme.accent.peach.border : theme.accent.gold.border,
          }]}>
            <View style={styles.apptCardLeft}>
              {isApptToday ? (
                <>
                  <Text style={[styles.apptCardTitle, { color: theme.text.primary }]}>
                    {isPregnancy ? 'Today is your antenatal visit' : 'Your appointment is today'}
                  </Text>
                  <Text style={[styles.apptCardBody, { color: theme.text.secondary }]}>
                    {isPregnancy
                      ? 'Did you attend? Log how it went so NEO can track your progress and prepare for the next one.'
                      : 'How did it go? Tell NEO about it so it can help you stay on top of your health.'}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(isPregnancy ? 'ANCVisits' : 'AskNeo')}
                    style={[styles.apptCardBtn, { backgroundColor: theme.interactive.primary }]}
                  >
                    <Text style={styles.apptCardBtnLabel}>{isPregnancy ? 'Log this visit →' : 'Tell NEO →'}</Text>
                  </TouchableOpacity>
                </>
              ) : isApptPassed ? (
                <>
                  <Text style={[styles.apptCardTitle, { color: theme.text.primary }]}>
                    {isPregnancy ? 'Did you attend your antenatal visit?' : 'You had an appointment recently'}
                  </Text>
                  <Text style={[styles.apptCardBody, { color: theme.text.secondary }]}>
                    Log how it went while it's fresh — it helps NEO track your progress and prepare better questions for next time.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate(isPregnancy ? 'ANCVisits' : 'AskNeo')}
                      style={[styles.apptCardBtn, { backgroundColor: theme.interactive.primary }]}
                    >
                      <Text style={styles.apptCardBtnLabel}>{isPregnancy ? 'Log visit →' : 'Tell NEO →'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => { updateUser({ nextAppointmentDate: undefined }); setApptCardDismissed(true); }}
                      style={[styles.apptCardBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border.default }]}
                    >
                      <Text style={[styles.apptCardBtnLabel, { color: theme.text.secondary }]}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.apptCardTitle, { color: theme.text.primary }]}>
                    Your appointment is {apptDaysLabel}
                  </Text>
                  <Text style={[styles.apptCardBody, { color: theme.text.secondary }]}>
                    Want to see what to discuss with your doctor?
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('VisitPrep')}
                    style={[styles.apptCardBtn, { backgroundColor: theme.interactive.primary }]}
                  >
                    <Text style={styles.apptCardBtnLabel}>See visit prep →</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setApptCardDismissed(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={theme.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline Prompts */}
        {prompts.filter(p => !dismissedIds.includes(p.id)).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>For you right now</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllRecommendations')} activeOpacity={0.7}>
                <Text style={[styles.seeAllLink, { color: theme.text.link }]}>See all →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.promptList}>
              {prompts.filter(p => !dismissedIds.includes(p.id)).slice(0, 2).map((p, i) => {
                const accentBg     = i % 2 === 0 ? theme.accent.gold.bg     : theme.accent.sky.bg;
                const accentBorder = i % 2 === 0 ? theme.accent.gold.border : theme.accent.sky.border;
                const accentText   = i % 2 === 0 ? theme.accent.gold.text   : theme.accent.sky.text;
                const isExpanded   = expandedIds.includes(p.id);
                return (
                  <Card key={p.id} style={{ ...styles.promptCard, backgroundColor: accentBg, borderColor: 'transparent' }}>
                    <View style={[styles.promptAccentBar, { backgroundColor: accentBorder }]} />
                    <View style={styles.promptHeader}>
                      <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(p.id)} style={styles.promptHeaderText}>
                        <Text style={[styles.promptTitle, { color: theme.text.primary }]}>{p.title}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => dismissPrompt(p.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={16} color={theme.text.tertiary} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(p.id)}>
                      <Text style={[styles.promptBody, { color: theme.text.secondary }]} numberOfLines={isExpanded ? undefined : 3}>
                        {p.body}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.promptFooter}>
                      <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(p.id)}>
                        <Text style={[styles.promptReadMore, { color: accentText }]}>
                          {isExpanded ? 'Read less' : 'Read more'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('AskNeo', { prompt: p })}>
                        <Text style={[styles.promptCta, { color: accentText }]}>Ask Neo →</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}


        {/* Journal articles */}
        {journalArticles.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>From the journal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.journalRow}>
              {journalArticles.map(a => (
                <TouchableOpacity
                  key={a.id}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Article', { article: a })}
                  style={[styles.journalCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
                >
                  {/* Cover hero — emoji is always rendered as fallback, image layers on top */}
                  <View style={[styles.journalCover, { backgroundColor: a.coverBg }]}>
                    <Text style={styles.journalCoverEmoji}>{a.coverEmoji}</Text>
                    <Image
                      source={{ uri: a.coverImage }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                  </View>
                  {/* Meta + text */}
                  <View style={styles.journalBody}>
                    <View style={styles.journalTagRow}>
                      <View style={[styles.journalTagPill, { backgroundColor: theme.bg.subtle }]}>
                        <Text style={[styles.journalTagText, { color: theme.text.brand }]}>{a.tag}</Text>
                      </View>
                      <Text style={[styles.journalReadTime, { color: theme.text.tertiary }]}>{a.readMinutes} min</Text>
                    </View>
                    <Text style={[styles.journalTitle, { color: theme.text.primary }]} numberOfLines={2}>{a.title}</Text>
                    <Text style={[styles.journalExcerpt, { color: theme.text.secondary }]} numberOfLines={2}>{a.excerpt}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}


      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[6],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[4],
  },
  headerLeft: {
    flex: 1,
    gap: Spacing[1],
  },
  greeting: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  greetingName: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
  },
  stageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  stageBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  sosBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileInitial: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
  askCard: {
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  askCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -20,
    right: 60,
  },
  askCircle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -10,
    right: -10,
  },
  askPrompt: {
    flex: 1,
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
    color: 'rgba(255,255,255,0.9)',
  },
  askBadge: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  askBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  askCollapsed: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  askInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  askInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
    paddingVertical: 0,
  },
  askSendBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: Spacing[3] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  seeAllLink: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  restoreChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
  },
  restoreChipText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  highlightsRow: { gap: Spacing[3], paddingRight: Spacing[5] },
  highlightChip: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    width: 180,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  highlightTextArea: {
    flex: 1,
    padding: Spacing[3],
  },
  highlightDeleteBtn: {
    paddingTop: Spacing[3],
    paddingBottom: Spacing[3],
    paddingRight: Spacing[3],
    paddingLeft: Spacing[1],
  },
  highlightText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  promptList: { gap: Spacing[3] },
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
  promptReadMore: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  promptCta: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  quickCard: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
  },
  quickLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.5,
  },
  quickSublabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs - 1,
    textAlign: 'center',
    opacity: 0.75,
  },
  devCard: {
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  devWeekPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  devWeekPillText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  devCardLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    opacity: 0.75,
  },
  devHeadline: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  // ── Tasks (one-time Neo tasks) ────────────────────────────────────────────────
  taskCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  taskLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },

  // ── Goal story circles ────────────────────────────────────────────────────────
  storyRow: {
    flexDirection: 'row',
    gap:           Spacing[5],
    paddingLeft:   Spacing[1],
    paddingRight:  Spacing[5],
  },
  journalRow: { gap: Spacing[3], paddingRight: Spacing[5] },
  journalCard: {
    width: 220,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  journalCover: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalCoverEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  journalBody: {
    padding: Spacing[4],
    gap: Spacing[2],
  },
  journalTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  journalTagPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  journalTagText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  journalReadTime: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  journalTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  journalExcerpt: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
  },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  apptCardLeft: {
    flex: 1,
    gap: Spacing[1],
  },
  apptCardTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  apptCardBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  apptCardBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing[2],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
  },
  apptCardBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  // ANC setup gateway card
  ancSetupCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[4],
  },
  ancSetupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  ancIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ancSetupTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  ancSetupBody: {
    gap: Spacing[3],
  },
  ancSetupQuestion: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.55,
  },
  ancSetupBtnRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  ancSetupPrimaryBtn: {
    flex: 1,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  ancSetupPrimaryBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  ancSetupOutlineBtn: {
    flex: 1,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  ancSetupOutlineBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  ancCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  ancCounterBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ancCounterBtnLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    lineHeight: Typography.size.lg * 1.2,
  },
  ancCounterValue: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size['2xl'],
    minWidth: 32,
    textAlign: 'center',
  },
  ancDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
  },
  ancDateBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  ancStatusPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  ancStatusPillLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  // ANC persistent reminder card
  ancReminderCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  ancReminderTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    marginTop: Spacing[1],
  },
  ancReminderMsg: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.55,
  },
  ancReminderBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing[2],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
  },
  ancReminderBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
});
