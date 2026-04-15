import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Plus, X, Calendar, Pill, ClipboardList, CheckSquare,
  AlertTriangle, FileText, ShoppingBag, CheckCircle, Activity,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useDailyLogs } from '../../hooks/useDailyLogs';
import { Typography, Spacing, Radius } from '../../theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ConsultationSession } from '../../types/consultation';
import { TriageLevel } from '../../data/responses';
import { DailyLog } from '../../types/symptomLog';

// ─── Types ────────────────────────────────────────────────────────────────────

type HealthEvent = {
  date: Date;
  level: TriageLevel;
  label: string;
  summary: string;
};

const TRIAGE_ICONS: Record<TriageLevel, string> = {
  monitor:   '🟢',
  watch:     '🟡',
  urgent:    '🟠',
  emergency: '🔴',
};

// ─── Things to bring (stage-aware) ───────────────────────────────────────────

const THINGS_TO_BRING: Record<string, string[]> = {
  pregnancy: [
    'HMO / insurance card',
    'Antenatal passport or card',
    'Any scan images or lab reports since last visit',
    "Blood pressure log (if you've been tracking)",
    'List of all current medications and supplements',
  ],
  newmom: [
    "Baby's health record booklet",
    "Baby's vaccination card",
    'Hospital discharge summary',
    'List of feeding or care concerns',
    'Your own medications list (if applicable)',
  ],
  ttc: [
    'Menstrual cycle log or app export',
    'Any fertility or hormonal test results',
    'List of medications and supplements',
    'Notes on any symptoms since last visit',
  ],
  partner: [
    "Your partner's antenatal card",
    'Any scan images or reports to review together',
    'HMO / insurance card',
    'List of concerns or questions',
  ],
};

const DEFAULT_THINGS = [
  'HMO / insurance card',
  'Any recent test results or scan images',
  'List of current medications',
  'List of symptoms or concerns to discuss',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function VisitPrepScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user, updateUser, markVisitComplete, tasks } = useAppContext();
  const { logs: logsMap } = useDailyLogs();

  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  // Convert map to sorted array for display
  const symptomLogs: DailyLog[] = Object.values(logsMap).sort(
    (a, b) => b.lastUpdated.localeCompare(a.lastUpdated),
  );

  useEffect(() => {
    // Load consultation sessions
    AsyncStorage.getItem('askneo_consultations').then(val => {
      if (val) setSessions(JSON.parse(val));
    });

    // Extract triage events from persisted chat history
    AsyncStorage.getItem('askneo_chat_history').then(val => {
      if (!val) return;
      type StoredMsg = {
        sender: string;
        timestamp: string;
        response?: { triage?: { level: string; label: string; summary: string } };
      };
      const stored = JSON.parse(val) as Record<string, StoredMsg[]>;
      const events: HealthEvent[] = [];
      for (const messages of Object.values(stored)) {
        for (const msg of messages) {
          const triage = msg.response?.triage;
          if (triage && triage.level !== 'monitor') {
            events.push({
              date: new Date(msg.timestamp),
              level: triage.level as TriageLevel,
              label: triage.label,
              summary: triage.summary,
            });
          }
        }
      }
      events.sort((a, b) => b.date.getTime() - a.date.getTime());
      setHealthEvents(events);
    });
  }, []);

  // Filter to period since last visit
  const lastVisitDate = user?.lastVisitDate ? new Date(user.lastVisitDate) : null;

  const periodSessions = lastVisitDate
    ? sessions.filter(s => new Date(s.date) > lastVisitDate)
    : sessions;

  const periodEvents = lastVisitDate
    ? healthEvents.filter(e => e.date > lastVisitDate)
    : healthEvents;

  // Derived data from sessions
  const allMeds = periodSessions.flatMap(s => s.extractedData?.medications ?? []);
  const uniqueMeds = allMeds.filter((m, i, arr) => arr.findIndex(x => x.name === m.name) === i);

  const allInstructions = [
    ...new Set(periodSessions.flatMap(s => s.extractedData?.instructions ?? [])),
  ].filter(Boolean);

  // Tasks — open and completed
  const openConsultTasks = tasks.filter(t => !t.done && t.sourceSessionId);
  const completedConsultTasks = tasks.filter(t => t.done && t.sourceSessionId);
  const openMedTask = tasks.find(t => !t.done && t.text === 'Take your medications');

  // User-curated questions
  const myQuestions: string[] = user?.visitPrepQuestions ?? [];

  const addMyQuestion = (text: string) => {
    const q = text.trim();
    if (!q || myQuestions.includes(q)) return;
    updateUser({ visitPrepQuestions: [...myQuestions, q] });
  };

  const removeMyQuestion = (index: number) => {
    updateUser({ visitPrepQuestions: myQuestions.filter((_, i) => i !== index) });
  };

  const handleMarkComplete = () => {
    Alert.alert(
      'Mark visit complete?',
      'This resets your visit summary window. Your tasks and consultation records are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark complete',
          onPress: () => { markVisitComplete(); navigation.goBack(); },
        },
      ],
    );
  };

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  const periodSymptomLogs = lastVisitDate
    ? symptomLogs.filter(l => new Date(l.lastUpdated) > lastVisitDate)
    : symptomLogs;

  const thingsToBring = THINGS_TO_BRING[user?.stage ?? ''] ?? DEFAULT_THINGS;
  const nextAppt = user?.nextAppointmentDate;
  const urgentCount = periodEvents.filter(e => e.level === 'urgent' || e.level === 'emergency').length;
  const hasAnything = periodSessions.length > 0 || periodEvents.length > 0 || periodSymptomLogs.length > 0;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
        >
          <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Visit Prep</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            {lastVisitDate
              ? `Since your last visit on ${formatDate(user!.lastVisitDate!)}`
              : 'A summary of your health conversations and consultations'}
          </Text>
        </View>

        {/* Chips */}
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: theme.accent.sage.bg }]}>
            <Calendar size={13} color={theme.accent.sage.text} strokeWidth={2} />
            <Text style={[styles.chipText, { color: theme.accent.sage.text }]}>
              {periodSessions.length} consultation{periodSessions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {periodEvents.length > 0 && (
            <View style={[styles.chip, { backgroundColor: urgentCount > 0 ? theme.accent.rose.bg : theme.accent.peach.bg }]}>
              <AlertTriangle size={13} color={urgentCount > 0 ? theme.accent.rose.text : theme.accent.peach.text} strokeWidth={2} />
              <Text style={[styles.chipText, { color: urgentCount > 0 ? theme.accent.rose.text : theme.accent.peach.text }]}>
                {periodEvents.length} concern{periodEvents.length !== 1 ? 's' : ''} flagged
              </Text>
            </View>
          )}
          {nextAppt && (
            <View style={[styles.chip, { backgroundColor: theme.accent.gold.bg }]}>
              <Calendar size={13} color={theme.accent.gold.text} strokeWidth={2} />
              <Text style={[styles.chipText, { color: theme.accent.gold.text }]}>
                Appt: {formatDate(nextAppt)}
              </Text>
            </View>
          )}
        </View>

        {/* Empty state */}
        {!hasAnything && (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>Nothing to show yet</Text>
            <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
              Chat with NEO about any symptoms or concerns, and record your doctor visits. Everything will be summarised here before your next appointment.
            </Text>
            <Button
              label="Record a consultation"
              onPress={() => navigation.navigate('RecordConsultation')}
              size="sm"
            />
          </Card>
        )}

        {/* ── Concerns from NEO chats ──────────────────── */}
        {periodEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={15} color={theme.text.brand} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Concerns raised with NEO</Text>
            </View>
            <Text style={[styles.sectionNote, { color: theme.text.secondary }]}>
              Symptoms and situations flagged during your chats — bring these up with your doctor.
            </Text>
            <Card padding="none">
              {periodEvents.map((event, i) => (
                <View
                  key={i}
                  style={[
                    styles.eventRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle },
                  ]}
                >
                  <Text style={styles.eventIcon}>{TRIAGE_ICONS[event.level]}</Text>
                  <View style={styles.eventContent}>
                    <Text style={[styles.eventLabel, { color: theme.text.primary }]}>{event.label}</Text>
                    <Text style={[styles.eventSummary, { color: theme.text.secondary }]} numberOfLines={2}>
                      {event.summary}
                    </Text>
                  </View>
                  <Text style={[styles.eventDate, { color: theme.text.tertiary }]}>
                    {formatDate(event.date)}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* ── Logged symptoms ──────────────────────────── */}
        {periodSymptomLogs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Activity size={15} color={theme.text.brand} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Daily check-ins</Text>
            </View>
            <Text style={[styles.sectionNote, { color: theme.text.secondary }]}>
              {periodSymptomLogs.length} check-in{periodSymptomLogs.length !== 1 ? 's' : ''} since your last visit
            </Text>
            <Card padding="none">
              {periodSymptomLogs.map((log, i) => {
                const SEV_COLORS = {
                  mild:     { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46' },
                  moderate: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
                  severe:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
                };
                const sev = log.symptomSeverity;
                const sevColors = sev ? SEV_COLORS[sev] : null;
                const MOOD_EMOJIS: Record<number, string> = { 1:'😞', 2:'😕', 3:'😐', 4:'🙂', 5:'😊' };
                const displayText = log.symptoms.length > 0
                  ? log.symptoms.join(', ')
                  : log.notes.slice(0, 60) || 'Check-in logged';
                return (
                  <View
                    key={log.dateKey}
                    style={[
                      styles.eventRow,
                      { borderTopColor: theme.border.subtle },
                      i === 0 && { borderTopWidth: 0 },
                    ]}
                  >
                    <View style={styles.eventLeft}>
                      <View style={styles.eventLabelRow}>
                        {log.mood && (
                          <Text style={{ fontSize: 13, lineHeight: 18 }}>{MOOD_EMOJIS[log.mood]}</Text>
                        )}
                        {sevColors && sev && (
                          <View style={[styles.sevBadge, { backgroundColor: sevColors.bg, borderColor: sevColors.border }]}>
                            <Text style={[styles.sevBadgeText, { color: sevColors.text }]}>
                              {sev.charAt(0).toUpperCase() + sev.slice(1)}
                            </Text>
                          </View>
                        )}
                        <Text style={[styles.eventLabel, { color: theme.text.primary, flex: 1 }]} numberOfLines={1}>
                          {displayText}
                        </Text>
                      </View>
                      {log.notes && log.symptoms.length > 0 ? (
                        <Text style={[styles.eventSummary, { color: theme.text.secondary }]} numberOfLines={2}>
                          {log.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.eventDate, { color: theme.text.tertiary }]}>
                      {formatDate(log.lastUpdated)}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </View>
        )}

        {/* ── Visit summaries ──────────────────────────── */}
        {periodSessions.filter(s => s.summary).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={15} color={theme.text.brand} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>What happened at your visits</Text>
            </View>
            {periodSessions.filter(s => s.summary).map(s => (
              <Card key={s.id} padding="sm" style={styles.summaryCard}>
                <Text style={[styles.summaryTitle, { color: theme.text.primary }]}>{s.title}</Text>
                <Text style={[styles.summaryDate, { color: theme.text.tertiary }]}>{formatDate(s.date)}</Text>
                <Text style={[styles.summaryBody, { color: theme.text.secondary }]}>{s.summary}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* ── Medications ──────────────────────────────── */}
        {uniqueMeds.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Pill size={15} color={theme.text.brand} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Medications prescribed</Text>
            </View>
            <Card padding="none">
              {uniqueMeds.map((med, i) => (
                <View
                  key={`${med.name}-${i}`}
                  style={[
                    styles.medRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: theme.interactive.primary }]} />
                  <View style={styles.medInfo}>
                    <Text style={[styles.medName, { color: theme.text.primary }]}>{med.name}</Text>
                    <Text style={[styles.medMeta, { color: theme.text.tertiary }]}>
                      {med.dosage} · {med.frequency}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* ── Doctor's instructions ────────────────────── */}
        {allInstructions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ClipboardList size={15} color={theme.text.brand} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>What your doctor told you</Text>
            </View>
            <Card padding="none">
              {allInstructions.map((instruction, i) => (
                <View
                  key={i}
                  style={[
                    styles.instructionRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: theme.accent.sage.text }]} />
                  <Text style={[styles.instructionText, { color: theme.text.primary }]}>{instruction}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* ── Action items ─────────────────────────────── */}
        {(openConsultTasks.length > 0 || openMedTask || completedConsultTasks.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckSquare size={15} color={theme.text.brand} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Action items</Text>
            </View>
            <Card padding="none">
              {openMedTask && (
                <View style={[styles.taskRow, { borderTopWidth: 0 }]}>
                  <View style={[styles.dot, { backgroundColor: theme.accent.rose.text }]} />
                  <Text style={[styles.taskText, { color: theme.text.primary }]}>{openMedTask.text}</Text>
                </View>
              )}
              {openConsultTasks.map((task, i) => (
                <View
                  key={task.id}
                  style={[
                    styles.taskRow,
                    { borderTopColor: theme.border.subtle },
                    i === 0 && !openMedTask && { borderTopWidth: 0 },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: theme.interactive.primary }]} />
                  <Text style={[styles.taskText, { color: theme.text.primary }]}>{task.text}</Text>
                </View>
              ))}
              {completedConsultTasks.slice(0, 3).map(task => (
                <View
                  key={task.id}
                  style={[styles.taskRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle }]}
                >
                  <CheckCircle size={13} color={theme.accent.sage.text} strokeWidth={2} />
                  <Text style={[styles.taskText, { color: theme.text.tertiary, textDecorationLine: 'line-through' }]}>
                    {task.text}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* ── Things to bring ──────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingBag size={15} color={theme.text.brand} strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Things to bring</Text>
          </View>
          <Card padding="none">
            {thingsToBring.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.bringRow,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: theme.accent.sky.text }]} />
                <Text style={[styles.bringText, { color: theme.text.primary }]}>{item}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* ── Questions for your doctor ────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ClipboardList size={15} color={theme.text.brand} strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Questions for your doctor</Text>
          </View>
          <Text style={[styles.sectionNote, { color: theme.text.secondary }]}>
            Use the concerns above as a starting point — add anything else you want to raise.
          </Text>

          {myQuestions.length > 0 && (
            <Card padding="none" style={{ marginBottom: Spacing[2] }}>
              {myQuestions.map((q, i) => (
                <View
                  key={i}
                  style={[
                    styles.questionRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border.subtle },
                  ]}
                >
                  <Text style={[styles.questionNum, { color: theme.text.brand }]}>{i + 1}.</Text>
                  <Text style={[styles.questionText, { color: theme.text.primary, flex: 1 }]}>{q}</Text>
                  <TouchableOpacity
                    onPress={() => removeMyQuestion(i)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color={theme.text.tertiary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          )}

          <View style={[styles.addRow, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}>
            <TextInput
              style={[styles.addInput, { color: theme.text.primary }]}
              placeholder="Add a question or note..."
              placeholderTextColor={theme.text.tertiary}
              value={newQuestion}
              onChangeText={setNewQuestion}
              onSubmitEditing={() => { addMyQuestion(newQuestion); setNewQuestion(''); }}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => { addMyQuestion(newQuestion); setNewQuestion(''); }}
              activeOpacity={0.7}
              style={[styles.addBtn, { backgroundColor: theme.interactive.primary }]}
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mark visit complete */}
        <View style={[styles.markSection, { borderTopColor: theme.border.subtle }]}>
          <Button label="Mark visit complete" onPress={handleMarkComplete} size="md" />
          <Text style={[styles.markNote, { color: theme.text.tertiary }]}>
            Resets this summary for your next appointment
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  header: { gap: Spacing[1] },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
  },
  chipText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  emptyCard: {
    gap: Spacing[3],
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    textAlign: 'center',
  },
  section: { gap: Spacing[2] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  sectionNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    marginTop: -Spacing[1],
  },
  // Health events
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  eventIcon: {
    fontSize: 16,
    lineHeight: 22,
  },
  eventContent: { flex: 1, gap: 2 },
  eventLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  eventSummary: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },
  eventDate: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    flexShrink: 0,
    marginTop: 2,
  },
  eventLeft: { flex: 1, gap: Spacing[1] },
  eventLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], flexWrap: 'wrap' },
  sevBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  sevBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: 10,
  },
  // Visit summaries
  summaryCard: { gap: Spacing[2] },
  summaryTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  summaryDate: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: -Spacing[1],
  },
  summaryBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  // Shared dot
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 5,
  },
  // Medications
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  medInfo: { flex: 1 },
  medName: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  medMeta: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  // Doctor's instructions
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  instructionText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    flex: 1,
  },
  // Tasks
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  taskText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  // Things to bring
  bringRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  bringText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
    flex: 1,
  },
  // Questions
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  questionNum: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    width: 18,
  },
  questionText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
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
  markSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing[5],
    gap: Spacing[2],
    alignItems: 'center',
  },
  markNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
});
