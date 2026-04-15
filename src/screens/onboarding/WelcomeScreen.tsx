import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Colors } from '../../theme';
import Button from '../../components/ui/Button';

const { height } = Dimensions.get('window');
type Props = { navigation: NativeStackNavigationProp<any> };

export default function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={[styles.logo, { color: theme.text.brand }]}>AskNeo</Text>
          <View style={styles.textBlock}>
            <Text style={[styles.headline, { color: theme.text.primary }]}>
              You shouldn't have to{'\n'}figure this out alone.
            </Text>
            <Text style={[styles.body, { color: theme.text.secondary }]}>
              AskNeo helps you understand what's happening with your baby or pregnancy, decide what to do next, and know when to seek help — calmly, without the overwhelm.
            </Text>
          </View>
        </View>

        <View style={styles.pillsRow}>
          {['Care routing', 'Triage support', 'Anticipatory guidance'].map(p => (
            <View key={p} style={[styles.pill, { backgroundColor: theme.bg.subtle, borderColor: theme.border.brand }]}>
              <Text style={[styles.pillText, { color: theme.text.brand }]}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button label="Get started" onPress={() => navigation.navigate('UserType')} fullWidth />
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
            <Text style={[styles.signIn, { color: theme.text.secondary }]}>
              Already have an account?{' '}
              <Text style={{ color: theme.text.link }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
          <Text style={[styles.disclaimer, { color: theme.text.tertiary }]}>
            AskNeo provides care guidance and decision support. It does not replace professional medical advice.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: height * 0.08,
    paddingBottom: Spacing[8],
    justifyContent: 'space-between',
  },
  hero: {
    gap: Spacing[6],
  },
  logo: {
    fontFamily: Typography.fontFamily.display,
    fontSize: 36,
    letterSpacing: -0.5,
  },
  textBlock: {
    gap: Spacing[3],
  },
  headline: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['3xl'],
    lineHeight: Typography.size['3xl'] * 1.2,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    lineHeight: Typography.size.md * 1.6,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  pill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  actions: {
    gap: Spacing[4],
  },
  signIn: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
  disclaimer: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.6,
  },
});
