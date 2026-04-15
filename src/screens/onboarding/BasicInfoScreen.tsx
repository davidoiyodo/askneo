import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import { UserStage } from '../../hooks/useAppContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { stage: UserStage; date: string; inviteCode: string } };
};

export default function BasicInfoScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { stage, date, inviteCode } = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const canContinue =
    name.trim().length > 1 &&
    email.trim().includes('@') &&
    password.length >= 6 &&
    confirmPassword === password;

  const handleContinue = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError('');
    navigation.navigate('EmergencyContacts', {
      stage,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      date,
      inviteCode,
      password,
    });
  };

  const inputStyle = (focused: boolean, hasError = false) => ({
    backgroundColor: theme.bg.surface,
    borderColor: hasError ? '#D64545' : focused ? theme.border.focus : theme.border.default,
    color: theme.text.primary,
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.step, { color: theme.text.link }]}>Step 2 of 4</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Create your account.</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Your email and password will be used to sign back in.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Your first name</Text>
              <TextInput
                style={[styles.input, inputStyle(nameFocused)]}
                placeholder="e.g. Amara"
                placeholderTextColor={theme.text.tertiary}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Email address</Text>
              <TextInput
                style={[styles.input, inputStyle(emailFocused)]}
                placeholder="you@example.com"
                placeholderTextColor={theme.text.tertiary}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, inputStyle(passwordFocused, !!passwordError)]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.text.tertiary}
                  value={password}
                  onChangeText={t => { setPassword(t); if (passwordError) setPasswordError(''); }}
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

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Confirm password</Text>
              <TextInput
                style={[styles.input, inputStyle(confirmFocused, !!passwordError)]}
                placeholder="Re-enter your password"
                placeholderTextColor={theme.text.tertiary}
                value={confirmPassword}
                onChangeText={t => { setConfirmPassword(t); if (passwordError) setPasswordError(''); }}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {passwordError ? (
                <Text style={[styles.help, { color: '#D64545' }]}>{passwordError}</Text>
              ) : null}
            </View>
          </View>

          <Button label="Continue" onPress={handleContinue} disabled={!canContinue} fullWidth />
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
  help: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
  },
});
