import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, TextInput, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { ChevronLeft, Mic, Square, Shield } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius } from '../../theme';
import Button from '../../components/ui/Button';
import { ConsultationSession, SessionType } from '../../types/consultation';

const STORAGE_KEY = 'askneo_consultations';

const SESSION_TYPES = [
  { key: 'doctor'  as SessionType, label: 'Doctor',  emoji: '🩺', placeholder: 'e.g. Antenatal checkup – Dr. Amara' },
  { key: 'midwife' as SessionType, label: 'Midwife', emoji: '👩‍⚕️', placeholder: 'e.g. 28-week midwife review' },
  { key: 'scan'    as SessionType, label: 'Scan',    emoji: '🔬', placeholder: 'e.g. 20-week anatomy scan' },
];

const SCAN_TYPES = ['Dating', 'NT', 'Anatomy', 'Growth', 'Other'];

const CONSENT_POINTS = [
  'Audio is processed securely on our servers',
  'Only you can see the transcript and extracted data',
  'You can delete any recording at any time',
  'Please also get verbal consent from your provider',
];

// ── Mock AI extraction (replace with real API call when backend is ready) ──
async function mockExtract(session: ConsultationSession): Promise<ConsultationSession> {
  await new Promise(r => setTimeout(r, 3000)); // simulate API delay

  if (session.sessionType === 'scan') {
    const weekLabel = session.gestationalWeek ? `${session.gestationalWeek} weeks` : 'current gestation';
    const scanLabel = session.scanType ? `${session.scanType.toLowerCase()} scan` : 'scan';
    return {
      ...session,
      status: 'done',
      transcript: `Sonographer confirmed baby is well-positioned for the ${scanLabel}. Measurements are consistent with ${weekLabel}. Nuchal translucency measured at 1.8mm — within normal range. Baby's heartbeat is strong at 162 bpm. The sonographer noted no structural concerns at this stage. Next scan recommended at 20 weeks for the anatomy review.`,
      summary: `${session.scanType ?? 'Scan'} at ${weekLabel}. NT 1.8mm (normal). Heartbeat 162 bpm. No concerns noted. Anatomy scan recommended at 20 weeks.`,
      extractedData: {
        nextAppointment: new Date(Date.now() + 56 * 24 * 3600_000).toISOString(),
        medications: [],
        instructions: [
          'Drink plenty of water before your next scan',
          'Book the 20-week anatomy scan',
          'Request scan images from the imaging centre',
        ],
        contextNotes: [
          `NT measurement 1.8mm — within normal range at ${weekLabel}`,
          'Baby heartbeat strong at 162 bpm',
          'No structural concerns flagged at this stage',
        ],
      },
      actionItems: [
        { id: '1', text: 'Book 20-week anatomy scan', done: false },
        { id: '2', text: 'Request scan images from the imaging centre', done: false },
      ],
    };
  }

  if (session.sessionType === 'midwife') {
    return {
      ...session,
      status: 'done',
      transcript: 'Midwife reviewed your birth plan preferences and discussed pain management options including gas and air and epidural. Blood pressure was recorded at 118/74 — within normal range. Urine test came back clear. Baby is in a head-down position. Midwife recommended attending the antenatal class next week and confirmed the home birth option is available.',
      summary: 'Antenatal midwife appointment. BP 118/74 (normal). Urine clear. Baby head-down. Birth plan discussed. Antenatal class recommended.',
      extractedData: {
        nextAppointment: new Date(Date.now() + 14 * 24 * 3600_000).toISOString(),
        medications: [],
        instructions: [
          'Attend antenatal class next week',
          'Continue taking folic acid and vitamin D daily',
          'Complete birth plan document and bring to next appointment',
        ],
        contextNotes: [
          'Blood pressure 118/74 — normal range',
          'Baby in head-down position',
          'Home birth option confirmed as available',
        ],
      },
      actionItems: [
        { id: '1', text: 'Register for antenatal class', done: false },
        { id: '2', text: 'Complete birth plan document', done: false },
        { id: '3', text: 'Continue folic acid and vitamin D daily', done: false },
      ],
    };
  }

  // Default: doctor
  return {
    ...session,
    status: 'done',
    transcript: 'Dr. Amara reviewed your blood pressure readings which are within normal range. She prescribed iron supplements 200mg once daily with meals. Your next appointment is scheduled for four weeks from today. She recommended reducing salt intake and increasing fluid consumption. Baby is measuring well at 28 weeks.',
    summary: 'Routine antenatal checkup. BP normal. Iron supplements prescribed. Baby measuring well. Follow-up in 4 weeks.',
    extractedData: {
      nextAppointment: new Date(Date.now() + 28 * 24 * 3600_000).toISOString(),
      medications: [
        { name: 'Iron supplements', dosage: '200mg', frequency: 'Once daily with meals' },
      ],
      instructions: [
        'Reduce salt intake',
        'Increase fluid consumption to at least 8 glasses per day',
        'Continue taking prenatal vitamins',
      ],
      contextNotes: [
        'Blood pressure within normal range at this visit',
        'Baby measuring well at 28 weeks',
        'No concerns flagged by doctor',
      ],
    },
    actionItems: [
      { id: '1', text: 'Book follow-up appointment in 4 weeks', done: false },
      { id: '2', text: 'Pick up iron supplements (200mg)', done: false },
      { id: '3', text: 'Reduce salt in meals', done: false },
    ],
  };
}

type Phase = 'consent' | 'recording' | 'processing';

export default function RecordConsultationScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { updateUser } = useAppContext();
  const [phase, setPhase] = useState<Phase>('consent');
  const [sessionType, setSessionType] = useState<SessionType>('doctor');
  const [scanType, setScanType] = useState('');
  const [gestationalWeek, setGestationalWeek] = useState('');
  const [imagingFacility, setImagingFacility] = useState('');
  const [title, setTitle] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Waveform animation
  const bars = useRef(Array.from({ length: 20 }, () => new Animated.Value(0.3))).current;
  const waveLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startWave = () => {
    waveLoop.current = Animated.loop(
      Animated.stagger(60, bars.map(bar =>
        Animated.sequence([
          Animated.timing(bar, { toValue: 0.3 + Math.random() * 0.7, duration: 300 + Math.random() * 200, useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.3, duration: 300 + Math.random() * 200, useNativeDriver: true }),
        ])
      ))
    );
    waveLoop.current.start();
  };

  const stopWave = () => {
    waveLoop.current?.stop();
    bars.forEach(b => b.setValue(0.3));
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Microphone permission required', 'Please allow microphone access in your device settings.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setPhase('recording');
      startWave();
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch {
      Alert.alert('Could not start recording', 'Please try again.');
    }
  };

  const stopAndProcess = async () => {
    if (!recording) return;
    stopWave();
    clearInterval(timerRef.current!);

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setPhase('processing');

    // Build the session object
    const typeLabel = SESSION_TYPES.find(t => t.key === sessionType)?.label ?? 'Consultation';
    const session: ConsultationSession = {
      id: Date.now().toString(),
      title: title.trim() || `${typeLabel} – ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      date: new Date().toISOString(),
      durationSeconds: elapsed,
      audioUri: uri ?? undefined,
      status: 'processing',
      permissionGranted: true,
      sessionType,
      ...(sessionType === 'scan' && {
        scanType: scanType || undefined,
        gestationalWeek: gestationalWeek ? parseInt(gestationalWeek, 10) : undefined,
        imagingFacility: imagingFacility.trim() || undefined,
      }),
      actionItems: [],
    };

    // Persist processing state immediately
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const all: ConsultationSession[] = existing ? JSON.parse(existing) : [];
    all.push(session);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Run extraction (mock for now — swap for real API call)
    const done = await mockExtract(session);
    const updated = all.map(s => s.id === done.id ? done : s);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Sync extracted next appointment to user profile so HomeScreen and VisitPrep pick it up
    if (done.extractedData?.nextAppointment) {
      updateUser({ nextAppointmentDate: done.extractedData.nextAppointment.split('T')[0] });
    }

    navigation.replace('ConsultationDetail', { sessionId: done.id });
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current!);
      recording?.stopAndUnloadAsync();
    };
  }, [recording]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Consent phase ──────────────────────────────────────────────────────
  if (phase === 'consent') {
    const activeTmpl = SESSION_TYPES.find(t => t.key === sessionType);
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
        <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
          >
            <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
            <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>New consultation</Text>
          <View style={{ width: 72 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
        <ScrollView contentContainerStyle={styles.consentScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.shieldIcon, { backgroundColor: theme.accent.sky.bg }]}>
            <Shield size={36} color={theme.accent.sky.text} strokeWidth={1.5} />
          </View>

          <Text style={[styles.consentTitle, { color: theme.text.primary }]}>
            Before you record
          </Text>
          <Text style={[styles.consentBodyText, { color: theme.text.secondary }]}>
            AskNeo will process this recording to extract useful information — medications prescribed, follow-up dates, instructions, and a summary you can read back later.
          </Text>

          {/* Session type selector */}
          <View style={styles.typeSelector}>
            {SESSION_TYPES.map(({ key, label, emoji }) => {
              const active = sessionType === key;
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.8}
                  onPress={() => setSessionType(key)}
                  style={[
                    styles.typeBtn,
                    active
                      ? { backgroundColor: theme.bg.subtle, borderColor: theme.border.brand }
                      : { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
                  ]}
                >
                  <Text style={styles.typeBtnEmoji}>{emoji}</Text>
                  <Text style={[styles.typeBtnLabel, { color: active ? theme.text.brand : theme.text.secondary }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Privacy bullets */}
          <View style={[styles.consentCard, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
            {CONSENT_POINTS.map(point => (
              <View key={point} style={styles.consentPoint}>
                <Text style={[styles.consentDot, { color: theme.text.brand }]}>•</Text>
                <Text style={[styles.consentPointText, { color: theme.text.secondary }]}>{point}</Text>
              </View>
            ))}
          </View>

          {/* Scan-specific fields */}
          {sessionType === 'scan' && (
            <>
              <Text style={[styles.titleLabel, { color: theme.text.secondary }]}>Scan type</Text>
              <View style={styles.scanTypeRow}>
                {SCAN_TYPES.map(st => {
                  const active = scanType === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      activeOpacity={0.8}
                      onPress={() => setScanType(active ? '' : st)}
                      style={[
                        styles.scanTypePill,
                        active
                          ? { backgroundColor: theme.bg.subtle, borderColor: theme.border.brand }
                          : { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle },
                      ]}
                    >
                      <Text style={[styles.scanTypePillText, { color: active ? theme.text.brand : theme.text.secondary }]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.titleLabel, { color: theme.text.secondary }]}>Gestational week</Text>
              <TextInput
                style={[styles.titleInput, { borderColor: theme.border.default, color: theme.text.primary, backgroundColor: theme.bg.surface }]}
                placeholder="e.g. 12"
                placeholderTextColor={theme.text.tertiary}
                value={gestationalWeek}
                onChangeText={setGestationalWeek}
                keyboardType="number-pad"
              />

              <Text style={[styles.titleLabel, { color: theme.text.secondary }]}>Imaging facility (optional)</Text>
              <TextInput
                style={[styles.titleInput, { borderColor: theme.border.default, color: theme.text.primary, backgroundColor: theme.bg.surface }]}
                placeholder="e.g. St. Thomas Hospital"
                placeholderTextColor={theme.text.tertiary}
                value={imagingFacility}
                onChangeText={setImagingFacility}
              />
            </>
          )}

          <Text style={[styles.titleLabel, { color: theme.text.secondary }]}>
            Label this session (optional)
          </Text>
          <TextInput
            style={[styles.titleInput, { borderColor: theme.border.default, color: theme.text.primary, backgroundColor: theme.bg.surface }]}
            placeholder={activeTmpl?.placeholder ?? 'e.g. Antenatal checkup – Dr. Amara'}
            placeholderTextColor={theme.text.tertiary}
            value={title}
            onChangeText={setTitle}
          />

          <Button
            label="I understand — start recording"
            onPress={startRecording}
            fullWidth
          />
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.cancelWrapper}>
            <Text style={[styles.cancelLink, { color: theme.text.tertiary }]}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Processing phase ───────────────────────────────────────────────────
  if (phase === 'processing') {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
        <View style={styles.processingContainer}>
          <View style={[styles.processingPulse, { backgroundColor: theme.accent.sky.bg }]}>
            <Mic size={36} color={theme.accent.sky.text} strokeWidth={1.5} />
          </View>
          <Text style={[styles.processingTitle, { color: theme.text.primary }]}>Extracting insights…</Text>
          <Text style={[styles.processingBody, { color: theme.text.secondary }]}>
            AskNeo is reading your consultation — pulling out medications, instructions, and key dates.
          </Text>
          <View style={styles.skeletonList}>
            {[140, 100, 120, 90].map((w, i) => (
              <View key={i} style={[styles.skeletonLine, { width: w, backgroundColor: theme.border.subtle }]} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Recording phase ────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <View style={{ width: 72 }} />
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Recording</Text>
        <View style={{ width: 72 }} />
      </View>

      <View style={styles.recordingContainer}>
        <View style={[styles.recordingDot, { backgroundColor: theme.accent.rose.bg }]}>
          <View style={[styles.recordingDotInner, { backgroundColor: theme.accent.rose.text }]} />
        </View>

        <Text style={[styles.timer, { color: theme.text.primary }]}>{formatTime(elapsed)}</Text>

        <Text style={[styles.recordingLabel, { color: theme.text.secondary }]}>
          {title || 'Consultation in progress'}
        </Text>

        {/* Waveform */}
        <View style={styles.waveform}>
          {bars.map((bar, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  backgroundColor: theme.interactive.primary,
                  transform: [{ scaleY: bar }],
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={stopAndProcess}
          activeOpacity={0.85}
          style={[styles.stopBtn, { backgroundColor: theme.accent.rose.text }]}
        >
          <Square size={22} color="#fff" strokeWidth={2} fill="#fff" />
          <Text style={styles.stopBtnLabel}>Stop & extract insights</Text>
        </TouchableOpacity>

        <Text style={[styles.stopHint, { color: theme.text.tertiary }]}>
          Tap when your consultation is finished
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  backLabel: { fontFamily: Typography.fontFamily.bodyMedium, fontSize: Typography.size.sm },
  headerTitle: { fontFamily: Typography.fontFamily.bodyBold, fontSize: Typography.size.base },

  // Consent
  consentScroll: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  shieldIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  consentTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  consentBodyText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.6,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    gap: 4,
  },
  typeBtnEmoji: { fontSize: 22, lineHeight: 28 },
  typeBtnLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
  },
  consentCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  consentPoint: { flexDirection: 'row', gap: Spacing[2], alignItems: 'flex-start' },
  consentDot: { fontFamily: Typography.fontFamily.bodyBold, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.4 },
  consentPointText: { fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.5, flex: 1 },
  scanTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  scanTypePill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  scanTypePillText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  titleLabel: { fontFamily: Typography.fontFamily.bodySemibold, fontSize: Typography.size.sm },
  titleInput: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 52,
  },
  cancelWrapper: { alignItems: 'center' },
  cancelLink: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },

  // Recording
  recordingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[5],
    paddingHorizontal: Spacing[6],
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDotInner: { width: 10, height: 10, borderRadius: 5 },
  timer: {
    fontFamily: Typography.fontFamily.display,
    fontSize: 56,
    letterSpacing: -2,
  },
  recordingLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.base,
    textAlign: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: 3,
  },
  waveBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[7],
    paddingVertical: Spacing[4],
    borderRadius: Radius.full,
    marginTop: Spacing[4],
  },
  stopBtnLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
  stopHint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },

  // Processing
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[5],
    paddingHorizontal: Spacing[6],
  },
  processingPulse: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  processingBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.6,
    textAlign: 'center',
    maxWidth: 280,
  },
  skeletonList: { gap: Spacing[3], marginTop: Spacing[4], alignItems: 'center' },
  skeletonLine: { height: 12, borderRadius: 6 },
});
