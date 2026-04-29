import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Icon from '../../components/icons/Icon';
import Button from '../../components/ui/Button';
import DatePickerField from '../../components/ui/DatePickerField';
import OnboardingBackButton from '../../components/ui/OnboardingBackButton';
import { UserStage } from '../../hooks/useAppContext';
import { parseInviteCode } from '../../utils/inviteCode';

type Props = { navigation: NativeStackNavigationProp<any> };

type PartnerStageOption = 'pregnancy' | 'newmom' | 'ttc';

const options: Array<{ stage: UserStage; label: string; emoji: string; description: string }> = [
  { stage: 'pregnancy', label: "I'm pregnant",       emoji: '🤰', description: 'Trimester guidance, scans, and birth prep.' },
  { stage: 'newmom',    label: 'I have a newborn',   emoji: '👶', description: 'Baby care, feeding, and milestone support.' },
  { stage: 'ttc',       label: 'Trying to conceive', emoji: '🌱', description: 'Cycle tracking and fertile window support.' },
  { stage: 'partner',   label: 'Partner / dad',      emoji: '🤝', description: 'Stay informed and support your family.' },
];

const partnerStageOptions: Array<{ stage: PartnerStageOption; label: string; emoji: string }> = [
  { stage: 'pregnancy', label: 'She is pregnant',  emoji: '🤰' },
  { stage: 'newmom',    label: 'She has a newborn', emoji: '👶' },
  { stage: 'ttc',       label: 'Trying to conceive', emoji: '🌱' },
];

// Naegele's rule
function lmpToEdd(lmpIso: string): Date {
  const lmp = new Date(lmpIso);
  return new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDateRange(stage: UserStage | PartnerStageOption, pregnancyMode: 'lmp' | 'edd' = 'lmp'): { min: Date; max: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (stage) {
    case 'pregnancy': {
      if (pregnancyMode === 'edd') {
        const max = new Date(today);
        max.setDate(max.getDate() + 300);
        return { min: new Date(today), max };
      }
      const min = new Date(today);
      min.setDate(min.getDate() - 280);
      return { min, max: new Date(today) };
    }
    case 'newmom': {
      const min = new Date(today);
      min.setFullYear(min.getFullYear() - 2);
      return { min, max: new Date(today) };
    }
    case 'ttc': {
      const min = new Date(today);
      min.setMonth(min.getMonth() - 6);
      return { min, max: new Date(today) };
    }
    default:
      return { min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) };
  }
}

function getDateConfig(stage: UserStage | PartnerStageOption, pregnancyMode: 'lmp' | 'edd' = 'lmp', isPartnerContext = false): { label: string; placeholder: string; help: string } {
  const prefix = isPartnerContext ? "Partner's " : '';
  switch (stage) {
    case 'pregnancy':
      return pregnancyMode === 'lmp'
        ? { label: `${prefix}first day of last period`, placeholder: 'Select the date', help: "We'll use this to estimate the due date." }
        : { label: `${prefix}expected due date`, placeholder: 'Select due date', help: 'Must be within the next 10 months.' };
    case 'newmom':
      return { label: "Baby's date of birth", placeholder: "Select baby's birthday", help: 'Must be a date in the past.' };
    case 'ttc':
      return { label: `${prefix}first day of last period`, placeholder: 'Select the date', help: 'Must be within the last 6 months.' };
    default:
      return { label: '', placeholder: '', help: '' };
  }
}

export default function UserTypeScreen({ navigation }: Props) {
  const { theme } = useTheme();

  // Main selection
  const [selected, setSelected] = useState<UserStage | null>(null);
  const [date, setDate] = useState('');
  const [pregnancyMode, setPregnancyMode] = useState<'lmp' | 'edd'>('lmp');

  // Partner — invite code path
  const [inviteCode, setInviteCode] = useState('');
  const [inviteFocused, setInviteFocused] = useState(false);

  // Partner — manual entry fallback (when no valid code)
  const [partnerStageManual, setPartnerStageManual] = useState<PartnerStageOption | null>(null);
  const [partnerDateManual, setPartnerDateManual] = useState('');
  const [partnerPregnancyMode, setPartnerPregnancyMode] = useState<'lmp' | 'edd'>('lmp');

  const handleSelect = (stage: UserStage) => {
    if (selected !== stage) {
      setDate('');
      setInviteCode('');
      setPregnancyMode('lmp');
      setPartnerStageManual(null);
      setPartnerDateManual('');
      setPartnerPregnancyMode('lmp');
    }
    setSelected(stage);
  };

  const handleTogglePregnancyMode = () => {
    setDate('');
    setPregnancyMode(m => m === 'lmp' ? 'edd' : 'lmp');
  };

  // Decode invite code as user types
  const decoded = selected === 'partner' ? parseInviteCode(inviteCode) : null;
  const codeIsValid = decoded !== null;

  // Resolved date for non-partner LMP→EDD conversion
  const resolvedDate = (() => {
    if (selected === 'pregnancy' && pregnancyMode === 'lmp' && date) {
      return lmpToEdd(date).toISOString().slice(0, 10);
    }
    return date;
  })();

  // Resolved partner date for manual entry (LMP→EDD for pregnancy)
  const resolvedPartnerDate = (() => {
    if (partnerStageManual === 'pregnancy' && partnerPregnancyMode === 'lmp' && partnerDateManual) {
      return lmpToEdd(partnerDateManual).toISOString().slice(0, 10);
    }
    return partnerDateManual;
  })();

  const handleContinue = () => {
    if (!selected) return;

    if (selected === 'partner') {
      if (codeIsValid) {
        // Partner has a valid code — extract all context from it
        const partnerStage = decoded!.stage as PartnerStageOption;
        const partnerDate  = decoded!.date;
        navigation.navigate('PrivacyPledge', {
          stage: 'partner',
          date: '',
          inviteCode: inviteCode.trim(),
          partnerStage,
          partnerDueDate:  partnerStage !== 'newmom' ? partnerDate : undefined,
          partnerBabyDOB:  partnerStage === 'newmom' ? partnerDate : undefined,
        });
      } else {
        // No valid code — use manual stage/date if provided
        navigation.navigate('PrivacyPledge', {
          stage: 'partner',
          date: '',
          inviteCode: '',
          partnerStage:    partnerStageManual ?? undefined,
          partnerDueDate:  partnerStageManual !== 'newmom' ? resolvedPartnerDate || undefined : undefined,
          partnerBabyDOB:  partnerStageManual === 'newmom' ? resolvedPartnerDate || undefined : undefined,
        });
      }
      return;
    }

    navigation.navigate('PrivacyPledge', {
      stage: selected,
      date: resolvedDate,
      inviteCode: '',
    });
  };

  const isDateStage = selected === 'pregnancy' || selected === 'newmom' || selected === 'ttc';
  const dateRange   = selected && isDateStage ? getDateRange(selected, pregnancyMode) : null;
  const dateConfig  = selected && isDateStage ? getDateConfig(selected, pregnancyMode) : null;
  const eddPreview  = selected === 'pregnancy' && pregnancyMode === 'lmp' && date
    ? formatShortDate(lmpToEdd(date)) : null;

  // Partner manual date helpers
  const partnerDateRange  = partnerStageManual ? getDateRange(partnerStageManual, partnerPregnancyMode) : null;
  const partnerDateConfig = partnerStageManual ? getDateConfig(partnerStageManual, partnerPregnancyMode, true) : null;
  const partnerEddPreview = partnerStageManual === 'pregnancy' && partnerPregnancyMode === 'lmp' && partnerDateManual
    ? formatShortDate(lmpToEdd(partnerDateManual)) : null;

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

          {/* User type grid */}
          <View style={styles.grid}>
            {options.map(opt => {
              const isChosen = selected === opt.stage;
              return (
                <TouchableOpacity
                  key={opt.stage}
                  onPress={() => handleSelect(opt.stage)}
                  activeOpacity={0.8}
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: isChosen ? theme.bg.subtle : theme.bg.surface,
                      borderColor: isChosen ? theme.interactive.primary : theme.border.subtle,
                    },
                  ]}
                >
                  {isChosen ? (
                    <View style={[styles.gridBadge, { backgroundColor: theme.interactive.primary }]}>
                      <Icon name="check" size={11} color="#fff" />
                    </View>
                  ) : (
                    <View style={[styles.gridBadge, { backgroundColor: theme.bg.app, borderWidth: 1.5, borderColor: theme.border.default }]}>
                      <Icon name="add" size={11} color={theme.text.tertiary} />
                    </View>
                  )}
                  <Text style={styles.gridEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.gridLabel, { color: theme.text.primary }]}>{opt.label}</Text>
                  <Text style={[styles.gridDesc, { color: theme.text.secondary }]} numberOfLines={2}>
                    {opt.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date fields for pregnancy / newmom / ttc */}
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
              <DatePickerField value={date} onChange={setDate} minDate={dateRange.min} maxDate={dateRange.max} placeholder={dateConfig.placeholder} />
              {eddPreview ? (
                <View style={[styles.eddPreview, { backgroundColor: theme.accent.rose.bg }]}>
                  <Text style={[styles.eddPreviewText, { color: theme.accent.rose.text }]}>🗓 Estimated due date: {eddPreview}</Text>
                </View>
              ) : (
                <Text style={[styles.contextHelp, { color: theme.text.tertiary }]}>{dateConfig.help}</Text>
              )}
            </View>
          )}

          {/* Partner contextual section */}
          {selected === 'partner' && (
            <View style={[styles.contextBox, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>

              {/* Invite code field */}
              <Text style={[styles.contextLabel, { color: theme.text.secondary }]}>Invite code from your partner</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.bg.app,
                    borderColor: codeIsValid
                      ? theme.accent.sage.border
                      : inviteFocused ? theme.border.focus : theme.border.default,
                    color: theme.text.primary,
                  },
                ]}
                placeholder="e.g. PREGNANCY-20251225"
                placeholderTextColor={theme.text.tertiary}
                value={inviteCode}
                onChangeText={setInviteCode}
                onFocus={() => setInviteFocused(true)}
                onBlur={() => setInviteFocused(false)}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              {/* Code decoded — show connected preview */}
              {codeIsValid && (
                <View style={[styles.connectedBanner, { backgroundColor: theme.accent.sage.bg }]}>
                  <Icon name="check_circle" size={16} color={theme.accent.sage.text} />
                  <Text style={[styles.connectedText, { color: theme.accent.sage.text }]}>
                    {decoded!.stage === 'pregnancy'
                      ? `Connected — partner is pregnant${decoded!.date ? ` · Due ${formatShortDate(new Date(decoded!.date))}` : ''}`
                      : decoded!.stage === 'newmom'
                      ? `Connected — partner has a newborn${decoded!.date ? ` · Born ${formatShortDate(new Date(decoded!.date))}` : ''}`
                      : `Connected — partner is trying to conceive`}
                  </Text>
                </View>
              )}

              {/* No valid code — show manual stage selector */}
              {!codeIsValid && (
                <>
                  <View style={[styles.divider, { borderColor: theme.border.subtle }]} />
                  <Text style={[styles.contextLabel, { color: theme.text.secondary }]}>
                    Or tell us what stage she is in
                  </Text>
                  <View style={styles.pillRow}>
                    {partnerStageOptions.map(opt => {
                      const isChosen = partnerStageManual === opt.stage;
                      return (
                        <TouchableOpacity
                          key={opt.stage}
                          onPress={() => {
                            setPartnerStageManual(opt.stage);
                            setPartnerDateManual('');
                            setPartnerPregnancyMode('lmp');
                          }}
                          activeOpacity={0.75}
                          style={[
                            styles.stagePill,
                            {
                              backgroundColor: isChosen ? theme.interactive.primary : theme.bg.app,
                              borderColor: isChosen ? theme.interactive.primary : theme.border.default,
                            },
                          ]}
                        >
                          <Text style={styles.stagePillEmoji}>{opt.emoji}</Text>
                          <Text style={[styles.stagePillText, { color: isChosen ? theme.interactive.primaryText : theme.text.primary }]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Date picker for selected partner stage */}
                  {partnerStageManual && partnerDateConfig && partnerDateRange && (
                    <View style={styles.partnerDateSection}>
                      <View style={styles.contextLabelRow}>
                        <Text style={[styles.contextHelp, { color: theme.text.secondary }]}>{partnerDateConfig.label}</Text>
                        {partnerStageManual === 'pregnancy' && (
                          <TouchableOpacity onPress={() => { setPartnerDateManual(''); setPartnerPregnancyMode(m => m === 'lmp' ? 'edd' : 'lmp'); }} activeOpacity={0.7}>
                            <Text style={[styles.modeToggle, { color: theme.text.link }]}>
                              {partnerPregnancyMode === 'lmp' ? 'I know her due date' : 'Use last period instead'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <DatePickerField
                        value={partnerDateManual}
                        onChange={setPartnerDateManual}
                        minDate={partnerDateRange.min}
                        maxDate={partnerDateRange.max}
                        placeholder={partnerDateConfig.placeholder}
                      />
                      {partnerEddPreview ? (
                        <View style={[styles.eddPreview, { backgroundColor: theme.accent.rose.bg }]}>
                          <Text style={[styles.eddPreviewText, { color: theme.accent.rose.text }]}>🗓 Estimated due date: {partnerEddPreview}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.contextHelp, { color: theme.text.tertiary }]}>{partnerDateConfig.help}</Text>
                      )}
                    </View>
                  )}

                  <Text style={[styles.contextHelp, { color: theme.text.tertiary }]}>
                    You can skip this — your experience will update once you get an invite code.
                  </Text>
                </>
              )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  gridCard: {
    width: '47%',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing[4],
    gap: Spacing[1],
    position: 'relative',
    minHeight: 120,
  },
  gridBadge: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridEmoji: { fontSize: 30, lineHeight: 40 },
  gridLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.3,
    marginTop: 2,
  },
  gridDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },
  contextBox: {
    borderWidth: 1,
    borderRadius: Radius['2xl'],
    padding: Spacing[4],
    gap: Spacing[3],
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
  connectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
  },
  connectedText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  divider: {
    borderTopWidth: 1,
    marginVertical: Spacing[1],
  },
  pillRow: {
    flexDirection: 'column',
    gap: Spacing[2],
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
  },
  stagePillEmoji: { fontSize: 16 },
  stagePillText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  partnerDateSection: { gap: Spacing[2] },
  contextHelp: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
  },
});
