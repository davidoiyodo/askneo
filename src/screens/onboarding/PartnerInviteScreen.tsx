import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import { useAppContext } from '../../hooks/useAppContext';
import { UserStage, EmergencyContact } from '../../hooks/useAppContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { stage: UserStage; name: string; email: string; date: string; inviteCode: string; password: string; emergencyContacts: EmergencyContact[] } };
};

export default function PartnerInviteScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { setUser } = useAppContext();
  const { stage, name, email, date, inviteCode, password, emergencyContacts } = route.params;
  const [partnerName, setPartnerName] = useState('');
  const [inviteStatus, setInviteStatus] = useState<null | 'invited' | 'active'>(null);

  const finish = () => {
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
      partnerName: partnerName.trim() || undefined,
      partnerStatus: inviteStatus || undefined,
      emergencyContacts,
      onboardingComplete: true,
    });
    navigation.replace('MainApp');
  };

  const shareInvite = async () => {
    const pName = partnerName.trim();
    try {
      await Share.share({
        message: `${name} has invited you to join their AskNeo care circle. Download AskNeo and use invite code: ${name.toUpperCase().slice(0, 4)}2025`,
      });
      setInviteStatus('invited');
    } catch {}
  };

  const markActive = () => setInviteStatus('active');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.step, { color: theme.text.link }]}>Step 4 of 4</Text>
          <Text style={[styles.title, { color: theme.text.primary }]}>Invite your partner</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Partners who are informed and involved make a real difference. Invite them to follow along and get guidance on how to support you.
          </Text>
        </View>

        {inviteStatus === null && (
          <View style={[styles.benefitsCard, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
            {[
              '🔔 They receive prompts on how to support you',
              '📋 Access to highlights you choose to share',
              '🛍️ Can contribute to your NeoStore wishlist',
              '🚨 Alerted in emergencies alongside your other contacts',
            ].map(b => (
              <Text key={b} style={[styles.benefit, { color: theme.text.primary }]}>{b}</Text>
            ))}
          </View>
        )}

        {inviteStatus === 'invited' && (
          <View style={[styles.statusCard, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
            <Text style={[styles.statusTitle, { color: theme.text.primary }]}>
              ⏳ Waiting for {partnerName.trim() || 'your partner'} to accept
            </Text>
            <Text style={[styles.statusDesc, { color: theme.text.secondary }]}>
              Once they download AskNeo and enter your invite code, you'll be connected.
            </Text>
            <View style={styles.statusActions}>
              <TouchableOpacity onPress={shareInvite} activeOpacity={0.7}>
                <Text style={[styles.resendLink, { color: theme.text.link }]}>Resend invite</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={markActive}
                style={[styles.markActiveBtn, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.markActiveText, { color: theme.text.primary }]}>Mark as connected</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {inviteStatus === 'active' && (
          <View style={[styles.statusCard, { backgroundColor: theme.bg.subtle, borderColor: theme.border.brand }]}>
            <Text style={[styles.statusTitle, { color: theme.text.primary }]}>
              ✅ Partner connected!
            </Text>
            <Text style={[styles.statusDesc, { color: theme.text.secondary }]}>
              {partnerName.trim() || 'Your partner'} is now part of your AskNeo care circle.
            </Text>
          </View>
        )}

        {inviteStatus === null && (
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Partner's name (optional)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border.default, color: theme.text.primary, backgroundColor: theme.bg.surface }]}
              placeholder="e.g. Emeka"
              placeholderTextColor={theme.text.tertiary}
              value={partnerName}
              onChangeText={setPartnerName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.actions}>
          {inviteStatus === null && (
            <Button label="Send invite link" onPress={shareInvite} variant="secondary" fullWidth />
          )}
          <Button label="Finish & enter AskNeo" onPress={finish} fullWidth />
          {inviteStatus === null && (
            <TouchableOpacity onPress={finish}>
              <Text style={[styles.skip, { color: theme.text.link }]}>Skip partner invite</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[10],
    gap: Spacing[6],
  },
  header: { gap: Spacing[2] },
  step: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
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
  benefitsCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  benefit: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
  },
  statusCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  statusTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  statusDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  statusActions: {
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  resendLink: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  markActiveBtn: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  markActiveText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  form: { gap: Spacing[2] },
  label: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 52,
  },
  actions: { gap: Spacing[3], alignItems: 'center' },
  skip: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
});
