import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/Icon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import OnboardingBackButton from '../../components/ui/OnboardingBackButton';
import { UserStage } from '../../hooks/useAppContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { stage: UserStage; date: string; inviteCode: string; partnerStage?: string; partnerDueDate?: string; partnerBabyDOB?: string } };
};

const POINTS = [
  {
    icon: '🔐',
    text: 'Your health data is encrypted and stored securely. Only you can access it.',
  },
  {
    icon: '🚫',
    text: 'We will never sell or share your personal information with third parties.',
  },
  {
    icon: '✋',
    text: 'You can delete your account and all your data at any time from your profile.',
  },
];

export default function PrivacyPledgeScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { stage, date, inviteCode, partnerStage, partnerDueDate, partnerBabyDOB } = route.params;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <View style={styles.container}>
        <OnboardingBackButton onPress={() => navigation.goBack()} />

        <View style={styles.body}>
          <View style={[styles.iconWrap, { backgroundColor: theme.bg.subtle }]}>
            <Icon name="safety_certificate" size={40} color={theme.text.brand} />
          </View>

          <View style={styles.textBlock}>
            <Text style={[styles.headline, { color: theme.text.primary }]}>
              You're in control{'\n'}of your data
            </Text>
            <Text style={[styles.sub, { color: theme.text.secondary }]}>
              AskNeo is built around your health. Here's our promise to you before you share anything.
            </Text>
          </View>

          <View style={styles.points}>
            {POINTS.map((p, i) => (
              <View
                key={i}
                style={[styles.point, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
              >
                <Text style={styles.pointIcon}>{p.icon}</Text>
                <Text style={[styles.pointText, { color: theme.text.secondary }]}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          label="Got it — continue"
          onPress={() => navigation.navigate('BasicInfo', { stage, date, inviteCode, partnerStage, partnerDueDate, partnerBabyDOB })}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[6],
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing[3],
  },
  headline: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: Typography.size['2xl'] * 1.25,
  },
  sub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    textAlign: 'center',
    lineHeight: Typography.size.base * 1.55,
  },
  points: { width: '100%', gap: Spacing[3] },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
  },
  pointIcon: { fontSize: 20 },
  pointText: {
    flex: 1,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
});
