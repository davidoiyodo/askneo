import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle, Circle, AlertTriangle, CalendarCheck,
  ClipboardList, Stethoscope,
} from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useANCVisits, ANCVisit, UrineResult, BinaryResult, HIVStatus } from '../../hooks/useANCVisits';
import { useRoutine } from '../../hooks/useRoutine';
import { getGestationalWeek } from '../../utils/chatEngine';
import { Typography, Spacing, Radius } from '../../theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const URINE_OPTIONS: Array<{ value: UrineResult; label: string; emoji: string }> = [
  { value: 'negative', label: 'Negative', emoji: '✓' },
  { value: 'trace',    label: 'Trace',    emoji: '±' },
  { value: 'positive', label: 'Positive', emoji: '!' },
];

const BINARY_OPTIONS: Array<{ value: BinaryResult; label: string }> = [
  { value: 'negative', label: 'Negative' },
  { value: 'positive', label: 'Positive' },
];

const HIV_OPTIONS: Array<{ value: HIVStatus; label: string }> = [
  { value: 'non-reactive', label: 'Non-reactive' },
  { value: 'reactive',     label: 'Reactive' },
];

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];
const GENOTYPES    = ['AA', 'AS', 'SS', 'AC', 'SC', 'CC'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(dateKey: string) {
  return new Date(dateKey + 'T12:00:00').toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function daysUntil(dateKey: string) {
  const ms = new Date(dateKey + 'T12:00:00').getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

function genId() {
  return `anc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({
  value, onDecrement, onIncrement, onChangeValue, label, format,
}: {
  value: number | null;
  onDecrement: () => void;
  onIncrement: () => void;
  onChangeValue: (v: number | null) => void;
  label?: string;
  format?: (v: number) => string;
}) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const display = value !== null
    ? (format ? format(value) : String(value))
    : '—';

  return (
    <View style={stepperStyles.row}>
      {label && (
        <Text style={[stepperStyles.label, { color: theme.text.secondary }]}>{label}</Text>
      )}
      <View style={stepperStyles.controls}>
        <TouchableOpacity
          onPress={onDecrement}
          activeOpacity={0.7}
          style={[stepperStyles.btn, { borderColor: theme.border.default }]}
        >
          <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={[stepperStyles.value, { color: theme.text.primary }]}
          value={editing ? draft : display}
          onFocus={() => { setEditing(true); setDraft(value !== null ? String(value) : ''); }}
          onChangeText={setDraft}
          onBlur={() => {
            setEditing(false);
            const parsed = parseFloat(draft);
            onChangeValue(isNaN(parsed) ? null : parsed);
          }}
          keyboardType="decimal-pad"
          selectTextOnFocus
          textAlign="center"
        />
        <TouchableOpacity
          onPress={onIncrement}
          activeOpacity={0.7}
          style={[stepperStyles.btn, { borderColor: theme.border.default }]}
        >
          <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, flex: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: {
    width: 34, height: 34, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 18, fontFamily: 'Manrope_500Medium', lineHeight: 22 },
  value: { fontFamily: 'Manrope_700Bold', fontSize: 16, minWidth: 48, textAlign: 'center' },
});

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text style={[shStyles.h, { color: theme.text.secondary }]}>{children}</Text>
  );
}
const shStyles = StyleSheet.create({
  h: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
});

// ─── Main Component ───────────────────────────────────────────────────────────

type ScreenMode = 'list' | 'form';

export default function ANCVisitsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user, updateUser } = useAppContext();
  const { visits, setupCount, loaded, nextAppointment, totalVisitCount, saveVisit, deleteVisit, saveSetupCount } = useANCVisits();
  const { completeItem } = useRoutine();

  // ── Screen mode ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<ScreenMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── Setup count input ────────────────────────────────────────────────────────
  const [setupInput, setSetupInput] = useState(0);

  // ── Form state ───────────────────────────────────────────────────────────────
  const todayKey = toDateKey();
  const [visitDate, setVisitDate]               = useState(todayKey);
  const [showDatePicker, setShowDatePicker]      = useState(false);
  const [gestationalWeek, setGestationalWeek]   = useState<number | null>(null);
  const [weight, setWeight]                     = useState<number | null>(null);
  const [bpSys, setBpSys]                       = useState<number | null>(null);
  const [bpDia, setBpDia]                       = useState<number | null>(null);
  const [fundalHeight, setFundalHeight]         = useState<number | null>(null);
  const [babyHR, setBabyHR]                     = useState<number | null>(null);
  const [urineProtein, setUrineProtein]         = useState<UrineResult | null>(null);
  const [urineGlucose, setUrineGlucose]         = useState<UrineResult | null>(null);
  const [prescriptions, setPrescriptions]       = useState('');
  const [concernFlagged, setConcernFlagged]     = useState(false);
  const [referredToDoctor, setReferredToDoctor] = useState(false);
  const [nextApptDate, setNextApptDate]         = useState<string | null>(null);
  const [showNextApptPicker, setShowNextApptPicker] = useState(false);
  const [notes, setNotes]                       = useState('');
  const [saving, setSaving]                     = useState(false);
  // BP direct-input editing state
  const [bpSysEditing, setBpSysEditing]         = useState(false);
  const [bpSysDraft, setBpSysDraft]             = useState('');
  const [bpDiaEditing, setBpDiaEditing]         = useState(false);
  const [bpDiaDraft, setBpDiaDraft]             = useState('');
  // Blood & lab
  const [pcv, setPcv]                           = useState<number | null>(null);
  const [malariaTest, setMalariaTest]           = useState<BinaryResult | null>(null);
  // Booking tests
  const [showBookingTests, setShowBookingTests] = useState(false);
  const [bloodGroup, setBloodGroup]             = useState<string | null>(null);
  const [hivStatus, setHivStatus]               = useState<HIVStatus | null>(null);
  const [hbsAg, setHbsAg]                       = useState<BinaryResult | null>(null);
  const [vdrl, setVdrl]                         = useState<BinaryResult | null>(null);
  const [genotype, setGenotype]                 = useState<string | null>(null);

  // ── Auto-populate gestational week from dueDate ──────────────────────────────
  const computeWeekForDate = useCallback((dateKey: string) => {
    if (!user?.dueDate) return null;
    const due = new Date(user.dueDate);
    const visit = new Date(dateKey + 'T12:00:00');
    const weeksLeft = Math.round((due.getTime() - visit.getTime()) / (7 * 86400000));
    const week = 40 - weeksLeft;
    return week >= 4 && week <= 42 ? week : null;
  }, [user?.dueDate]);

  // ── Open form ────────────────────────────────────────────────────────────────
  const openNewForm = () => {
    const today = toDateKey();
    setEditingId(null);
    setVisitDate(today);
    setShowDatePicker(false);
    setGestationalWeek(computeWeekForDate(today));
    setWeight(null); setBpSys(null); setBpDia(null);
    setBpSysEditing(false); setBpDiaEditing(false);
    setFundalHeight(null); setBabyHR(null);
    setUrineProtein(null); setUrineGlucose(null);
    setPrescriptions('');
    setConcernFlagged(false); setReferredToDoctor(false);
    setNextApptDate(null); setShowNextApptPicker(false);
    setNotes('');
    setPcv(null); setMalariaTest(null);
    setShowBookingTests(false);
    setBloodGroup(null); setHivStatus(null); setHbsAg(null); setVdrl(null); setGenotype(null);
    setMode('form');
  };

  const openEditForm = (v: ANCVisit) => {
    setEditingId(v.id);
    setVisitDate(v.date);
    setShowDatePicker(false);
    setGestationalWeek(v.gestationalWeek);
    setWeight(v.weight); setBpSys(v.bloodPressureSys); setBpDia(v.bloodPressureDia);
    setFundalHeight(v.fundalHeight); setBabyHR(v.babyHeartRate);
    setUrineProtein(v.urineProtein); setUrineGlucose(v.urineGlucose);
    setPrescriptions(v.prescriptions);
    setConcernFlagged(v.concernFlagged); setReferredToDoctor(v.referredToDoctor);
    setNextApptDate(v.nextAppointmentDate); setShowNextApptPicker(false);
    setNotes(v.notes);
    setPcv(v.pcv ?? null); setMalariaTest(v.malariaTest ?? null);
    const hasBooking = !!(v.bloodGroup || v.hivStatus || v.hbsAg || v.vdrl || v.genotype);
    setShowBookingTests(hasBooking);
    setBloodGroup(v.bloodGroup ?? null); setHivStatus(v.hivStatus ?? null);
    setHbsAg(v.hbsAg ?? null); setVdrl(v.vdrl ?? null); setGenotype(v.genotype ?? null);
    setMode('form');
  };

  const handleDateSelect = (key: string) => {
    setVisitDate(key);
    setGestationalWeek(computeWeekForDate(key));
    setShowDatePicker(false);
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const saveForm = async () => {
    setSaving(true);
    const visit: ANCVisit = {
      id: editingId ?? genId(),
      date: visitDate,
      gestationalWeek,
      weight,
      bloodPressureSys: bpSys,
      bloodPressureDia: bpDia,
      fundalHeight,
      babyHeartRate: babyHR,
      urineProtein,
      urineGlucose,
      pcv,
      malariaTest,
      bloodGroup,
      hivStatus,
      hbsAg,
      vdrl,
      genotype,
      classTopics: [],
      prescriptions: prescriptions.trim(),
      concernFlagged,
      referredToDoctor: concernFlagged ? referredToDoctor : false,
      nextAppointmentDate: nextApptDate,
      notes: notes.trim(),
      addedAt: editingId
        ? (visits.find(v => v.id === editingId)?.addedAt ?? new Date().toISOString())
        : new Date().toISOString(),
    };
    saveVisit(visit);

    // Auto-complete the antenatal attendance routine item for new visits (not edits)
    if (editingId === null) completeItem('antenatal-attendance');

    // Sync nextAppointmentDate to user profile so HomeScreen nudge works
    // lastVisitDate is intentionally NOT set here — VisitPrepScreen derives it from ancVisits directly
    // For new visits (not edits), also clear the Visit Prep question list so it resets for the next appointment
    if (nextApptDate && nextApptDate !== user?.nextAppointmentDate) {
      updateUser({ nextAppointmentDate: nextApptDate, ...(editingId === null ? { visitPrepQuestions: undefined } : {}) });
    } else if (editingId === null) {
      updateUser({ visitPrepQuestions: undefined });
    }

    setSaving(false);
    setMode('list');
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete visit?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVisit(id) },
    ]);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
        <View style={styles.loadingWrap}>
          <Text style={[styles.loadingText, { color: theme.text.tertiary }]}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── FORM MODE ──────────────────────────────────────────────────────────────
  if (mode === 'form') {
    const markedDates: Record<string, any> = {
      [visitDate]: { selected: true, selectedColor: theme.interactive.primary },
    };
    const markedNextAppt: Record<string, any> = nextApptDate
      ? { [nextApptDate]: { selected: true, selectedColor: theme.interactive.primary } }
      : {};

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
          <TouchableOpacity
            onPress={() => setMode('list')}
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
          >
            <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
            <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text.brand }]}>
            {editingId ? 'Edit visit' : 'Log a visit'}
          </Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Visit date */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Visit date</SectionHeader>
            <TouchableOpacity
              onPress={() => setShowDatePicker(v => !v)}
              activeOpacity={0.7}
              style={[styles.dateTouchable, { borderColor: theme.border.default, backgroundColor: theme.bg.app }]}
            >
              <CalendarCheck size={16} color={theme.interactive.primary} strokeWidth={2} />
              <Text style={[styles.dateTouchableText, { color: theme.text.primary }]}>
                {formatDisplayDate(visitDate)}
              </Text>
              {showDatePicker
                ? <ChevronUp size={14} color={theme.text.tertiary} strokeWidth={2} />
                : <ChevronDown size={14} color={theme.text.tertiary} strokeWidth={2} />
              }
            </TouchableOpacity>
            {showDatePicker && (
              <Calendar
                current={visitDate}
                maxDate={todayKey}
                onDayPress={(d: any) => handleDateSelect(d.dateString)}
                markedDates={markedDates}
                theme={{
                  backgroundColor: 'transparent', calendarBackground: 'transparent',
                  textSectionTitleColor: theme.text.tertiary,
                  selectedDayBackgroundColor: theme.interactive.primary,
                  selectedDayTextColor: '#fff',
                  todayTextColor: theme.text.brand,
                  dayTextColor: theme.text.primary,
                  textDisabledColor: theme.border.default,
                  monthTextColor: theme.text.primary,
                  arrowColor: theme.interactive.primary,
                  textMonthFontFamily: 'Manrope_700Bold',
                  textDayFontFamily: 'Manrope_500Medium',
                  textDayHeaderFontFamily: 'Manrope_600SemiBold',
                }}
              />
            )}
          </View>

          {/* Gestational week */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Gestational week at visit</SectionHeader>
            <Stepper
              value={gestationalWeek}
              label="Week of pregnancy"
              onDecrement={() => setGestationalWeek(p => Math.max(4, (p ?? 20) - 1))}
              onIncrement={() => setGestationalWeek(p => Math.min(42, (p ?? 20) + 1))}
              onChangeValue={v => setGestationalWeek(v !== null ? Math.max(4, Math.min(42, Math.round(v))) : null)}
            />
            {gestationalWeek === null && (
              <Text style={[styles.hint, { color: theme.text.tertiary }]}>
                {user?.dueDate ? 'Tap + to set' : 'Set your due date in Profile to auto-fill'}
              </Text>
            )}
          </View>

          {/* Measurements */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Measurements</SectionHeader>
            <View style={styles.measureGrid}>
              <Stepper
                value={weight}
                label="Weight (kg)"
                format={v => `${v} kg`}
                onDecrement={() => setWeight(p => p !== null ? Math.max(30, +(p - 0.5).toFixed(1)) : null)}
                onIncrement={() => setWeight(p => p !== null ? Math.min(150, +(p + 0.5).toFixed(1)) : 60)}
                onChangeValue={v => setWeight(v !== null ? Math.max(30, Math.min(150, +v.toFixed(1))) : null)}
              />
              <View style={[styles.measureDivider, { backgroundColor: theme.border.subtle }]} />

              {/* Blood pressure */}
              <View>
                <Text style={[shStyles.h, { color: theme.text.secondary, marginBottom: 8 }]}>Blood pressure (mmHg)</Text>
                <View style={styles.bpRow}>
                  <View style={styles.bpHalf}>
                    <Text style={[styles.bpLabel, { color: theme.text.tertiary }]}>Systolic</Text>
                    <View style={styles.bpControls}>
                      <TouchableOpacity
                        onPress={() => setBpSys(p => p !== null ? Math.max(60, p - 1) : null)}
                        activeOpacity={0.7}
                        style={[stepperStyles.btn, { borderColor: theme.border.default }]}
                      >
                        <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[stepperStyles.value, { color: bpSys !== null && bpSys >= 140 ? theme.accent.rose.text : theme.text.primary }]}
                        value={bpSysEditing ? bpSysDraft : (bpSys !== null ? String(bpSys) : '—')}
                        onFocus={() => { setBpSysEditing(true); setBpSysDraft(bpSys !== null ? String(bpSys) : ''); }}
                        onChangeText={setBpSysDraft}
                        onBlur={() => { setBpSysEditing(false); const p = parseInt(bpSysDraft, 10); setBpSys(!isNaN(p) ? Math.max(60, Math.min(200, p)) : null); }}
                        keyboardType="number-pad"
                        selectTextOnFocus
                        textAlign="center"
                      />
                      <TouchableOpacity
                        onPress={() => setBpSys(p => p !== null ? Math.min(200, p + 1) : 120)}
                        activeOpacity={0.7}
                        style={[stepperStyles.btn, { borderColor: theme.border.default }]}
                      >
                        <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.bpSlash, { color: theme.text.tertiary }]}>/</Text>
                  <View style={styles.bpHalf}>
                    <Text style={[styles.bpLabel, { color: theme.text.tertiary }]}>Diastolic</Text>
                    <View style={styles.bpControls}>
                      <TouchableOpacity
                        onPress={() => setBpDia(p => p !== null ? Math.max(40, p - 1) : null)}
                        activeOpacity={0.7}
                        style={[stepperStyles.btn, { borderColor: theme.border.default }]}
                      >
                        <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[stepperStyles.value, { color: bpDia !== null && bpDia >= 90 ? theme.accent.rose.text : theme.text.primary }]}
                        value={bpDiaEditing ? bpDiaDraft : (bpDia !== null ? String(bpDia) : '—')}
                        onFocus={() => { setBpDiaEditing(true); setBpDiaDraft(bpDia !== null ? String(bpDia) : ''); }}
                        onChangeText={setBpDiaDraft}
                        onBlur={() => { setBpDiaEditing(false); const p = parseInt(bpDiaDraft, 10); setBpDia(!isNaN(p) ? Math.max(40, Math.min(130, p)) : null); }}
                        keyboardType="number-pad"
                        selectTextOnFocus
                        textAlign="center"
                      />
                      <TouchableOpacity
                        onPress={() => setBpDia(p => p !== null ? Math.min(130, p + 1) : 80)}
                        activeOpacity={0.7}
                        style={[stepperStyles.btn, { borderColor: theme.border.default }]}
                      >
                        <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {bpSys !== null && bpSys >= 140 && (
                  <Text style={[styles.flagText, { color: theme.accent.rose.text }]}>
                    ⚠️ Systolic ≥140 — mention to your midwife or doctor.
                  </Text>
                )}
              </View>
              <View style={[styles.measureDivider, { backgroundColor: theme.border.subtle }]} />

              <Stepper
                value={fundalHeight}
                label="Fundal height (cm)"
                format={v => `${v} cm`}
                onDecrement={() => setFundalHeight(p => p !== null ? Math.max(0, p - 1) : null)}
                onIncrement={() => setFundalHeight(p => p !== null ? Math.min(50, p + 1) : (gestationalWeek ?? 20))}
                onChangeValue={v => setFundalHeight(v !== null ? Math.max(0, Math.min(50, Math.round(v))) : null)}
              />
              {fundalHeight !== null && gestationalWeek !== null && Math.abs(fundalHeight - gestationalWeek) > 3 && (
                <Text style={[styles.flagText, { color: theme.accent.gold.text }]}>
                  ℹ️ Fundal height differs from gestational week by more than 3 cm — discuss with your midwife.
                </Text>
              )}
              <View style={[styles.measureDivider, { backgroundColor: theme.border.subtle }]} />

              <Stepper
                value={babyHR}
                label="Baby heart rate (bpm)"
                format={v => `${v} bpm`}
                onDecrement={() => setBabyHR(p => p !== null ? Math.max(80, p - 5) : null)}
                onIncrement={() => setBabyHR(p => p !== null ? Math.min(200, p + 5) : 140)}
                onChangeValue={v => setBabyHR(v !== null ? Math.max(80, Math.min(200, Math.round(v))) : null)}
              />
              {babyHR !== null && (babyHR < 110 || babyHR > 160) && (
                <Text style={[styles.flagText, { color: theme.accent.rose.text }]}>
                  ⚠️ Normal fetal HR is 110–160 bpm — your midwife should be aware.
                </Text>
              )}
            </View>
          </View>

          {/* Urine results */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Urine results (if told)</SectionHeader>
            <View style={styles.urineRow}>
              <Text style={[styles.urineLabel, { color: theme.text.secondary }]}>Protein</Text>
              <View style={styles.urineOptions}>
                {URINE_OPTIONS.map(opt => {
                  const active = urineProtein === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setUrineProtein(active ? null : opt.value)}
                      activeOpacity={0.75}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={`Protein: ${opt.label}`}
                      style={[styles.urinePill, { borderColor: active ? theme.interactive.primary : theme.border.default, backgroundColor: active ? theme.interactive.primary : theme.bg.app }]}
                    >
                      <Text style={[styles.urinePillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{opt.emoji} {opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={[styles.urineRow, { marginTop: Spacing[2] }]}>
              <Text style={[styles.urineLabel, { color: theme.text.secondary }]}>Glucose</Text>
              <View style={styles.urineOptions}>
                {URINE_OPTIONS.map(opt => {
                  const active = urineGlucose === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setUrineGlucose(active ? null : opt.value)}
                      activeOpacity={0.75}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={`Glucose: ${opt.label}`}
                      style={[styles.urinePill, { borderColor: active ? theme.interactive.primary : theme.border.default, backgroundColor: active ? theme.interactive.primary : theme.bg.app }]}
                    >
                      <Text style={[styles.urinePillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{opt.emoji} {opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Blood & lab results */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Blood & lab results (if told)</SectionHeader>

            {/* PCV */}
            <Stepper
              value={pcv}
              label="PCV / Haematocrit (%)"
              format={v => `${v}%`}
              onDecrement={() => setPcv(p => p !== null ? Math.max(15, p - 1) : null)}
              onIncrement={() => setPcv(p => p !== null ? Math.min(55, p + 1) : 33)}
              onChangeValue={v => setPcv(v !== null ? Math.max(15, Math.min(55, Math.round(v))) : null)}
            />
            {pcv !== null && pcv < 30 && (
              <Text style={[styles.flagText, { color: theme.accent.rose.text }]}>
                ⚠️ PCV below 30% indicates anaemia — discuss with your midwife or doctor.
              </Text>
            )}

            <View style={[styles.measureDivider, { backgroundColor: theme.border.subtle, marginTop: Spacing[3] }]} />

            {/* Malaria */}
            <View style={[styles.urineRow, { marginTop: Spacing[3] }]}>
              <Text style={[styles.urineLabel, { color: theme.text.secondary }]}>Malaria</Text>
              <View style={styles.urineOptions}>
                {BINARY_OPTIONS.map(opt => {
                  const active = malariaTest === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setMalariaTest(active ? null : opt.value)}
                      activeOpacity={0.75}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={`Malaria: ${opt.label}`}
                      style={[styles.urinePill, {
                        borderColor: active ? (opt.value === 'positive' ? theme.accent.rose.text : theme.interactive.primary) : theme.border.default,
                        backgroundColor: active ? (opt.value === 'positive' ? theme.accent.rose.text : theme.interactive.primary) : theme.bg.app,
                      }]}
                    >
                      <Text style={[styles.urinePillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Booking tests — only on first visit or when editing a visit that already has booking data */}
          {(editingId !== null
            ? !!(visits.find(v => v.id === editingId)?.bloodGroup || visits.find(v => v.id === editingId)?.genotype || visits.find(v => v.id === editingId)?.hivStatus || visits.find(v => v.id === editingId)?.hbsAg || visits.find(v => v.id === editingId)?.vdrl)
            : visits.length === 0) && (
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <TouchableOpacity
              onPress={() => setShowBookingTests(v => !v)}
              activeOpacity={0.7}
              style={styles.bookingToggleRow}
            >
              <Text style={[styles.bookingToggleLabel, { color: theme.text.secondary }]}>BOOKING TESTS (FIRST VISIT)</Text>
              {showBookingTests
                ? <ChevronUp size={14} color={theme.text.tertiary} strokeWidth={2} />
                : <ChevronDown size={14} color={theme.text.tertiary} strokeWidth={2} />}
            </TouchableOpacity>

            {showBookingTests && (
              <View style={styles.bookingBody}>
                {/* Blood group */}
                <View style={styles.bookingField}>
                  <Text style={[styles.bookingFieldLabel, { color: theme.text.secondary }]}>Blood group</Text>
                  <View style={styles.pillGrid}>
                    {BLOOD_GROUPS.map(g => {
                      const active = bloodGroup === g;
                      return (
                        <TouchableOpacity
                          key={g}
                          onPress={() => setBloodGroup(active ? null : g)}
                          activeOpacity={0.75}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: active }}
                          accessibilityLabel={`Blood group: ${g}`}
                          style={[styles.optionPill, { borderColor: active ? theme.interactive.primary : theme.border.default, backgroundColor: active ? theme.interactive.primary : theme.bg.app }]}
                        >
                          <Text style={[styles.optionPillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{g}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Genotype */}
                <View style={styles.bookingField}>
                  <Text style={[styles.bookingFieldLabel, { color: theme.text.secondary }]}>Genotype</Text>
                  <View style={styles.pillGrid}>
                    {GENOTYPES.map(g => {
                      const active = genotype === g;
                      return (
                        <TouchableOpacity
                          key={g}
                          onPress={() => setGenotype(active ? null : g)}
                          activeOpacity={0.75}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: active }}
                          accessibilityLabel={`Genotype: ${g}`}
                          style={[styles.optionPill, { borderColor: active ? theme.interactive.primary : theme.border.default, backgroundColor: active ? theme.interactive.primary : theme.bg.app }]}
                        >
                          <Text style={[styles.optionPillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{g}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {genotype === 'SS' && (
                    <Text style={[styles.flagText, { color: theme.accent.rose.text }]}>
                      ⚠️ Sickle cell disease (SS) — ensure your care team is aware.
                    </Text>
                  )}
                </View>

                {/* HIV */}
                <View style={[styles.urineRow, styles.bookingField]}>
                  <Text style={[styles.urineLabel, { color: theme.text.secondary }]}>HIV</Text>
                  <View style={styles.urineOptions}>
                    {HIV_OPTIONS.map(opt => {
                      const active = hivStatus === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setHivStatus(active ? null : opt.value)}
                          activeOpacity={0.75}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: active }}
                          accessibilityLabel={`HIV: ${opt.label}`}
                          style={[styles.urinePill, { borderColor: active ? theme.interactive.primary : theme.border.default, backgroundColor: active ? theme.interactive.primary : theme.bg.app }]}
                        >
                          <Text style={[styles.urinePillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* HBsAg */}
                <View style={[styles.urineRow, styles.bookingField]}>
                  <Text style={[styles.urineLabel, { color: theme.text.secondary }]}>HBsAg</Text>
                  <View style={styles.urineOptions}>
                    {BINARY_OPTIONS.map(opt => {
                      const active = hbsAg === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setHbsAg(active ? null : opt.value)}
                          activeOpacity={0.75}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: active }}
                          accessibilityLabel={`HBsAg: ${opt.label}`}
                          style={[styles.urinePill, { borderColor: active ? theme.interactive.primary : theme.border.default, backgroundColor: active ? theme.interactive.primary : theme.bg.app }]}
                        >
                          <Text style={[styles.urinePillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* VDRL */}
                <View style={[styles.urineRow, styles.bookingField]}>
                  <Text style={[styles.urineLabel, { color: theme.text.secondary }]}>VDRL</Text>
                  <View style={styles.urineOptions}>
                    {BINARY_OPTIONS.map(opt => {
                      const active = vdrl === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setVdrl(active ? null : opt.value)}
                          activeOpacity={0.75}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: active }}
                          accessibilityLabel={`VDRL: ${opt.label}`}
                          style={[styles.urinePill, { borderColor: active ? theme.interactive.primary : theme.border.default, backgroundColor: active ? theme.interactive.primary : theme.bg.app }]}
                        >
                          <Text style={[styles.urinePillText, { color: active ? theme.interactive.primaryText : theme.text.secondary }]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
          )}

          {/* Prescriptions */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>New prescriptions or supplements given</SectionHeader>
            <TextInput
              style={[styles.textArea, { borderColor: theme.border.default, color: theme.text.primary }]}
              placeholder="e.g. Ferrous sulphate 200mg, Folic acid top-up…"
              placeholderTextColor={theme.text.tertiary}
              value={prescriptions}
              onChangeText={setPrescriptions}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Next appointment */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Next appointment booked for</SectionHeader>
            <TouchableOpacity
              onPress={() => setShowNextApptPicker(v => !v)}
              activeOpacity={0.7}
              style={[styles.dateTouchable, { borderColor: theme.border.default, backgroundColor: theme.bg.app }]}
            >
              <CalendarCheck size={16} color={theme.interactive.primary} strokeWidth={2} />
              <Text style={[styles.dateTouchableText, { color: nextApptDate ? theme.text.primary : theme.text.tertiary }]}>
                {nextApptDate ? formatDisplayDate(nextApptDate) : 'Tap to set next appointment'}
              </Text>
              {showNextApptPicker
                ? <ChevronUp size={14} color={theme.text.tertiary} strokeWidth={2} />
                : <ChevronDown size={14} color={theme.text.tertiary} strokeWidth={2} />
              }
            </TouchableOpacity>
            {showNextApptPicker && (
              <Calendar
                current={nextApptDate ?? todayKey}
                minDate={todayKey}
                onDayPress={(d: any) => { setNextApptDate(d.dateString); setShowNextApptPicker(false); }}
                markedDates={markedNextAppt}
                theme={{
                  backgroundColor: 'transparent', calendarBackground: 'transparent',
                  textSectionTitleColor: theme.text.tertiary,
                  selectedDayBackgroundColor: theme.interactive.primary,
                  selectedDayTextColor: '#fff',
                  todayTextColor: theme.text.brand,
                  dayTextColor: theme.text.primary,
                  textDisabledColor: theme.border.default,
                  monthTextColor: theme.text.primary,
                  arrowColor: theme.interactive.primary,
                  textMonthFontFamily: 'Manrope_700Bold',
                  textDayFontFamily: 'Manrope_500Medium',
                  textDayHeaderFontFamily: 'Manrope_600SemiBold',
                }}
              />
            )}
          </View>

          {/* Session notes + concern flags */}
          <View style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <SectionHeader>Session notes</SectionHeader>
            <TextInput
              style={[styles.textArea, { borderColor: theme.border.default, color: theme.text.primary, minHeight: 100 }]}
              placeholder="What was discussed? Topics covered, advice from the midwife, things to remember…"
              placeholderTextColor={theme.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
            <View style={[styles.measureDivider, { backgroundColor: theme.border.subtle, marginTop: Spacing[4] }]} />
            <TouchableOpacity
              onPress={() => { setConcernFlagged(v => !v); if (concernFlagged) setReferredToDoctor(false); }}
              activeOpacity={0.7}
              style={[styles.toggleRow, { marginTop: Spacing[3] }]}
            >
              {concernFlagged
                ? <CheckCircle size={18} color={theme.accent.rose.text} strokeWidth={2} />
                : <Circle size={18} color={theme.border.default} strokeWidth={2} />
              }
              <Text style={[styles.toggleLabel, { color: theme.text.secondary, fontSize: 13 }]}>
                Concern was flagged by midwife
              </Text>
            </TouchableOpacity>
            {concernFlagged && (
              <TouchableOpacity
                onPress={() => setReferredToDoctor(v => !v)}
                activeOpacity={0.7}
                style={[styles.toggleRow, { marginTop: Spacing[2], marginLeft: Spacing[5] }]}
              >
                {referredToDoctor
                  ? <CheckCircle size={18} color={theme.accent.rose.text} strokeWidth={2} />
                  : <Circle size={18} color={theme.border.default} strokeWidth={2} />
                }
                <Text style={[styles.toggleLabel, { color: theme.text.secondary, fontSize: 13 }]}>
                  Referred to see the doctor
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={saveForm}
            disabled={saving}
            activeOpacity={0.85}
            style={[styles.saveBtn, { backgroundColor: theme.interactive.primary }]}
          >
            <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save visit'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── LIST MODE ──────────────────────────────────────────────────────────────

  // Next appointment info
  const nextApptDays = nextAppointment ? daysUntil(nextAppointment) : null;
  const nextApptLabel = nextApptDays === null ? null
    : nextApptDays < 0  ? 'Past'
    : nextApptDays === 0 ? 'Today'
    : nextApptDays === 1 ? 'Tomorrow'
    : `In ${nextApptDays} days`;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
        >
          <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.brand }]}>ANC Visits</Text>
        <TouchableOpacity
          onPress={openNewForm}
          activeOpacity={0.7}
          style={[styles.addBtn, { backgroundColor: theme.interactive.primary }]}
        >
          <Plus size={16} color="#fff" strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Log visit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Setup count — shown once when null */}
        {setupCount === null && (
          <View style={[styles.setupCard, { backgroundColor: theme.accent.sky.bg, borderColor: theme.accent.sky.border }]}>
            <Text style={[styles.setupTitle, { color: theme.text.primary }]}>
              How many ANC visits before joining askneo?
            </Text>
            <Text style={[styles.setupBody, { color: theme.text.secondary }]}>
              This helps us show your total visit count accurately. You can always update it later.
            </Text>
            <View style={styles.setupRow}>
              <TouchableOpacity
                onPress={() => setSetupInput(p => Math.max(0, p - 1))}
                activeOpacity={0.7}
                style={[stepperStyles.btn, { borderColor: theme.accent.sky.border }]}
              >
                <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.setupCount, { color: theme.text.primary }]}>{setupInput}</Text>
              <TouchableOpacity
                onPress={() => setSetupInput(p => p + 1)}
                activeOpacity={0.7}
                style={[stepperStyles.btn, { borderColor: theme.accent.sky.border }]}
              >
                <Text style={[stepperStyles.btnText, { color: theme.text.primary }]}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => saveSetupCount(setupInput)}
                activeOpacity={0.85}
                style={[styles.setupSaveBtn, { backgroundColor: theme.interactive.primary }]}
              >
                <Text style={styles.setupSaveBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCell, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.summaryCellNum, { color: theme.text.brand }]}>{totalVisitCount}</Text>
            <Text style={[styles.summaryCellLabel, { color: theme.text.tertiary }]}>Total visits</Text>
          </View>
          <View style={[styles.summaryCell, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.summaryCellNum, { color: theme.text.brand }]}>{visits.length}</Text>
            <Text style={[styles.summaryCellLabel, { color: theme.text.tertiary }]}>Logged here</Text>
          </View>
          <View style={[styles.summaryCell, {
            backgroundColor: nextApptDays !== null && nextApptDays <= 3
              ? theme.accent.gold.bg : theme.bg.surface,
            borderColor: nextApptDays !== null && nextApptDays <= 3
              ? theme.accent.gold.border : theme.border.subtle,
          }]}>
            <Text style={[styles.summaryCellNum, {
              color: nextApptDays !== null && nextApptDays <= 3
                ? theme.accent.gold.text : theme.text.brand,
              fontSize: 15,
            }]}>
              {nextApptLabel ?? '—'}
            </Text>
            <Text style={[styles.summaryCellLabel, { color: theme.text.tertiary }]}>Next appt</Text>
          </View>
        </View>

        {/* Next appointment banner */}
        {nextAppointment && nextApptDays !== null && nextApptDays >= 0 && nextApptDays <= 7 && (
          <View style={[styles.apptBanner, { backgroundColor: theme.accent.gold.bg, borderColor: theme.accent.gold.border }]}>
            <AlertTriangle size={16} color={theme.accent.gold.text} strokeWidth={2} />
            <Text style={[styles.apptBannerText, { color: theme.text.primary }]}>
              Your next ANC visit is {nextApptLabel?.toLowerCase()} — {formatDisplayDate(nextAppointment)}
            </Text>
          </View>
        )}

        {/* Visits list */}
        {visits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🩺</Text>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No visits logged yet</Text>
            <Text style={[styles.emptyBody, { color: theme.text.tertiary }]}>
              Tap "Log visit" after your next antenatal session to start building your visit record.
            </Text>
            <TouchableOpacity
              onPress={openNewForm}
              activeOpacity={0.85}
              style={[styles.emptyBtn, { backgroundColor: theme.interactive.primary }]}
            >
              <Text style={styles.emptyBtnText}>Log your first visit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.listHeading, { color: theme.text.tertiary }]}>Visit history</Text>
            {visits.map(v => <VisitCard key={v.id} visit={v} onEdit={openEditForm} onDelete={confirmDelete} />)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── VisitCard ────────────────────────────────────────────────────────────────

function VisitCard({
  visit, onEdit, onDelete,
}: {
  visit: ANCVisit;
  onEdit: (v: ANCVisit) => void;
  onDelete: (id: string) => void;
}) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const bpStr = visit.bloodPressureSys !== null && visit.bloodPressureDia !== null
    ? `${visit.bloodPressureSys}/${visit.bloodPressureDia} mmHg`
    : null;
  const bpHigh = (visit.bloodPressureSys ?? 0) >= 140 || (visit.bloodPressureDia ?? 0) >= 90;

  return (
    <View style={[styles.visitCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
      {/* Card header */}
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.7}
        style={styles.visitCardHeader}
      >
        <View style={styles.visitCardLeft}>
          <View style={[styles.visitIconWrap, { backgroundColor: theme.accent.sky.bg }]}>
            <Stethoscope size={16} color={theme.accent.sky.text} strokeWidth={2} />
          </View>
          <View>
            <Text style={[styles.visitDate, { color: theme.text.primary }]}>
              {formatDisplayDate(visit.date)}
            </Text>
            <Text style={[styles.visitMeta, { color: theme.text.tertiary }]}>
              {[
                visit.gestationalWeek ? `Week ${visit.gestationalWeek}` : null,
                bpStr,
                visit.fundalHeight ? `${visit.fundalHeight} cm` : null,
              ].filter(Boolean).join(' · ') || 'Tap to view details'}
            </Text>
          </View>
        </View>
        <View style={styles.visitCardRight}>
          {visit.concernFlagged && (
            <AlertTriangle size={14} color={theme.accent.rose.text} strokeWidth={2} />
          )}
          {expanded
            ? <ChevronUp size={16} color={theme.text.tertiary} strokeWidth={2} />
            : <ChevronDown size={16} color={theme.text.tertiary} strokeWidth={2} />
          }
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.visitDetail, { borderTopColor: theme.border.subtle }]}>
          {/* Measurements */}
          {(visit.weight || bpStr || visit.fundalHeight || visit.babyHeartRate) && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Measurements</Text>
              <View style={styles.detailGrid}>
                {visit.weight !== null && <DetailPill label="Weight" value={`${visit.weight} kg`} />}
                {bpStr && <DetailPill label="BP" value={bpStr} alert={bpHigh} />}
                {visit.fundalHeight !== null && <DetailPill label="Fundal ht." value={`${visit.fundalHeight} cm`} />}
                {visit.babyHeartRate !== null && <DetailPill label="Baby HR" value={`${visit.babyHeartRate} bpm`} />}
              </View>
            </View>
          )}

          {/* Lab */}
          {(visit.urineProtein || visit.urineGlucose) && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Urine</Text>
              <Text style={[styles.detailValue, { color: theme.text.secondary }]}>
                {[
                  visit.urineProtein ? `Protein: ${visit.urineProtein}` : null,
                  visit.urineGlucose ? `Glucose: ${visit.urineGlucose}` : null,
                ].filter(Boolean).join(' · ')}
              </Text>
            </View>
          )}

          {/* Blood & lab */}
          {(visit.pcv != null || visit.malariaTest) && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Blood & lab</Text>
              <View style={styles.detailGrid}>
                {visit.pcv != null && (
                  <DetailPill label="PCV" value={`${visit.pcv}%`} alert={visit.pcv < 30} />
                )}
                {visit.malariaTest && (
                  <DetailPill label="Malaria" value={visit.malariaTest} alert={visit.malariaTest === 'positive'} />
                )}
              </View>
            </View>
          )}

          {/* Booking tests */}
          {(visit.bloodGroup || visit.genotype || visit.hivStatus || visit.hbsAg || visit.vdrl) && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Booking tests</Text>
              <View style={styles.detailGrid}>
                {visit.bloodGroup && <DetailPill label="Blood group" value={visit.bloodGroup} />}
                {visit.genotype && <DetailPill label="Genotype" value={visit.genotype} alert={visit.genotype === 'SS'} />}
                {visit.hivStatus && <DetailPill label="HIV" value={visit.hivStatus} alert={visit.hivStatus === 'reactive'} />}
                {visit.hbsAg && <DetailPill label="HBsAg" value={visit.hbsAg} alert={visit.hbsAg === 'positive'} />}
                {visit.vdrl && <DetailPill label="VDRL" value={visit.vdrl} alert={visit.vdrl === 'positive'} />}
              </View>
            </View>
          )}

          {/* Class topics */}
          {visit.classTopics.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Class topics</Text>
              <View style={styles.topicChips}>
                {visit.classTopics.map(t => (
                  <View key={t} style={[styles.topicChip, { backgroundColor: theme.accent.sage.bg }]}>
                    <Text style={[styles.topicChipText, { color: theme.accent.sage.text }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Prescriptions */}
          {!!visit.prescriptions && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Prescriptions</Text>
              <Text style={[styles.detailValue, { color: theme.text.secondary }]}>{visit.prescriptions}</Text>
            </View>
          )}

          {/* Concerns */}
          {visit.concernFlagged && (
            <View style={[styles.concernBadge, { backgroundColor: theme.accent.rose.bg, borderColor: theme.accent.rose.border }]}>
              <AlertTriangle size={13} color={theme.accent.rose.text} strokeWidth={2} />
              <Text style={[styles.concernText, { color: theme.accent.rose.text }]}>
                {visit.referredToDoctor ? 'Concern flagged · Referred to doctor' : 'Concern flagged by midwife'}
              </Text>
            </View>
          )}

          {/* Next appt */}
          {visit.nextAppointmentDate && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Next appointment</Text>
              <Text style={[styles.detailValue, { color: theme.text.secondary }]}>
                {formatDisplayDate(visit.nextAppointmentDate)}
              </Text>
            </View>
          )}

          {/* Notes */}
          {!!visit.notes && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Notes</Text>
              <Text style={[styles.detailValue, { color: theme.text.secondary, fontStyle: 'italic' }]}>
                {visit.notes}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => onEdit(visit)}
              activeOpacity={0.7}
              style={[styles.cardActionBtn, { borderColor: theme.border.default }]}
            >
              <Text style={[styles.cardActionText, { color: theme.text.brand }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(visit.id)}
              activeOpacity={0.7}
              style={[styles.cardActionBtn, { borderColor: theme.border.default }]}
            >
              <Trash2 size={14} color={theme.accent.rose.text} strokeWidth={2} />
              <Text style={[styles.cardActionText, { color: theme.accent.rose.text }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function DetailPill({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.detailPill, {
      backgroundColor: alert ? theme.accent.rose.bg : theme.bg.app,
      borderColor: alert ? theme.accent.rose.border : theme.border.subtle,
    }]}>
      <Text style={[styles.detailPillLabel, { color: theme.text.tertiary }]}>{label}</Text>
      <Text style={[styles.detailPillValue, { color: alert ? theme.accent.rose.text : theme.text.primary }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: 'Manrope_400Regular', fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[1],
    paddingVertical: Spacing[2], paddingHorizontal: Spacing[3],
    borderRadius: Radius.full, borderWidth: 1,
  },
  backLabel: { fontFamily: 'Manrope_500Medium', fontSize: 14 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: Spacing[2], paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
  },
  addBtnText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#fff' },

  // List scroll
  listScroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: 80,
    gap: Spacing[4],
  },

  // Setup card
  setupCard: {
    borderRadius: Radius.xl, borderWidth: 1, padding: Spacing[4], gap: Spacing[3],
  },
  setupTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15 },
  setupBody: { fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 20 },
  setupRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  setupCount: { fontFamily: 'Manrope_700Bold', fontSize: 20, minWidth: 32, textAlign: 'center' },
  setupSaveBtn: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[4], borderRadius: Radius.full },
  setupSaveBtnText: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#fff' },

  // Summary row
  summaryRow: { flexDirection: 'row', gap: Spacing[3] },
  summaryCell: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing[3],
    borderRadius: Radius.xl, borderWidth: 1,
  },
  summaryCellNum: { fontFamily: 'Manrope_700Bold', fontSize: 22 },
  summaryCellLabel: { fontFamily: 'Manrope_400Regular', fontSize: 11, marginTop: 2 },

  // Appointment banner
  apptBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    borderRadius: Radius.xl, borderWidth: 1, padding: Spacing[3],
  },
  apptBannerText: { fontFamily: 'Manrope_500Medium', fontSize: 13, flex: 1 },

  // List heading
  listHeading: {
    fontFamily: 'Manrope_600SemiBold', fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Visit card
  visitCard: {
    borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden',
  },
  visitCardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: Spacing[4],
  },
  visitCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], flex: 1 },
  visitCardRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  visitIconWrap: {
    width: 36, height: 36, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  visitDate: { fontFamily: 'Manrope_700Bold', fontSize: 14 },
  visitMeta: { fontFamily: 'Manrope_400Regular', fontSize: 12, marginTop: 1 },

  visitDetail: {
    borderTopWidth: 1, padding: Spacing[4], gap: Spacing[3],
  },
  detailSection: { gap: 4 },
  detailLabel: {
    fontFamily: 'Manrope_600SemiBold', fontSize: 10,
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  detailValue: { fontFamily: 'Manrope_500Medium', fontSize: 13, lineHeight: 19 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  detailPill: {
    paddingHorizontal: Spacing[3], paddingVertical: Spacing[2],
    borderRadius: Radius.lg, borderWidth: 1,
  },
  detailPillLabel: { fontFamily: 'Manrope_500Medium', fontSize: 10 },
  detailPillValue: { fontFamily: 'Manrope_700Bold', fontSize: 13 },

  topicChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[1] },
  topicChip: { paddingHorizontal: Spacing[2], paddingVertical: 3, borderRadius: Radius.full },
  topicChipText: { fontFamily: 'Manrope_500Medium', fontSize: 11 },

  concernBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing[3], paddingVertical: Spacing[2],
    borderRadius: Radius.lg, borderWidth: 1,
  },
  concernText: { fontFamily: 'Manrope_600SemiBold', fontSize: 12 },

  cardActions: {
    flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1],
  },
  cardActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: Spacing[2], paddingHorizontal: Spacing[3],
    borderRadius: Radius.full, borderWidth: 1,
  },
  cardActionText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: Spacing[8], gap: Spacing[3] },
  emptyEmoji: { fontSize: 48, lineHeight: 56 },
  emptyTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18 },
  emptyBody: {
    fontFamily: 'Manrope_400Regular', fontSize: 13, textAlign: 'center',
    lineHeight: 20, maxWidth: 260,
  },
  emptyBtn: {
    marginTop: Spacing[2], paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6], borderRadius: Radius.full,
  },
  emptyBtnText: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#fff' },

  // Form
  formScroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[16],
    gap: Spacing[4],
  },
  section: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing[4] },

  dateTouchable: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    paddingHorizontal: Spacing[3], paddingVertical: Spacing[3],
    borderRadius: Radius.lg, borderWidth: 1,
  },
  dateTouchableText: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 14 },

  hint: { fontFamily: 'Manrope_400Regular', fontSize: 12, marginTop: 4 },

  measureGrid: { gap: Spacing[4] },
  measureDivider: { height: 1 },

  bpRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  bpHalf: { flex: 1, gap: 4 },
  bpLabel: { fontFamily: 'Manrope_400Regular', fontSize: 11 },
  bpControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bpSlash: { fontFamily: 'Manrope_700Bold', fontSize: 24, alignSelf: 'flex-end', marginBottom: 4 },

  flagText: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 18, marginTop: 4 },

  urineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  urineLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, minWidth: 52 },
  urineOptions: { flex: 1, flexDirection: 'row', gap: Spacing[2] },
  urinePill: {
    flex: 1, paddingVertical: Spacing[2], paddingHorizontal: 4,
    borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center',
  },
  urinePillText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },

  textArea: {
    borderRadius: Radius.xl, borderWidth: 1,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    fontFamily: 'Manrope_400Regular', fontSize: 14, minHeight: 70,
  },

  // Booking tests section
  bookingToggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bookingToggleLabel: {
    fontFamily: 'Manrope_600SemiBold', fontSize: 12, letterSpacing: 0.4,
  },
  bookingBody: { gap: Spacing[4], marginTop: Spacing[4] },
  bookingField: { gap: Spacing[2] },
  bookingFieldLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },

  // Generic pill grid (blood group, genotype)
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  optionPill: {
    paddingVertical: Spacing[2], paddingHorizontal: Spacing[3],
    borderRadius: Radius.lg, borderWidth: 1,
  },
  optionPillText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  toggleLabel: { fontFamily: 'Manrope_500Medium', fontSize: 14, flex: 1 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[2], paddingVertical: Spacing[4], borderRadius: Radius.full,
    marginTop: Spacing[2],
  },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#fff' },
});
