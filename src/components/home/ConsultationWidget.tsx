import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mic, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import { ConsultationSession } from '../../types/consultation';

const STORAGE_KEY = 'askneo_consultations';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface Props {
  navigation: any;
}

export default function ConsultationWidget({ navigation }: Props) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);

  useEffect(() => {
    const load = () => {
      AsyncStorage.getItem(STORAGE_KEY).then(val => {
        if (val) setSessions(JSON.parse(val));
        else setSessions([]);
      });
    };
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  const doneSessions = sessions.filter(s => s.status === 'done');
  const recent = [...sessions].reverse().find(s => s.status === 'done');
  const hasAny = sessions.length > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Consultations')}
      style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }, Shadow.sm]}
    >
      {/* Left icon */}
      <View style={[styles.iconBg, { backgroundColor: theme.accent.sky.bg }]}>
        <Mic size={20} color={theme.accent.sky.text} strokeWidth={1.75} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Consultations</Text>
        <Text style={[styles.subtitle, { color: theme.text.tertiary }]} numberOfLines={1}>
          {hasAny
            ? `${doneSessions.length} recorded${recent ? ` · Last: ${formatDate(recent.date)}` : ''}`
            : 'Capture meds, dates & instructions'}
        </Text>
      </View>

      {/* Record button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('RecordConsultation')}
        style={[styles.recordBtn, { backgroundColor: theme.interactive.primary }]}
      >
        <Plus size={14} color="#fff" strokeWidth={2.5} />
        <Text style={styles.recordBtnLabel}>Record</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  recordBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    color: '#fff',
  },
});
