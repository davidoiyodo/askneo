import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import { useAppContext } from '../../hooks/useAppContext';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function SignInScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { signIn } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSignIn = email.trim().includes('@') && password.length >= 6;

  const handleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const result = await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);
    if (result === 'ok') return; // navigation handled reactively by App.tsx
    if (result === 'not_found') setError('No account found with that email address.');
    if (result === 'wrong_password') setError('Incorrect password. Please try again.');
  };

  const inputStyle = (focused: boolean) => ({
    backgroundColor: theme.bg.surface,
    borderColor: focused ? theme.border.focus : theme.border.default,
    color: theme.text.primary,
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={[styles.back, { color: theme.text.link }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text.primary }]}>Welcome back.</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Sign in with your email and password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Email address</Text>
              <TextInput
                style={[styles.input, inputStyle(emailFocused)]}
                placeholder="you@example.com"
                placeholderTextColor={theme.text.tertiary}
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, inputStyle(passwordFocused)]}
                  placeholder="Your password"
                  placeholderTextColor={theme.text.tertiary}
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={[styles.eyeBtn, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.eyeText, { color: theme.text.secondary }]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#FFF0F0', borderColor: '#D64545' }]}>
                <Text style={[styles.errorText, { color: '#D64545' }]}>{error}</Text>
              </View>
            ) : null}
          </View>

          <Button
            label={isLoading ? 'Signing in…' : 'Sign in'}
            onPress={handleSignIn}
            disabled={!canSignIn || isLoading}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[10],
    gap: Spacing[8],
  },
  header: { gap: Spacing[3] },
  back: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
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
  form: { gap: Spacing[5] },
  field: { gap: Spacing[2] },
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
  passwordRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'center',
  },
  passwordInput: { flex: 1 },
  eyeBtn: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    height: 52,
    justifyContent: 'center',
  },
  eyeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing[4],
  },
  errorText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
});
