import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { TriageResult, TriageLevel, ChatTab } from '../../data/responses';
import { Typography, Spacing, Radius, Colors } from '../../theme';
import { useAppContext } from '../../hooks/useAppContext';
import { FacilitySpecialty, getFacilitiesBySpecialty } from '../../data/facilities';
import Icon from '../icons/Icon';

interface TriageCardProps {
  triage: TriageResult;
  tab?: ChatTab;
}

const TriageIcons: Record<string, string> = {
  monitor:   '🟢',
  watch:     '🟡',
  urgent:    '🟠',
  emergency: '🔴',
};

// ─── Care action helpers ──────────────────────────────────────────────────────

function callNumber(number: string, label: string) {
  const hasNumber = number.trim().length > 0;
  Alert.alert(
    `Call ${label}`,
    hasNumber ? `This will call ${number} now.` : 'Open your phone dialler to call your doctor, midwife, or clinic.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: hasNumber ? `Call ${number}` : 'Open dialler',
        style: 'destructive',
        onPress: () => Linking.openURL(`tel:${number}`),
      },
    ]
  );
}

function sendSOSToContacts(
  contacts: Array<{ name: string; phone: string }>,
  senderName: string
) {
  if (!contacts.length) {
    Alert.alert(
      'No emergency contacts',
      'Add emergency contacts in your Profile or on the Quick Help screen.',
      [{ text: 'OK' }]
    );
    return;
  }

  Alert.alert(
    'Alert Emergency Contacts',
    `This will send an urgent alert to: ${contacts.map(c => c.name).join(', ')}`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send Alert',
        style: 'destructive',
        onPress: () => {
          const contact = contacts[0];
          const phone = contact.phone.replace(/\s+/g, '');
          const message = encodeURIComponent(
            `URGENT from AskNeo\n\n${senderName} may need medical help. Please check on them immediately.\n\nThis alert was sent from the AskNeo app.`
          );
          Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`)
            .catch(() => Linking.openURL(`sms:${phone}?body=${message}`));
        },
      },
    ]
  );
}

// ─── Monitor tips ─────────────────────────────────────────────────────────────

const MONITOR_TIPS = [
  'Keep a written log of symptoms with times.',
  'Ensure your baby feeds regularly and produces wet nappies.',
  'Rest and stay well hydrated.',
  'Set a reminder to re-check in 2 hours.',
  'Call your doctor or midwife if anything worsens.',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TriageCard({ triage, tab }: TriageCardProps) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const navigation = useNavigation<any>();
  const colors = theme.triage[triage.level];
  const [tipsOpen, setTipsOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleFindNearest = async (specialty: FacilitySpecialty) => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location needed',
          'Allow location access so we can find the nearest care centre for you.',
          [{ text: 'OK' }],
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nearest = getFacilitiesBySpecialty(specialty, loc.coords.latitude, loc.coords.longitude)[0];
      if (!nearest) {
        Alert.alert('No facilities found', 'We could not find a care centre nearby.');
        return;
      }
      navigation.navigate('FacilityMap', {
        facilityId: nearest.id,
        userLat: loc.coords.latitude,
        userLng: loc.coords.longitude,
      });
    } catch {
      Alert.alert('Could not get location', 'Please check your location settings and try again.');
    } finally {
      setLocating(false);
    }
  };

  const isEmergency = triage.level === 'emergency';
  const isUrgent    = triage.level === 'urgent';
  const isWatch     = triage.level === 'watch';
  const isMonitor   = triage.level === 'monitor';

  const contacts    = user?.emergencyContacts ?? [];
  const userName    = user?.name ?? 'Someone';
  const doctorPhone = user?.doctorPhone ?? '';
  const doctorLabel = user?.doctorName ?? 'your doctor';

  const tabSpecialty: FacilitySpecialty = tab === 'baby' ? 'neonatal' : 'maternity';

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={[styles.indicator, { backgroundColor: colors.border }]} />
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>{TriageIcons[triage.level]}</Text>
          <Text style={[styles.label, { color: colors.text }]}>{triage.label}</Text>
        </View>

        {/* Summary */}
        <Text style={[styles.summary, { color: colors.text }]}>{triage.summary}</Text>

        {/* What to do box */}
        <View style={[styles.actionBox, { borderColor: colors.border }]}>
          <Text style={[styles.actionLabel, { color: colors.text }]}>What to do</Text>
          <Text style={[styles.action, { color: colors.text }]}>{triage.action}</Text>
        </View>

        {/* ── EMERGENCY actions ── */}
        {isEmergency && (
          <View style={styles.ctaGroup}>
            <TouchableOpacity
              onPress={() => callNumber('112', 'Emergency Services')}
              activeOpacity={0.85}
              style={[styles.ctaBtn, styles.ctaBtnPrimary, { backgroundColor: Colors.danger[500] }]}
            >
              <Icon name="alarm_1" size={16} color="#fff" />
              <Text style={styles.ctaLabel}>Call 112 — Emergency now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => sendSOSToContacts(contacts, userName)}
              activeOpacity={0.85}
              style={[styles.ctaBtn, styles.ctaBtnSecondary, { borderColor: colors.border }]}
            >
              <Icon name="warning" size={15} color={colors.text} />
              <Text style={[styles.ctaLabelSecondary, { color: colors.text }]}>
                {contacts.length
                  ? `Alert ${contacts.length} emergency contact${contacts.length > 1 ? 's' : ''}`
                  : 'Alert emergency contacts'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFindNearest(tabSpecialty)}
              activeOpacity={0.85}
              disabled={locating}
              style={[styles.ctaBtn, styles.ctaBtnSecondary, { borderColor: colors.border }]}
            >
              {locating
                ? <ActivityIndicator size="small" color={colors.text} />
                : <Icon name="map_pin" size={15} color={colors.text} />
              }
              <Text style={[styles.ctaLabelSecondary, { color: colors.text }]}>Find nearest A&E</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── URGENT actions ── */}
        {isUrgent && (
          <View style={styles.ctaGroup}>
            <TouchableOpacity
              onPress={() => handleFindNearest(tabSpecialty)}
              activeOpacity={0.85}
              disabled={locating}
              style={[styles.ctaBtn, styles.ctaBtnPrimary, { backgroundColor: colors.border }]}
            >
              {locating
                ? <ActivityIndicator size="small" color="#fff" />
                : <Icon name="map_pin" size={15} color="#fff" />
              }
              <Text style={styles.ctaLabel}>Find nearest hospital</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => callNumber(doctorPhone, doctorLabel)}
              activeOpacity={0.85}
              style={[styles.ctaBtn, styles.ctaBtnSecondary, { borderColor: colors.border }]}
            >
              <Icon name="phone" size={15} color={colors.text} />
              <Text style={[styles.ctaLabelSecondary, { color: colors.text }]}>
                {doctorPhone ? `Call ${doctorLabel}` : 'Call your doctor first'}
              </Text>
            </TouchableOpacity>

            {contacts.length > 0 && (
              <TouchableOpacity
                onPress={() => sendSOSToContacts(contacts, userName)}
                activeOpacity={0.85}
                style={[styles.ctaBtn, styles.ctaBtnSecondary, { borderColor: colors.border }]}
              >
                <Icon name="warning" size={15} color={colors.text} />
                <Text style={[styles.ctaLabelSecondary, { color: colors.text }]}>
                  Alert emergency contacts
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── WATCH actions ── */}
        {isWatch && (
          <View style={styles.ctaGroup}>
            <TouchableOpacity
              onPress={() => callNumber(doctorPhone, doctorLabel)}
              activeOpacity={0.85}
              style={[styles.ctaBtn, styles.ctaBtnPrimary, { backgroundColor: colors.border }]}
            >
              <Icon name="phone" size={15} color="#fff" />
              <Text style={styles.ctaLabel}>
                {doctorPhone ? `Call ${doctorLabel}` : 'Call your doctor'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFindNearest(tabSpecialty)}
              activeOpacity={0.85}
              disabled={locating}
              style={[styles.ctaBtn, styles.ctaBtnSecondary, { borderColor: colors.border }]}
            >
              {locating
                ? <ActivityIndicator size="small" color={colors.text} />
                : <Icon name="map_pin" size={15} color={colors.text} />
              }
              <Text style={[styles.ctaLabelSecondary, { color: colors.text }]}>Find nearest clinic</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MONITOR actions ── */}
        {isMonitor && (
          <TouchableOpacity
            onPress={() => setTipsOpen(v => !v)}
            activeOpacity={0.8}
            style={[styles.tipsToggle, { borderColor: colors.border }]}
          >
            <Icon name="time" size={14} color={colors.text} />
            <Text style={[styles.tipsToggleLabel, { color: colors.text }]}>Monitoring tips</Text>
            {tipsOpen
              ? <Icon name="up" size={14} color={colors.text} />
              : <Icon name="down" size={14} color={colors.text} />
            }
          </TouchableOpacity>
        )}

        {isMonitor && tipsOpen && (
          <View style={[styles.tipsList, { borderColor: colors.border }]}>
            {MONITOR_TIPS.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={[styles.tipBullet, { color: colors.text }]}>·</Text>
                <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: Spacing[2],
  },
  indicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summary: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  actionBox: {
    borderTopWidth: 1,
    paddingTop: Spacing[2],
    gap: 4,
    marginTop: Spacing[1],
  },
  actionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.7,
  },
  action: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  ctaGroup: {
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderRadius: Radius.lg,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  ctaBtnPrimary: {},
  ctaBtnSecondary: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  ctaLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  ctaLabelSecondary: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderTopWidth: 1,
    paddingTop: Spacing[2],
    marginTop: Spacing[1],
  },
  tipsToggleLabel: {
    flex: 1,
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  tipsList: {
    borderTopWidth: 1,
    paddingTop: Spacing[2],
    gap: Spacing[2],
  },
  tipRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.sm * 1.5,
  },
  tipText: {
    flex: 1,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
});
