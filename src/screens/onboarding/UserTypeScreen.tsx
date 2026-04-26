import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import Button from '../../components/ui/Button';
import DatePickerField from '../../components/ui/DatePickerField';
import OnboardingBackButton from '../../components/ui/OnboardingBackButton';
import { UserStage } from '../../hooks/useAppContext';

type Props = { navigation: NativeStackNavigationProp<any> };

const options: Array<{ stage: UserStage; label: string; emoji: string; description: string }> = [
  {
    stage: 'pregnancy',
    label: "I'm pregnant",
    emoji: '🤰',
    description: 'Guidance through every trimester, from the first scan to your birth plan.',
  },
  {
    stage: 'newmom',
    label: 'I have a newborn',
    emoji: '👶',
    description: 'Support for baby care, feeding, milestones, and those 2am moments of uncertainty.',
  },
  {
    stage: 'ttc',
    label: 'Trying to conceive',
    emoji: '🌱',
    description: 'Cycle tracking, fertile window support, and preparation for pregnancy.',
  },
  {
    stage: 'partner',
    label: "I'm a partner / dad",
    emoji: '🤝',
    description: 'Stay informed and learn how to show up for your partner and baby.',
  },
];

// Naegele's rule: EDD = LMP + 280 days
function lmpToEdd(lmpIso: string): Date {
  const lmp = new Date(lmpIso);
  return new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDateRange(stage: UserStage, pregnancyMode: 'lmp' | 'edd' = 'lmp'): { min: Date; max: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (stage) {
    case 'pregnancy': {
      if (pregnancyMode === 'edd') {
        // EDD must be in the future, max ~10 months (40 weeks) away
        const min = new Date(today);
        const max = new Date(today);
        max.setDate(max.getDate() + 300);
        return { min, max };
      } else {
        // LMP: at most 40 weeks ago (EDD = today), at most today
        const min = new Date(today);
        min.setDate(min.getDate() - 280);
        return { min, max: new Date(today) };
      }
    }
    case 'newmom': {
      // Baby's DOB must be in the past, at most 2 years ago
      const min = new Date(today);
      min.setFullYear(min.getFullYear() - 2);
      return { min, max: new Date(today) };
    }
    case 'ttc': {
      // Last period must be in the past, at most 6 months ago
      const min = new Date(today);
      min.setMonth(min.getMonth() - 6);
      return { min, max: new Date(today) };
    }
    default:
      return { min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) };
  }
}

function getDateConfig(stage: UserStage, pregnancyMode: 'lmp' | 'edd' = 'lmp'): { label: string; placeholder: string; help: string } {
  switch (stage) {
    case 'pregnancy':
      return pregnancyMode === 'lmp'
        ? {
            label: 'First day of your last period',
            placeholder: 'Select the date',
            help: "We'll use this to calculate your due date.",
          }
        : {
            label: 'Expected due date',
            placeholder: 'Select your due date',
            help: 'Must be within the next 10 months.',
          };
    case 'newmom':
      return {
        label: "Baby's date of birth",
        placeholder: "Select your baby's birthday",
        help: 'Must be a date in the past.',
      };
    case 'ttc':
      return {
        label: 'First day of last period',
        placeholder: 'Select the date',
        help: 'Must be within the last 6 months.',
      };
    default:
      return { label: '', placeholder: '', help: '' };
  }
}

export default function UserTypeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<UserStage | null>(null);
  const [date, setDate] = useState('');
  const [pregnancyMode, setPregnancyMode] = useState<'lmp' | 'edd'>('lmp');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteFocused, setInviteFocused] = useState(false);

  const handleSelect = (stage: UserStage) => {
    if (selected !== stage) {
      setDate('');
      setInviteCode('');
      setPregnancyMode('lmp');
    }
    setSelected(stage);
  };

  const handleTogglePregnancyMode = () => {
    setDate('');
    setPregnancyMode(m => m === 'lmp' ? 'edd' : 'lmp');
  };

  // For pregnancy + LMP mode: compute EDD before navigating
  const resolvedDate = (() => {
    if (selected === 'pregnancy' && pregnancyMode === 'lmp' && date) {
      return lmpToEdd(date).toISOString().slice(0, 10);
    }
    return date;
  })();

  const handleContinue = () => {
    if (!selected) return;
    navigation.navigate('BasicInfo', {
      stage: selected,
      date: resolvedDate,
      inviteCode: selected === 'partner' ? inviteCode.trim() : '',
    });
  };

  const isDateStage = selected === 'pregnancy' || selected === 'newmom' || selected === 'ttc';
  const dateRange = selected && isDateStage ? getDateRange(selected, pregnancyMode) : null;
  const dateConfig = selected && isDateStage ? getDateConfig(selected, pregnancyMode) : null;

  // EDD preview when LMP mode is active and a date is chosen
  const eddPreview = selected === 'pregnancy' && pregnancyMode === 'lmp' && date
    ? formatShortDate(lmpToEdd(date))
    : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <OnboardingBackButton onPress={() => navigation.goBack()} />

          <View style={styles.header}>
            <Text style={[styles.step, { color: theme.text.link }]}>Step 1 of 4</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Tell us where you are{'\n'}in your journey</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              This helps Neo give you the most relevant guidance.
            </Text>
          </View>

          <View style={styles.options}>
            {options.map(opt => {
              const isSelected = selected === opt.stage;
              return (
                <TouchableOpacity
                  key={opt.stage}
                  onPress={() => handleSelect(opt.stage)}
                  activeOpacity={0.8}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? theme.bg.subtle : theme.bg.surface,
                      borderColor: isSelected ? theme.border.brand : theme.border.default,
                    },
                    Shadow.sm,
                  ]}
                >
                  <Text style={styles.emoji}>{opt.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: theme.text.primary }]}>{opt.label}</Text>
                    <Text style={[styles.optionDesc, { color: theme.text.secondary }]}>{opt.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected ? theme.border.brand : theme.border.default,
                        backgroundColor: isSelected ? theme.interactive.primary : 'transparent',
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Contextual field — dates */}
          {isDateStage && dateConfig && dateRange && (
            <View style={[styles.contextBox, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <View style={styles.contextLabelRow}>
                <Text style={[styles.contextLabel, { color: theme.text.secondary }]}>{dateConfig.label}</Text>
                {selected === 'pregnancy' && (
                  <TouchableOpacity onPress={handleTogglePregnancyMode} activeOpacity={0.7}>
                    <Text style={[styles.modeToggle, { color: theme.text.link }]}>
                      {pregnancyMode === 'lmp' ? 'I know my due date' : 'Use last period instead'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <DatePickerField
                value={date}
                onChange={setDate}
                minDate={dateRange.min}
                maxDate={dateRange.max}
                placeholder={dateConfig.placeholder}
              />
              {eddPreview ? (
                <View style={[styles.eddPreview, { backgroundColor: theme.accent.rose.bg }]}>
                  <Text style={[styles.eddPreviewText, { color: theme.accent.rose.text }]}>
                    🗓 Estimated due date: {eddPreview}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.contextHelp, { color: theme.text.tertiary }]}>{dateConfig.help}</Text>
              )}
            </View>
          )}

          {/* Contextual field — partner invite code */}
          {selected === 'partner' && (
            <View style={[styles.contextBox, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <Text style={[styles.contextLabel, { color: theme.text.secondary }]}>Invite code (optional)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.bg.app,
                    borderColor: inviteFocused ? theme.border.focus : theme.border.default,
                    color: theme.text.primary,
                  },
                ]}
                placeholder="e.g. AMARA2025"
                placeholderTextColor={theme.text.tertiary}
                value={inviteCode}
                onChangeText={setInviteCode}
                onFocus={() => setInviteFocused(true)}
                onBlur={() => setInviteFocused(false)}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <Text style={[styles.contextHelp, { color: theme.text.tertiary }]}>
                Enter the code your partner shared. You can skip if you don't have one.
              </Text>
            </View>
          )}

          <Button
            label="Continue"
            onPress={handleContinue}
            disabled={!selected}
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
    paddingTop: Spacing[4],
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
    lineHeight: Typography.size['2xl'] * 1.2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
  },
  options: { gap: Spacing[3] },
  option: {
    borderRadius: Radius['2xl'],
    borderWidth: 1.5,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  emoji: { fontSize: 28 },
  optionText: { flex: 1, gap: 3 },
  optionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  optionDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 2,
  },
  contextBox: {
    borderWidth: 1,
    borderRadius: Radius['2xl'],
    padding: Spacing[4],
    gap: Spacing[2],
  },
  contextLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contextLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  modeToggle: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
    textDecorationLine: 'underline',
  },
  eddPreview: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
  },
  eddPreviewText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 52,
  },
  contextHelp: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
  },
});
