import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Mic, FileText, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import { ConsultationSession, SessionType } from '../../types/consultation';

const STORAGE_KEY = 'askneo_consultations';

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ConsultationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      AsyncStorage.getItem(STORAGE_KEY).then(val => {
        if (val) setSessions(JSON.parse(val));
      });
    });
    return unsubscribe;
  }, [navigation]);

  const StatusBadge = ({ status }: { status: ConsultationSession['status'] }) => {
    const map = {
      done:       { label: 'Done',       color: theme.accent.sage.text,  bg: theme.accent.sage.bg },
      processing: { label: 'Processing', color: theme.accent.gold.text,  bg: theme.accent.gold.bg },
      recording:  { label: 'Recording',  color: theme.accent.sky.text,   bg: theme.accent.sky.bg  },
      error:      { label: 'Error',      color: theme.accent.rose.text,  bg: theme.accent.rose.bg },
    };
    const s = map[status];
    return (
      <View style={[styles.badge, { backgroundColor: s.bg }]}>
        <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
      </View>
    );
  };

  const TypeBadge = ({ type }: { type?: SessionType }) => {
    const map: Record<SessionType, { label: string; color: string; bg: string }> = {
      doctor:  { label: '🩺 Doctor',  color: theme.accent.sky.text,   bg: theme.accent.sky.bg  },
      midwife: { label: '👩‍⚕️ Midwife', color: theme.accent.rose.text,  bg: theme.accent.rose.bg },
      scan:    { label: '🔬 Scan',    color: theme.accent.gold.text,  bg: theme.accent.gold.bg },
    };
    const t = map[type ?? 'doctor'];
    return (
      <View style={[styles.badge, { backgroundColor: t.bg }]}>
        <Text style={[styles.badgeText, { color: t.color }]}>{t.label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
        >
          <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Consultations</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RecordConsultation')}
          activeOpacity={0.8}
          style={[styles.newBtn, { backgroundColor: theme.interactive.primary }]}
        >
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.bg.subtle }]}>
              <Mic size={32} color={theme.text.tertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              No consultations recorded yet
            </Text>
            <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
              Record your doctor appointments and let AskNeo extract the key information — medications, follow-up dates, and instructions — so nothing gets missed.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RecordConsultation')}
              activeOpacity={0.85}
              style={[styles.emptyBtn, { backgroundColor: theme.interactive.primary }]}
            >
              <Mic size={16} color="#fff" strokeWidth={2} />
              <Text style={styles.emptyBtnLabel}>Record a consultation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {[...sessions].reverse().map(s => (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ConsultationDetail', { sessionId: s.id })}
                style={[styles.sessionCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle, ...Shadow.sm }]}
              >
                <View style={[styles.sessionIconBg, { backgroundColor: theme.bg.subtle }]}>
                  {s.status === 'done'
                    ? <FileText size={20} color={theme.text.brand} strokeWidth={1.75} />
                    : s.status === 'error'
                      ? <AlertCircle size={20} color={theme.accent.rose.text} strokeWidth={1.75} />
                      : <Mic size={20} color={theme.accent.gold.text} strokeWidth={1.75} />
                  }
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionTitle, { color: theme.text.primary }]} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <Text style={[styles.sessionDate, { color: theme.text.tertiary }]}>{formatDate(s.date)}</Text>
                    {s.durationSeconds > 0 && (
                      <>
                        <Text style={[styles.metaDot, { color: theme.text.tertiary }]}>·</Text>
                        <Clock size={12} color={theme.text.tertiary} strokeWidth={2} />
                        <Text style={[styles.sessionDate, { color: theme.text.tertiary }]}>{formatDuration(s.durationSeconds)}</Text>
                      </>
                    )}
                  </View>
                  {s.status === 'done' && s.actionItems.length > 0 && (
                    <View style={styles.actionItemsRow}>
                      <CheckCircle2 size={12} color={theme.accent.sage.text} strokeWidth={2} />
                      <Text style={[styles.actionItemsLabel, { color: theme.accent.sage.text }]}>
                        {s.actionItems.filter(a => a.done).length}/{s.actionItems.length} action items done
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.badgeStack}>
                  <TypeBadge type={s.sessionType} />
                  <StatusBadge status={s.status} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  backLabel: { fontFamily: Typography.fontFamily.bodyMedium, fontSize: Typography.size.sm },
  headerTitle: { fontFamily: Typography.fontFamily.bodyBold, fontSize: Typography.size.base },
  newBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[12],
  },
  emptyState: { alignItems: 'center', gap: Spacing[4], paddingTop: Spacing[10] },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontFamily: Typography.fontFamily.bodyBold, fontSize: Typography.size.lg, textAlign: 'center' },
  emptyBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.6,
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderRadius: Radius.full,
    marginTop: Spacing[2],
  },
  emptyBtnLabel: { fontFamily: Typography.fontFamily.bodyBold, fontSize: Typography.size.sm, color: '#fff' },
  list: { gap: Spacing[3] },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  sessionIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sessionInfo: { flex: 1, gap: 3 },
  sessionTitle: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.base },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionDate: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.xs },
  metaDot: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.xs },
  actionItemsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  actionItemsLabel: { fontFamily: Typography.fontFamily.bodyMedium, fontSize: Typography.size.xs },
  badgeStack: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  badge: { paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.xs },
});
