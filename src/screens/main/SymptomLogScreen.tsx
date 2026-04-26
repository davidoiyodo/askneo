import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, X, CheckCircle, Circle, Pencil, CalendarDays,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useDailyLogs, toDateKey } from '../../hooks/useDailyLogs';
import { useRoutine } from '../../hooks/useRoutine';
import { getGoalById } from '../../data/goals';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import { SYMPTOMS_BY_STAGE, DEFAULT_SYMPTOMS, BABY_SYMPTOMS } from '../../data/symptoms';
import {
  DailyLog, MoodLevel, EnergyLevel, SleepQuality, SymptomSeverity, MedEntry, BabyMood,
} from '../../types/symptomLog';
import { ConsultationSession } from '../../types/consultation';

// ─── Mood ─────────────────────────────────────────────────────────────────────

const MOODS: Array<{ level: MoodLevel; emoji: string; label: string }> = [
  { level: 1, emoji: '😞', label: 'Rough' },
  { level: 2, emoji: '😕', label: 'Low' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '😊', label: 'Great' },
];

// ─── Energy ───────────────────────────────────────────────────────────────────

const ENERGY: Array<{ value: EnergyLevel; emoji: string; label: string }> = [
  { value: 'low',    emoji: '🪫', label: 'Low' },
  { value: 'medium', emoji: '⚡', label: 'Medium' },
  { value: 'high',   emoji: '🚀', label: 'High' },
];

// ─── Severity ─────────────────────────────────────────────────────────────────

const SEVERITY: Array<{ value: SymptomSeverity; emoji: string; label: string }> = [
  { value: 'mild',     emoji: '😌', label: 'Mild' },
  { value: 'moderate', emoji: '😟', label: 'Moderate' },
  { value: 'severe',   emoji: '😰', label: 'Severe' },
];

// ─── Sleep quality ────────────────────────────────────────────────────────────

const SLEEP_Q: Array<{ value: SleepQuality; emoji: string; label: string }> = [
  { value: 'poor', emoji: '😵', label: 'Poor' },
  { value: 'okay', emoji: '😶', label: 'Okay' },
  { value: 'good', emoji: '😴', label: 'Good' },
];

// ─── Baby mood ────────────────────────────────────────────────────────────────

const BABY_MOODS: Array<{ value: BabyMood; emoji: string; label: string }> = [
  { value: 'settled',   emoji: '😊', label: 'Settled' },
  { value: 'fussy',     emoji: '😟', label: 'Fussy' },
  { value: 'unsettled', emoji: '😰', label: 'Unsettled' },
];

// ─── Severity theme ───────────────────────────────────────────────────────────

const SEV_THEME = {
  mild:     { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46' },
  moderate: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
  severe:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
};


// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text style={[sectionStyles.header, { color: theme.text.secondary }]}>{children}</Text>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    marginBottom: Spacing[2],
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function SymptomLogScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const { logs, todayLog, saveDayLog } = useDailyLogs();
  const { completeItem } = useRoutine();
  const stage = user?.stage ?? 'pregnancy';
  const symptomList = SYMPTOMS_BY_STAGE[stage] ?? DEFAULT_SYMPTOMS;
  const isPregnancy = stage === 'pregnancy';
  const isNewmom = stage === 'newmom';
  const isTTC = stage === 'ttc';
  const userGoals = user?.goals ?? [];
  const hasGoal = (id: string) => userGoals.length === 0 || userGoals.includes(id as any);
  const goalLabel = (id: string) => {
    const g = getGoalById(id as any);
    return g ? `${g.icon} ${g.label}` : null;
  };

  // ── Log state ───────────────────────────────────────────────────────────────
  const [mood, setMood]                   = useState<MoodLevel | null>(null);
  const [energy, setEnergy]               = useState<EnergyLevel | null>(null);
  const [symptoms, setSymptoms]           = useState<string[]>([]);
  const [symptomSeverity, setSymSeverity] = useState<SymptomSeverity | null>(null);
  const [medications, setMedications]     = useState<MedEntry[]>([]);
  const [newMedName, setNewMedName]       = useState('');
  const [sleepHours, setSleepHours]       = useState<number | null>(null);
  const [sleepQuality, setSleepQuality]   = useState<SleepQuality | null>(null);
  const [kickCount, setKickCount]         = useState<number | null>(null);
  const [babyFeedings, setBabyFeedings]   = useState<number | null>(null);
  const [babyNappies, setBabyNappies]     = useState<number | null>(null);
  const [babySleepHours, setBabySleepHours] = useState<number | null>(null);
  const [babyMood, setBabyMood]           = useState<BabyMood | null>(null);
  const [babySymptoms, setBabySymptoms]   = useState<string[]>([]);
  const [babySymSeverity, setBabySymSev]  = useState<SymptomSeverity | null>(null);
  const [showBabySymptoms, setShowBabySymptoms] = useState(false);
  const [notes, setNotes]                 = useState('');
  const [waterGlasses, setWaterGlasses]   = useState<number | null>(null);
  const [showSymptoms, setShowSymptoms]   = useState(false);
  const [saving, setSaving]               = useState(false);

  // ── Calendar state ───────────────────────────────────────────────────────────
  const todayKey = toDateKey();
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [weekStripOffset, setWeekStripOffset] = useState(0);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  // ── Pre-fill form from today's log whenever screen is focused ────────────────
  const prefillFromLog = useCallback((log: DailyLog | null) => {
    setMood(log?.mood ?? null);
    setEnergy(log?.energy ?? null);
    setSymptoms(log?.symptoms ?? []);
    setSymSeverity(log?.symptomSeverity ?? null);
    setSleepHours(log?.sleepHours ?? null);
    setSleepQuality(log?.sleepQuality ?? null);
    setKickCount(log?.kickCount ?? null);
    setBabyFeedings(log?.babyFeedings ?? null);
    setBabyNappies(log?.babyNappies ?? null);
    setBabySleepHours(log?.babySleepHours ?? null);
    setBabyMood(log?.babyMood ?? null);
    setBabySymptoms(log?.babySymptoms ?? []);
    setBabySymSev(log?.babySymptomSeverity ?? null);
    setWaterGlasses(log?.waterGlasses ?? null);
    setNotes(log?.notes ?? '');
    setShowSymptoms(false);
    setShowBabySymptoms(false);
  }, []);

  useFocusEffect(useCallback(() => {
    if (todayLog) {
      prefillFromLog(todayLog);
    } else {
      // No log yet today — pre-populate meds from consultation history
      prefillFromLog(null);
      AsyncStorage.getItem('askneo_consultations').then(val => {
        if (!val) return;
        const sessions: ConsultationSession[] = JSON.parse(val);
        const allMeds = sessions.flatMap(s => s.extractedData?.medications ?? []);
        const unique = allMeds.filter((m, i, arr) => arr.findIndex(x => x.name === m.name) === i);
        if (unique.length > 0) {
          setMedications(unique.map(m => ({ name: `${m.name}${m.dosage ? ` ${m.dosage}` : ''}`, taken: false })));
        }
      });
    }
    if (todayLog) {
      setMedications(todayLog.medications ?? []);
    }
  }, [todayLog?.lastUpdated]));

  // ── Symptoms ────────────────────────────────────────────────────────────────
  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleBabySymptom = (s: string) => {
    setBabySymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  // ── Medications ─────────────────────────────────────────────────────────────
  const toggleMed = (i: number) => {
    setMedications(prev => prev.map((m, idx) => idx === i ? { ...m, taken: !m.taken } : m));
  };

  const addMed = () => {
    const name = newMedName.trim();
    if (!name) return;
    setMedications(prev => [...prev, { name, taken: false }]);
    setNewMedName('');
  };

  const removeMed = (i: number) => {
    setMedications(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── Sleep ────────────────────────────────────────────────────────────────────
  const adjustSleep = (delta: number) => {
    setSleepHours(prev => {
      const cur = prev ?? 7;
      const next = Math.max(0, Math.min(12, cur + delta));
      return next;
    });
  };

  const adjustBabySleep = (delta: number) => {
    setBabySleepHours(prev => {
      const cur = prev ?? 0;
      return Math.max(0, Math.min(24, cur + delta));
    });
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const canSave = mood !== null || symptoms.length > 0 || notes.trim().length > 0
    || (isNewmom && (babyFeedings !== null || babyNappies !== null || babySleepHours !== null || babyMood !== null || babySymptoms.length > 0));

  const saveLog = useCallback(async () => {
    if (!canSave) {
      Alert.alert('Nothing to log', 'Fill in at least your mood, a symptom, or a note.');
      return;
    }
    setSaving(true);
    const log: DailyLog = {
      dateKey: todayKey,
      lastUpdated: new Date().toISOString(),
      stage,
      mood,
      energy,
      symptoms,
      symptomSeverity: symptoms.length > 0 ? symptomSeverity : null,
      medications,
      sleepHours,
      sleepQuality,
      kickCount: isPregnancy ? kickCount : null,
      babyFeedings: isNewmom ? babyFeedings : null,
      babyNappies: isNewmom ? babyNappies : null,
      babySleepHours: isNewmom ? babySleepHours : null,
      babyMood: isNewmom ? babyMood : null,
      babySymptoms: isNewmom ? babySymptoms : [],
      babySymptomSeverity: isNewmom && babySymptoms.length > 0 ? babySymSeverity : null,
      waterGlasses,
      notes: notes.trim(),
    };
    await saveDayLog(log);
    setSaving(false);

    // Auto-complete matching routine items
    completeItem('daily-checkin');
    if (isPregnancy && kickCount !== null && kickCount > 0) completeItem('kick-count');
    if (medications.some(m => /prenatal|vitamin|supplement/i.test(m.name))) completeItem('prenatal-vitamins');
    if (isNewmom && medications.some(m => /iron/i.test(m.name))) completeItem('postnatal-iron');
    if (isTTC && medications.some(m => /folic|folate/i.test(m.name))) completeItem('ttc-folic-acid');
    if (isTTC && medications.some(m => /vitamin|supplement|preconception/i.test(m.name))) completeItem('ttc-vitamins');
    if (isNewmom && babyFeedings !== null && babyFeedings > 0) completeItem('log-feed');
    if (isNewmom && babyNappies !== null && babyNappies > 0)   completeItem('log-nappy');
    if (isNewmom && babySleepHours !== null)                   completeItem('log-baby-sleep');
    if (isTTC) completeItem('ttc-cycle-log');
    // Hydration — any water glasses logged
    if (waterGlasses !== null && waterGlasses > 0) {
      if (isPregnancy) { completeItem('pregnancy-water'); completeItem('hydration'); }
      if (isNewmom)    { completeItem('newmom-water'); completeItem('nursing-hydration'); }
      if (isTTC)         completeItem('ttc-water');
    }

    Alert.alert('Saved ✓', todayLog ? 'Today\'s entry updated.' : 'Diary entry saved.');
  }, [canSave, todayKey, stage, mood, energy, symptoms, symptomSeverity, medications, sleepHours, sleepQuality, kickCount, babyFeedings, babyNappies, babySleepHours, babyMood, babySymptoms, babySymSeverity, notes, waterGlasses, isPregnancy, isNewmom, isTTC, saveDayLog, todayLog, completeItem]);


  // ── Calendar helpers ─────────────────────────────────────────────────────────
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = toDateKey(d);
      if (!logs[key]) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [logs]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const key of Object.keys(logs)) {
      marks[key] = { marked: true, dotColor: theme.interactive.primary };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] ?? {}),
        selected: true,
        selectedColor: theme.interactive.primary,
        dotColor: logs[selectedDate] ? '#fff' : undefined,
      };
    }
    return marks;
  }, [logs, selectedDate, theme.interactive.primary]);


  // ── Week strip (all dates computed in UTC to match toDateKey) ────────────────
  const [todayY, todayM, todayD] = todayKey.split('-').map(Number);
  const todayUTC = new Date(Date.UTC(todayY, todayM - 1, todayD));
  const stripDow = todayUTC.getUTCDay();
  const stripDsm = stripDow === 0 ? 6 : stripDow - 1;
  const mondayUTC = new Date(todayUTC);
  mondayUTC.setUTCDate(todayUTC.getUTCDate() - stripDsm + weekStripOffset * 7);
  const weekStripDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayUTC);
    d.setUTCDate(mondayUTC.getUTCDate() + i);
    return d;
  });
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
          >
            <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
            <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <Text style={[styles.headerTitle, { color: theme.text.brand }]}>Wellness Diary</Text>
            {streak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: theme.accent.gold.bg }]}>
                <Text style={[styles.streakText, { color: theme.accent.gold.text }]}>🔥 {streak}d</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setShowFullCalendar(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.calIconBtn, { backgroundColor: showFullCalendar ? theme.bg.subtle : 'transparent' }]}
              activeOpacity={0.7}
            >
              <CalendarDays size={18} color={showFullCalendar ? theme.text.brand : theme.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Week strip or full calendar ──────────────────────────────── */}
        {showFullCalendar ? (
        <Calendar
          current={selectedDate}
          onDayPress={(day: any) => { setSelectedDate(day.dateString); setShowFullCalendar(false); }}
          markedDates={markedDates}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: theme.text.tertiary,
            selectedDayBackgroundColor: theme.interactive.primary,
            selectedDayTextColor: '#fff',
            todayTextColor: theme.text.brand,
            dayTextColor: theme.text.primary,
            textDisabledColor: theme.border.default,
            dotColor: theme.interactive.primary,
            selectedDotColor: '#fff',
            monthTextColor: theme.text.primary,
            arrowColor: theme.interactive.primary,
            textMonthFontFamily: Typography.fontFamily.bodyBold,
            textDayFontFamily: Typography.fontFamily.bodyMedium,
            textDayHeaderFontFamily: Typography.fontFamily.bodySemibold,
          }}
        />
        ) : (
        <View style={styles.weekStrip}>
          <TouchableOpacity
            onPress={() => setWeekStripOffset(p => p - 1)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            activeOpacity={0.5}
          >
            <ChevronLeft size={16} color={theme.text.secondary} strokeWidth={2.5} />
          </TouchableOpacity>

          {weekStripDates.map((d, i) => {
            const key = d.toISOString().slice(0, 10);
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const isFuture = d > todayUTC;
            const hasEntry = !!logs[key];
            return (
              <TouchableOpacity
                key={i}
                onPress={() => { if (!isFuture) setSelectedDate(key); }}
                activeOpacity={isFuture ? 1 : 0.7}
                style={styles.stripCell}
              >
                <Text style={[styles.stripDayLbl, { color: isSelected ? theme.text.brand : theme.text.tertiary }]}>
                  {DAY_LABELS[i]}
                </Text>
                <View style={[
                  styles.stripDayCircle,
                  isSelected && { backgroundColor: theme.interactive.primary },
                  isToday && !isSelected && { borderWidth: 1.5, borderColor: theme.interactive.primary },
                ]}>
                  <Text style={[styles.stripDayNum, {
                    color: isSelected ? '#fff' : isToday ? theme.text.brand : isFuture ? theme.border.default : theme.text.secondary,
                  }]}>
                    {d.getUTCDate()}
                  </Text>
                </View>
                <View style={[styles.stripDot, hasEntry && !isSelected && { backgroundColor: theme.interactive.primary }]} />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => setWeekStripOffset(p => Math.min(p + 1, 0))}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            activeOpacity={weekStripOffset < 0 ? 0.5 : 1}
            disabled={weekStripOffset === 0}
          >
            <ChevronRight size={16} color={weekStripOffset < 0 ? theme.text.secondary : theme.border.default} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        )}
      </View>

      {selectedDate === todayKey ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── 1. Mood ──────────────────────────────────────────────────── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>How are you feeling today?</SectionHeader>
            <View style={styles.moodRow}>
              {MOODS.map(m => {
                const active = mood === m.level;
                return (
                  <TouchableOpacity
                    key={m.level}
                    onPress={() => setMood(m.level)}
                    activeOpacity={0.75}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={m.label}
                    style={[styles.moodBtn, active && [styles.moodBtnActive, { backgroundColor: theme.accent.rose.bg, borderColor: theme.accent.rose.border }]]}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: active ? theme.accent.rose.text : theme.text.tertiary }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── 2. Energy ────────────────────────────────────────────────── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Energy level</SectionHeader>
            <View style={styles.pillRow}>
              {ENERGY.map(e => {
                const active = energy === e.value;
                return (
                  <TouchableOpacity
                    key={e.value}
                    onPress={() => setEnergy(e.value)}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={e.label}
                    style={[
                      styles.pillBtn,
                      { borderColor: active ? theme.interactive.primary : theme.border.default,
                        backgroundColor: active ? theme.interactive.primary : theme.bg.app },
                    ]}
                  >
                    <Text style={styles.pillEmoji}>{e.emoji}</Text>
                    <Text style={[styles.pillLabel, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>
                      {e.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── 3. Symptoms ──────────────────────────────────────────────── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <TouchableOpacity
              onPress={() => setShowSymptoms(v => !v)}
              activeOpacity={0.7}
              style={styles.collapsibleHeader}
            >
              <SectionHeader>
                {`Any symptoms? ${symptoms.length > 0 ? `(${symptoms.length} selected)` : ''}`}
              </SectionHeader>
              {showSymptoms
                ? <ChevronUp size={16} color={theme.text.tertiary} strokeWidth={2} />
                : <ChevronDown size={16} color={theme.text.tertiary} strokeWidth={2} />
              }
            </TouchableOpacity>

            {showSymptoms && (
              <>
                <View style={styles.chipGrid}>
                  {symptomList.map(s => {
                    const active = symptoms.includes(s);
                    return (
                      <TouchableOpacity
                        key={s}
                        onPress={() => toggleSymptom(s)}
                        activeOpacity={0.75}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: active }}
                        accessibilityLabel={s}
                        style={[
                          styles.chip,
                          { backgroundColor: active ? theme.interactive.primary : theme.bg.app,
                            borderColor: active ? theme.interactive.primary : theme.border.default },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {symptoms.length > 0 && (
                  <View style={{ marginTop: Spacing[3] }}>
                    <SectionHeader>How severe?</SectionHeader>
                    <View style={styles.pillRow}>
                      {SEVERITY.map(sv => {
                        const active = symptomSeverity === sv.value;
                        const sc = SEV_THEME[sv.value];
                        return (
                          <TouchableOpacity
                            key={sv.value}
                            onPress={() => setSymSeverity(sv.value)}
                            activeOpacity={0.8}
                            style={[
                              styles.pillBtn,
                              { borderColor: active ? sc.border : theme.border.default,
                                backgroundColor: active ? sc.bg : theme.bg.app },
                            ]}
                          >
                            <Text style={styles.pillEmoji}>{sv.emoji}</Text>
                            <Text style={[styles.pillLabel, { color: active ? sc.text : theme.text.secondary }]}>
                              {sv.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* ── 4. Medications ───────────────────────────────────────────── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Medications & supplements</SectionHeader>

            {medications.length === 0 && (
              <Text style={[styles.emptyHint, { color: theme.text.tertiary }]}>
                No medications added yet. Add any you've taken or need to take today.
              </Text>
            )}

            {medications.map((med, i) => (
              <View key={i} style={[styles.medRow, { borderColor: theme.border.subtle }]}>
                <TouchableOpacity onPress={() => toggleMed(i)} activeOpacity={0.7} style={styles.medCheck}>
                  {med.taken
                    ? <CheckCircle size={20} color={theme.interactive.primary} strokeWidth={2} />
                    : <Circle size={20} color={theme.border.default} strokeWidth={2} />
                  }
                </TouchableOpacity>
                <Text style={[styles.medName, { color: med.taken ? theme.text.tertiary : theme.text.primary,
                  textDecorationLine: med.taken ? 'line-through' : 'none' }]}>
                  {med.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeMed(i)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <X size={14} color={theme.text.tertiary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={[styles.addMedRow, { borderColor: theme.border.subtle }]}>
              <TextInput
                style={[styles.addMedInput, { color: theme.text.primary }]}
                placeholder="Add medication or supplement..."
                placeholderTextColor={theme.text.tertiary}
                value={newMedName}
                onChangeText={setNewMedName}
                onSubmitEditing={addMed}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={addMed} activeOpacity={0.7} disabled={!newMedName.trim()}>
                <Plus size={18} color={newMedName.trim() ? theme.interactive.primary : theme.border.default} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── 5. Sleep ─────────────────────────────────────────────────── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Sleep last night</SectionHeader>
            <View style={styles.sleepRow}>
              <View style={styles.sleepCounter}>
                <TouchableOpacity
                  onPress={() => adjustSleep(-0.5)}
                  activeOpacity={0.7}
                  style={[styles.counterBtn, { borderColor: theme.border.default }]}
                >
                  <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>−</Text>
                </TouchableOpacity>
                <View style={styles.sleepValueWrap}>
                  <Text style={[styles.sleepValue, { color: theme.text.primary }]}>
                    {sleepHours !== null ? `${sleepHours}h` : '—'}
                  </Text>
                  <Text style={[styles.sleepValueSub, { color: theme.text.tertiary }]}>hours</Text>
                </View>
                <TouchableOpacity
                  onPress={() => adjustSleep(0.5)}
                  activeOpacity={0.7}
                  style={[styles.counterBtn, { borderColor: theme.border.default }]}
                >
                  <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sleepQualityRow}>
                {SLEEP_Q.map(q => {
                  const active = sleepQuality === q.value;
                  return (
                    <TouchableOpacity
                      key={q.value}
                      onPress={() => setSleepQuality(q.value)}
                      activeOpacity={0.8}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={q.label}
                      style={[
                        styles.sleepQBtn,
                        { borderColor: active ? theme.interactive.primary : theme.border.default,
                          backgroundColor: active ? theme.accent.sky.bg : theme.bg.app },
                      ]}
                    >
                      <Text style={styles.sleepQEmoji}>{q.emoji}</Text>
                      <Text style={[styles.sleepQLabel, { color: active ? theme.accent.sky.text : theme.text.secondary }]}>
                        {q.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ── 6. Water intake ──────────────────────────────────────────── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Hydration — glasses of water</SectionHeader>
            <View style={styles.waterRow}>
              <View style={styles.sleepCounter}>
                <TouchableOpacity
                  onPress={() => setWaterGlasses(prev => Math.max(0, (prev ?? 0) - 1))}
                  activeOpacity={0.7}
                  style={[styles.counterBtn, { borderColor: theme.border.default }]}
                >
                  <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>−</Text>
                </TouchableOpacity>
                <View style={styles.sleepValueWrap}>
                  <Text style={[styles.sleepValue, { color: waterGlasses !== null && waterGlasses >= 8 ? theme.accent.sage.text : theme.text.primary }]}>
                    {waterGlasses !== null ? waterGlasses : '—'}
                  </Text>
                  <Text style={[styles.sleepValueSub, { color: theme.text.tertiary }]}>glasses</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setWaterGlasses(prev => (prev ?? 0) + 1)}
                  activeOpacity={0.7}
                  style={[styles.counterBtn, { borderColor: theme.border.default }]}
                >
                  <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.waterGoalWrap}>
                <View style={[styles.waterGoalBar, { backgroundColor: theme.border.subtle }]}>
                  <View style={[styles.waterGoalFill, {
                    backgroundColor: waterGlasses !== null && waterGlasses >= 8 ? theme.accent.sage.text : theme.interactive.primary,
                    width: `${Math.min(100, ((waterGlasses ?? 0) / 8) * 100)}%`,
                  }]} />
                </View>
                <Text style={[styles.waterGoalLabel, { color: theme.text.tertiary }]}>Goal: 8 glasses</Text>
              </View>
            </View>
          </View>

          {/* ── 7. Baby log (newmom only) ────────────────────────────────── */}
          {isNewmom && (
            <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <View style={styles.sectionLabelRow}>
                <SectionHeader>Your baby today</SectionHeader>
                {(hasGoal('feeding-success') || hasGoal('baby-growth') || hasGoal('sleep-patterns')) && (
                  <Text style={[styles.goalTag, { color: theme.text.tertiary }]}>
                    {[hasGoal('feeding-success') && goalLabel('feeding-success'), hasGoal('baby-growth') && goalLabel('baby-growth')].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>

              {/* Feedings */}
              <View style={styles.babyRow}>
                <Text style={[styles.babyRowLabel, { color: theme.text.secondary }]}>🍼 Feedings</Text>
                <View style={styles.babyCounter}>
                  <TouchableOpacity
                    onPress={() => setBabyFeedings(prev => Math.max(0, (prev ?? 0) - 1))}
                    activeOpacity={0.7}
                    style={[styles.counterBtn, { borderColor: theme.border.default }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.babyCountValue, { color: theme.text.primary }]}>
                    {babyFeedings !== null ? babyFeedings : '—'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setBabyFeedings(prev => (prev ?? 0) + 1)}
                    activeOpacity={0.7}
                    style={[styles.counterBtn, { borderColor: theme.border.default }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nappy changes */}
              <View style={[styles.babyRow, { marginTop: Spacing[3] }]}>
                <Text style={[styles.babyRowLabel, { color: theme.text.secondary }]}>🚼 Nappy changes</Text>
                <View style={styles.babyCounter}>
                  <TouchableOpacity
                    onPress={() => setBabyNappies(prev => Math.max(0, (prev ?? 0) - 1))}
                    activeOpacity={0.7}
                    style={[styles.counterBtn, { borderColor: theme.border.default }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.babyCountValue, { color: theme.text.primary }]}>
                    {babyNappies !== null ? babyNappies : '—'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setBabyNappies(prev => (prev ?? 0) + 1)}
                    activeOpacity={0.7}
                    style={[styles.counterBtn, { borderColor: theme.border.default }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Baby sleep */}
              <View style={[styles.babyRow, { marginTop: Spacing[3] }]}>
                <Text style={[styles.babyRowLabel, { color: theme.text.secondary }]}>😴 Baby sleep</Text>
                <View style={styles.babyCounter}>
                  <TouchableOpacity
                    onPress={() => adjustBabySleep(-0.5)}
                    activeOpacity={0.7}
                    style={[styles.counterBtn, { borderColor: theme.border.default }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.babyCountValue, { color: theme.text.primary }]}>
                    {babySleepHours !== null ? `${babySleepHours}h` : '—'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => adjustBabySleep(0.5)}
                    activeOpacity={0.7}
                    style={[styles.counterBtn, { borderColor: theme.border.default }]}
                  >
                    <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Baby mood */}
              <View style={{ marginTop: Spacing[4] }}>
                <SectionHeader>How is baby doing?</SectionHeader>
                <View style={styles.pillRow}>
                  {BABY_MOODS.map(bm => {
                    const active = babyMood === bm.value;
                    return (
                      <TouchableOpacity
                        key={bm.value}
                        onPress={() => setBabyMood(bm.value)}
                        activeOpacity={0.8}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        accessibilityLabel={bm.label}
                        style={[
                          styles.pillBtn,
                          { borderColor: active ? theme.interactive.primary : theme.border.default,
                            backgroundColor: active ? theme.interactive.primary : theme.bg.app },
                        ]}
                      >
                        <Text style={styles.pillEmoji}>{bm.emoji}</Text>
                        <Text style={[styles.pillLabel, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>
                          {bm.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Baby symptoms */}
              <View style={{ marginTop: Spacing[4] }}>
                <TouchableOpacity
                  onPress={() => setShowBabySymptoms(v => !v)}
                  activeOpacity={0.7}
                  style={styles.collapsibleHeader}
                >
                  <SectionHeader>
                    {`Any symptoms in baby? ${babySymptoms.length > 0 ? `(${babySymptoms.length} selected)` : ''}`}
                  </SectionHeader>
                  {showBabySymptoms
                    ? <ChevronUp size={16} color={theme.text.tertiary} strokeWidth={2} />
                    : <ChevronDown size={16} color={theme.text.tertiary} strokeWidth={2} />
                  }
                </TouchableOpacity>

                {showBabySymptoms && (
                  <>
                    <View style={styles.chipGrid}>
                      {BABY_SYMPTOMS.map(s => {
                        const active = babySymptoms.includes(s);
                        return (
                          <TouchableOpacity
                            key={s}
                            onPress={() => toggleBabySymptom(s)}
                            activeOpacity={0.75}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: active }}
                            accessibilityLabel={s}
                            style={[
                              styles.chip,
                              { backgroundColor: active ? theme.interactive.primary : theme.bg.app,
                                borderColor: active ? theme.interactive.primary : theme.border.default },
                            ]}
                          >
                            <Text style={[styles.chipText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{s}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {babySymptoms.length > 0 && (
                      <View style={{ marginTop: Spacing[3] }}>
                        <SectionHeader>How severe?</SectionHeader>
                        <View style={styles.pillRow}>
                          {SEVERITY.map(sv => {
                            const active = babySymSeverity === sv.value;
                            const sc = SEV_THEME[sv.value];
                            return (
                              <TouchableOpacity
                                key={sv.value}
                                onPress={() => setBabySymSev(sv.value)}
                                activeOpacity={0.8}
                                style={[
                                  styles.pillBtn,
                                  { borderColor: active ? sc.border : theme.border.default,
                                    backgroundColor: active ? sc.bg : theme.bg.app },
                                ]}
                              >
                                <Text style={styles.pillEmoji}>{sv.emoji}</Text>
                                <Text style={[styles.pillLabel, { color: active ? sc.text : theme.text.secondary }]}>
                                  {sv.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          {/* ── 7. Kick count (pregnancy only) ───────────────────────────── */}
          {isPregnancy && (
            <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <View style={styles.sectionLabelRow}>
                <SectionHeader>Baby kicks (in the last hour)</SectionHeader>
                {hasGoal('safe-delivery') && (
                  <Text style={[styles.goalTag, { color: theme.text.tertiary }]}>{goalLabel('safe-delivery')}</Text>
                )}
              </View>
              <View style={styles.kickRow}>
                <TouchableOpacity
                  onPress={() => setKickCount(prev => Math.max(0, (prev ?? 0) - 1))}
                  activeOpacity={0.7}
                  style={[styles.counterBtn, { borderColor: theme.border.default }]}
                >
                  <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>−</Text>
                </TouchableOpacity>
                <View style={styles.kickValueWrap}>
                  <Text style={[styles.kickValue, { color: theme.text.brand }]}>
                    {kickCount !== null ? kickCount : '—'}
                  </Text>
                  <Text style={[styles.kickValueSub, { color: theme.text.tertiary }]}>kicks</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setKickCount(prev => (prev ?? 0) + 1)}
                  activeOpacity={0.7}
                  style={[styles.counterBtn, { borderColor: theme.border.default }]}
                >
                  <Text style={[styles.counterBtnText, { color: theme.text.primary }]}>+</Text>
                </TouchableOpacity>
                {kickCount !== null && kickCount < 10 && (
                  <Text style={[styles.kickWarning, { color: theme.accent.rose.text }]}>
                    Under 10 kicks/hour — mention to your doctor.
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* ── 7. Notes ──────────────────────────────────────────────────── */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Notes — anything else on your mind?</SectionHeader>
            <TextInput
              style={[styles.notesInput, { borderColor: theme.border.default, color: theme.text.primary }]}
              placeholder={"How was your day? Any concerns, questions for your doctor, or things worth noting..."}
              placeholderTextColor={theme.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* ── Save ──────────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={saveLog}
            disabled={saving || !canSave}
            activeOpacity={0.85}
            style={[styles.saveBtn, { backgroundColor: canSave ? theme.interactive.primary : theme.border.subtle }]}
          >
            <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save entry'}</Text>
          </TouchableOpacity>
        </ScrollView>

      ) : (
        /* ── Past day view ─────────────────────────────────────────────────── */
        <ScrollView contentContainerStyle={styles.calScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {selectedDate ? (() => {
            const log = logs[selectedDate];
            const isToday = selectedDate === todayKey;
            const displayDate = isToday
              ? 'Today'
              : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

            if (!log) {
              return (
                <View style={[styles.dayCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                  <Text style={[styles.dayCardDate, { color: theme.text.primary }]}>{displayDate}</Text>
                  <Text style={[styles.dayCardEmpty, { color: theme.text.tertiary }]}>No diary entry for this day.</Text>
                  {isToday && (
                    <TouchableOpacity
                      onPress={() => setSelectedDate(todayKey)}
                      activeOpacity={0.85}
                      style={[styles.dayCardBtn, { backgroundColor: theme.interactive.primary }]}
                    >
                      <Pencil size={14} color="#fff" strokeWidth={2} />
                      <Text style={styles.dayCardBtnText}>Log today</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }

            const moodObj   = log.mood   ? MOODS.find(m => m.level === log.mood)   : null;
            const energyObj = log.energy ? ENERGY.find(e => e.value === log.energy) : null;
            const medsTaken = log.medications.filter(m => m.taken).length;
            const medsTotal = log.medications.length;
            const sc        = log.symptomSeverity ? SEV_THEME[log.symptomSeverity] : null;

            return (
              <View style={[styles.dayCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
                <View style={styles.dayCardHeader}>
                  <Text style={[styles.dayCardDate, { color: theme.text.primary }]}>{displayDate}</Text>
                  {isToday && (
                    <TouchableOpacity
                      onPress={() => setSelectedDate(todayKey)}
                      activeOpacity={0.8}
                      style={[styles.dayCardEditBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.default }]}
                    >
                      <Pencil size={12} color={theme.text.brand} strokeWidth={2} />
                      <Text style={[styles.dayCardEditText, { color: theme.text.brand }]}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {(moodObj || energyObj) && (
                  <View style={styles.dayCardMoodRow}>
                    {moodObj && <Text style={styles.dayCardMoodEmoji}>{moodObj.emoji}</Text>}
                    <View>
                      {moodObj && <Text style={[styles.dayCardMoodLabel, { color: theme.text.primary }]}>{moodObj.label}</Text>}
                      {energyObj && <Text style={[styles.dayCardEnergy, { color: theme.text.tertiary }]}>{energyObj.emoji} {energyObj.label} energy</Text>}
                    </View>
                  </View>
                )}

                <View style={[styles.dayCardDivider, { backgroundColor: theme.border.subtle }]} />

                {log.symptoms.length > 0 && (
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyRowLabel, { color: theme.text.tertiary }]}>{log.stage === 'newmom' ? 'Your symptoms' : 'Symptoms'}</Text>
                    <View style={styles.chipRow}>
                      {log.symptoms.map(s => (
                        <View key={s} style={[styles.histChip, { backgroundColor: theme.bg.subtle }]}>
                          <Text style={[styles.histChipText, { color: theme.text.secondary }]}>{s}</Text>
                        </View>
                      ))}
                      {sc && (
                        <View style={[styles.histChip, { backgroundColor: sc.bg, borderColor: sc.border, borderWidth: 1 }]}>
                          <Text style={[styles.histChipText, { color: sc.text }]}>{log.symptomSeverity!.charAt(0).toUpperCase() + log.symptomSeverity!.slice(1)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {medsTotal > 0 && (
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyRowLabel, { color: theme.text.tertiary }]}>Meds</Text>
                    <Text style={[styles.historyRowValue, { color: theme.text.primary }]}>{medsTaken} of {medsTotal} taken</Text>
                  </View>
                )}

                {(log.sleepHours !== null || log.sleepQuality) && (
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyRowLabel, { color: theme.text.tertiary }]}>Sleep</Text>
                    <Text style={[styles.historyRowValue, { color: theme.text.primary }]}>
                      {[
                        log.sleepHours !== null ? `${log.sleepHours}h` : null,
                        log.sleepQuality ? SLEEP_Q.find(q => q.value === log.sleepQuality)?.emoji + ' ' + log.sleepQuality : null,
                      ].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                )}

                {(log.waterGlasses != null) && (
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyRowLabel, { color: theme.text.tertiary }]}>Water</Text>
                    <Text style={[styles.historyRowValue, { color: theme.text.primary }]}>
                      💧 {log.waterGlasses} glass{log.waterGlasses !== 1 ? 'es' : ''}{log.waterGlasses >= 8 ? ' ✓' : ` / 8`}
                    </Text>
                  </View>
                )}

                {(log.babyFeedings != null || log.babyNappies != null || log.babySleepHours != null || log.babyMood) && (
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyRowLabel, { color: theme.text.tertiary }]}>Baby</Text>
                    <Text style={[styles.historyRowValue, { color: theme.text.primary }]}>
                      {[
                        log.babyFeedings != null ? `🍼 ${log.babyFeedings}` : null,
                        log.babyNappies != null  ? `🚼 ${log.babyNappies}` : null,
                        log.babySleepHours != null ? `😴 ${log.babySleepHours}h` : null,
                        log.babyMood ? BABY_MOODS.find(bm => bm.value === log.babyMood)?.emoji + ' ' + log.babyMood : null,
                      ].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                )}

                {(log.babySymptoms?.length ?? 0) > 0 && (
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyRowLabel, { color: theme.text.tertiary }]}>Baby symptoms</Text>
                    <View style={styles.chipRow}>
                      {(log.babySymptoms ?? []).map(s => (
                        <View key={s} style={[styles.histChip, { backgroundColor: theme.accent.rose.bg }]}>
                          <Text style={[styles.histChipText, { color: theme.accent.rose.text }]}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {log.kickCount !== null && (
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyRowLabel, { color: theme.text.tertiary }]}>Kicks</Text>
                    <Text style={[styles.historyRowValue, { color: log.kickCount < 10 ? theme.accent.rose.text : theme.text.primary }]}>
                      {log.kickCount} in the hour{log.kickCount < 10 ? ' ⚠️' : ''}
                    </Text>
                  </View>
                )}

                {log.notes ? (
                  <View style={[styles.notesPreview, { borderTopColor: theme.border.subtle }]}>
                    <Text style={[styles.notesPreviewText, { color: theme.text.secondary }]} numberOfLines={4}>{log.notes}</Text>
                  </View>
                ) : null}
              </View>
            );
          })() : null}
        </ScrollView>
      )}
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    gap: Spacing[3],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xl,
    letterSpacing: -0.3,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  tabActive: { borderRadius: Radius.full },
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
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[1],
  },
  goalTag: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  section: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  streakBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  streakText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  // Water intake
  waterRow: {
    gap: Spacing[3],
  },
  waterGoalWrap: {
    gap: 4,
  },
  waterGoalBar: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  waterGoalFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  waterGoalLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  // Mood
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  moodBtnActive: {
    borderWidth: 1,
  },
  moodEmoji: { fontSize: 26, lineHeight: 32 },
  moodLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: 10,
  },
  // Pills (energy / severity / sleep quality)
  pillRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  pillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  pillEmoji: { fontSize: 16, lineHeight: 20 },
  pillLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  // Symptom chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  // Medications
  emptyHint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    marginBottom: Spacing[2],
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  medCheck: { flexShrink: 0 },
  medName: {
    flex: 1,
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  addMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingTop: Spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing[1],
  },
  addMedInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  // Sleep
  sleepRow: { gap: Spacing[3] },
  sleepCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bodyMedium,
    lineHeight: 24,
  },
  sleepValueWrap: { alignItems: 'center', minWidth: 56 },
  sleepValue: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
  },
  sleepValueSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  sleepQualityRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  sleepQBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 3,
  },
  sleepQEmoji: { fontSize: 18, lineHeight: 24 },
  sleepQLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
  },
  // Kick count
  kickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flexWrap: 'wrap',
  },
  kickValueWrap: { alignItems: 'center', minWidth: 56 },
  kickValue: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
  },
  kickValueSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  kickWarning: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    flex: 1,
    lineHeight: Typography.size.xs * 1.5,
  },
  // Baby section
  babyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  babyRowLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  babyCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  babyCountValue: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    minWidth: 36,
    textAlign: 'center',
  },
  // Notes
  notesInput: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 110,
  },
  // Save
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    borderRadius: Radius.full,
    marginTop: Spacing[2],
  },
  saveBtnText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
  // History
  group: { gap: Spacing[2] },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[1],
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing[1],
  },
  groupLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  historyCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  // History card header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: Spacing[1],
    flexShrink: 0,
  },
  cardMoodEmoji: {
    fontSize: 34,
    lineHeight: 40,
  },
  cardMoodLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  cardEnergyLine: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    marginTop: 1,
  },
  cardTime: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  historyRowLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    minWidth: 52,
    paddingTop: 2,
  },
  historyRowValue: {
    flex: 1,
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  chipRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
  },
  histChip: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  histChipText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
  },
  histChipMore: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    paddingTop: 2,
  },
  notesPreview: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing[3],
  },
  notesPreviewText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    fontStyle: 'italic',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing[12],
    gap: Spacing[3],
  },
  emptyEmoji: { fontSize: 48, lineHeight: 56 },
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
  emptyBtn: {
    marginTop: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    borderRadius: Radius.full,
  },
  emptyBtnText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  // Calendar tab
  calScroll: {
    paddingBottom: 48,
  },
  dayCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCardDate: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  dayCardEmpty: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
  },
  dayCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginTop: 4,
  },
  dayCardBtnText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  dayCardEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  dayCardEditText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
  },
  dayCardMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayCardMoodEmoji: {
    fontSize: 32,
    lineHeight: 40,
  },
  dayCardMoodLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  dayCardEnergy: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  dayCardDivider: {
    height: 1,
  },
  // Calendar icon button
  calIconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Week strip
  weekStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[1],
  },
  stripCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  stripDayLbl: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  stripDayCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripDayNum: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  stripDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
});
