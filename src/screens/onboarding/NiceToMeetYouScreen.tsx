import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing } from '../../theme';
import Button from '../../components/ui/Button';
import { UserStage } from '../../hooks/useAppContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      stage: UserStage;
      name: string;
      email: string;
      password: string;
      date: string;
      inviteCode: string;
      partnerStage?: string;
      partnerDueDate?: string;
      partnerBabyDOB?: string;
    };
  };
};

const STAGE_COPY: Record<UserStage, { emoji: string; message: string }> = {
  pregnancy: {
    emoji: '🤰',
    message: "We'll be with you every step of the way — from your next scan all the way to your birth day.",
  },
  newmom: {
    emoji: '👶',
    message: "Those early weeks are intense. We're here for the 2am questions and everything in between.",
  },
  ttc: {
    emoji: '🌱',
    message: "Your journey starts here. We'll help you understand your cycle and know when the time is right.",
  },
  partner: {
    emoji: '🤝',
    message: "Showing up matters more than you know. We'll help you understand exactly what your family needs.",
  },
};

export default function NiceToMeetYouScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { stage, name, email, password, date, inviteCode, partnerStage, partnerDueDate, partnerBabyDOB } = route.params;
  const { emoji, message } = STAGE_COPY[stage];

  const goNext = () =>
    navigation.navigate('EmergencyContacts', { stage, name, email, password, date, inviteCode, partnerStage, partnerDueDate, partnerBabyDOB });

  useEffect(() => {
    const t = setTimeout(goNext, 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.brand }]}>
      <View style={styles.container}>
        <View style={styles.body}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.greeting, { color: theme.text.inverse }]}>
            {'Nice to meet you,\n'}{name}!
          </Text>
          <Text style={[styles.message, { color: theme.text.inverse }]}>{message}</Text>
        </View>

        <Button label="Let's continue" onPress={goNext} variant="secondary" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing[8],
    paddingBottom: Spacing[8],
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[5],
  },
  emoji: { fontSize: 60 },
  greeting: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 32 * 1.2,
  },
  message: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    textAlign: 'center',
    lineHeight: Typography.size.base * 1.6,
    opacity: 0.85,
    paddingHorizontal: Spacing[2],
  },
});
