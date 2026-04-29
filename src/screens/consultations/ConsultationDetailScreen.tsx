import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import { useAppContext } from '../../hooks/useAppContext';
import { ConsultationSession } from '../../types/consultation';
import Icon from '../../components/icons/Icon';

const STORAGE_KEY = 'askneo_consultations';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m} min ${s} sec`;
}

export default function ConsultationDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const { theme } = useTheme();
  const { tasks, addTask, removeTask } = useAppContext();
  const { sessionId } = route.params;
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const load = async () => {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val) {
      const all: ConsultationSession[] = JSON.parse(val);
      setSession(all.find(s => s.id === sessionId) ?? null);
    }
  };

  useEffect(() => { load(); }, [sessionId]);

  const deleteSession = () => {
    Alert.alert(
      'Delete consultation',
      'This will permanently delete the recording and all extracted data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const val = await AsyncStorage.getItem(STORAGE_KEY);
            const all: ConsultationSession[] = val ? JSON.parse(val) : [];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter(s => s.id !== sessionId)));
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!session) return null;

  const ex = session.extractedData;

  const SectionHeader = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconBg, { backgroundColor: theme.bg.subtle }]}>{icon}</View>
      <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
        >
          <Icon name="left" size={20} color={theme.text.primary} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteSession} activeOpacity={0.7}>
          <Icon name="delete_2" size={18} color={theme.text.tertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title + meta */}
        <View style={styles.titleBlock}>
          <Text style={[styles.sessionTitle, { color: theme.text.primary }]}>{session.title}</Text>
          <Text style={[styles.sessionMeta, { color: theme.text.tertiary }]}>
            {formatDate(session.date)}
            {session.durationSeconds > 0 ? `  ·  ${formatDuration(session.durationSeconds)}` : ''}
          </Text>
        </View>

        {/* Summary */}
        {session.summary && (
          <View style={[styles.summaryCard, { backgroundColor: theme.accent.sky.bg, borderColor: theme.accent.sky.border }]}>
            <Text style={[styles.summaryLabel, { color: theme.accent.sky.text }]}>Summary</Text>
            <Text style={[styles.summaryText, { color: theme.text.primary }]}>{session.summary}</Text>
          </View>
        )}

        {/* Scan details */}
        {session.sessionType === 'scan' && (session.scanType || session.gestationalWeek || session.imagingFacility) && (
          <View style={styles.section}>
            <SectionHeader
              icon={<Icon name="scan" size={16} color={theme.text.brand} />}
              label="Scan details"
            />
            <View style={[styles.scanCard, { backgroundColor: theme.accent.gold.bg, borderColor: theme.accent.gold.border }]}>
              {session.scanType && (
                <View style={styles.scanRow}>
                  <Text style={[styles.scanRowLabel, { color: theme.accent.gold.text }]}>Scan type</Text>
                  <Text style={[styles.scanRowValue, { color: theme.text.primary }]}>{session.scanType}</Text>
                </View>
              )}
              {session.gestationalWeek !== undefined && (
                <View style={[styles.scanRow, session.scanType ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.accent.gold.border } : undefined]}>
                  <Text style={[styles.scanRowLabel, { color: theme.accent.gold.text }]}>Gestational week</Text>
                  <Text style={[styles.scanRowValue, { color: theme.text.primary }]}>{session.gestationalWeek} weeks</Text>
                </View>
              )}
              {session.imagingFacility && (
                <View style={[styles.scanRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.accent.gold.border }]}>
                  <Text style={[styles.scanRowLabel, { color: theme.accent.gold.text }]}>Facility</Text>
                  <Text style={[styles.scanRowValue, { color: theme.text.primary }]}>{session.imagingFacility}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action items */}
        {session.actionItems.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              icon={<Icon name="clipboard" size={16} color={theme.text.brand} />}
              label="Action items"
            />
            <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              {session.actionItems.map((item, i) => {
                const addedTask = tasks.find(t => t.text === item.text && !t.done && t.sourceSessionId === sessionId);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.actionRow,
                      { borderTopColor: theme.border.subtle },
                      i === 0 && { borderTopWidth: 0 },
                    ]}
                  >
                    <Text style={[styles.actionText, { color: theme.text.primary }]}>{item.text}</Text>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                      onPress={() => addedTask ? removeTask(addedTask.id) : addTask(item.text, sessionId)}
                    >
                      {addedTask
                        ? <Icon name="minus_circle" size={18} color={theme.interactive.primary} />
                        : <Icon name="add_circle" size={18} color={theme.border.default} />
                      }
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Next appointment */}
        {ex?.nextAppointment && (
          <View style={styles.section}>
            <SectionHeader
              icon={<Icon name="calendar" size={16} color={theme.text.brand} />}
              label="Next appointment"
            />
            <View style={[styles.appointmentCard, { backgroundColor: theme.accent.gold.bg, borderColor: theme.accent.gold.border }]}>
              <Icon name="calendar" size={20} color={theme.accent.gold.text} />
              <Text style={[styles.appointmentDate, { color: theme.accent.gold.text }]}>
                {formatShortDate(ex.nextAppointment)}
              </Text>
            </View>
          </View>
        )}

        {/* Medications */}
        {ex?.medications && ex.medications.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              icon={<Icon name="capsule" size={16} color={theme.text.brand} />}
              label="Medications prescribed"
            />
            <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              {ex.medications.map((med, i) => {
                const medsTask = tasks.find(t => t.text === 'Take your medications' && !t.done);
                return (
                  <View
                    key={i}
                    style={[
                      styles.medRow,
                      { borderTopColor: theme.border.subtle },
                      i === 0 && { borderTopWidth: 0 },
                    ]}
                  >
                    <View style={[styles.medDot, { backgroundColor: theme.accent.peach.bg }]}>
                      <Icon name="capsule" size={14} color={theme.accent.peach.text} />
                    </View>
                    <View style={styles.medInfo}>
                      <Text style={[styles.medName, { color: theme.text.primary }]}>
                        {med.name} <Text style={[styles.medDosage, { color: theme.text.secondary }]}>{med.dosage}</Text>
                      </Text>
                      <Text style={[styles.medFreq, { color: theme.text.tertiary }]}>{med.frequency}</Text>
                    </View>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                      onPress={() => medsTask ? removeTask(medsTask.id) : addTask('Take your medications', sessionId)}
                    >
                      {medsTask
                        ? <Icon name="minus_circle" size={18} color={theme.interactive.primary} />
                        : <Icon name="add_circle" size={18} color={theme.border.default} />
                      }
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Instructions */}
        {ex?.instructions && ex.instructions.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              icon={<Icon name="clipboard" size={16} color={theme.text.brand} />}
              label={
                session.sessionType === 'midwife' ? "Midwife's instructions" :
                session.sessionType === 'scan'    ? 'Notes from scan' :
                "Doctor's instructions"
              }
            />
            <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              {ex.instructions.map((inst, i) => (
                <View
                  key={i}
                  style={[
                    styles.instructionRow,
                    { borderTopColor: theme.border.subtle },
                    i === 0 && { borderTopWidth: 0 },
                  ]}
                >
                  <View style={[styles.bullet, { backgroundColor: theme.interactive.primary }]} />
                  <Text style={[styles.instructionText, { color: theme.text.secondary }]}>{inst}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Transcript (collapsible) */}
        {session.transcript && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowTranscript(v => !v)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBg, { backgroundColor: theme.bg.subtle }]}>
                  <Icon name="file" size={16} color={theme.text.brand} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Full transcript</Text>
              </View>
              {showTranscript
                ? <Icon name="up" size={16} color={theme.text.tertiary} />
                : <Icon name="down" size={16} color={theme.text.tertiary} />
              }
            </TouchableOpacity>
            {showTranscript && (
              <View style={[styles.transcriptCard, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
                <Text style={[styles.transcriptText, { color: theme.text.secondary }]}>{session.transcript}</Text>
              </View>
            )}
          </View>
        )}

        {/* Re-extract */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.reExtractBtn, { borderColor: theme.border.default }]}
          onPress={() => Alert.alert('Re-extract', 'This will re-process the recording. Available when backend is connected.')}
        >
          <Icon name="refresh_anticlockwise_1" size={16} color={theme.text.secondary} />
          <Text style={[styles.reExtractLabel, { color: theme.text.secondary }]}>Re-extract insights</Text>
        </TouchableOpacity>
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
  backLabel: { fontFamily: Typography.fontFamily.bodyMedium, fontSize: Typography.size.sm },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  titleBlock: { gap: Spacing[1] },
  sessionTitle: { fontFamily: Typography.fontFamily.bodyBold, fontSize: Typography.size['2xl'], letterSpacing: -0.3 },
  sessionMeta: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  summaryCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  summaryLabel: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryText: { fontFamily: Typography.fontFamily.bodyMedium, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.6 },
  section: { gap: Spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], justifyContent: 'space-between' },
  sectionIconBg: { width: 28, height: 28, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: Typography.fontFamily.bodyBold, fontSize: Typography.size.base, flex: 1 },
  card: { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionText: { fontFamily: Typography.fontFamily.bodyMedium, fontSize: Typography.size.sm, flex: 1, lineHeight: Typography.size.sm * 1.5 },
  actionTextDone: { textDecorationLine: 'line-through', opacity: 0.7 },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
  },
  appointmentDate: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.lg },
  scanCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  scanRowLabel: { fontFamily: Typography.fontFamily.bodyMedium, fontSize: Typography.size.sm },
  scanRowValue: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.sm },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  medDot: { width: 32, height: 32, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  medInfo: { flex: 1, gap: 2 },
  medName: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.base },
  medDosage: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.base },
  medFreq: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    padding: Spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  instructionText: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.6, flex: 1 },
  transcriptCard: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing[4] },
  transcriptText: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.7 },
  reExtractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
  },
  reExtractLabel: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.sm },
});
