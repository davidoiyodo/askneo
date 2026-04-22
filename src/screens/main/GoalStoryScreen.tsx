import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ImageBackground,
  TextInput, Keyboard, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, CheckCircle2, Send } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useRoutine } from '../../hooks/useRoutine';
import { getGoalById } from '../../data/goals';
import { GOAL_ACCENT } from '../../utils/goalColors';
import { GOAL_IMAGES } from '../../utils/goalImages';
import { ITEM_IMAGES } from '../../utils/itemImages';
import { Typography, Spacing, Radius } from '../../theme';

interface Props {
  navigation: any;
  route: any; // { goalId: string, initialIndex?: number }
}

export default function GoalStoryScreen({ navigation, route }: Props) {
  const { goalId, initialIndex = 0 } = route.params;
  const { theme }                     = useTheme();
  const { user }                      = useAppContext();
  const { getGoalItems, isItemDoneToday, completeItem } = useRoutine();

  const insets     = useSafeAreaInsets();
  const goalDef    = getGoalById(goalId);
  const userGoals  = user?.goals ?? [];
  const allItems   = user ? getGoalItems(user, goalId) : [];
  // Mirror the HomeScreen deduplication: each item belongs to the first of its
  // goalIds that the user has selected; universal items only in the first goal.
  const items = allItems.filter(it => {
    if (it.universalItem) return userGoals[0] === goalId;
    const primary = it.goalIds.find(g => userGoals.includes(g as any));
    return primary === goalId;
  });
  const accentKey = GOAL_ACCENT[goalId] ?? 'rose';
  const accent    = theme.accent[accentKey];

  const [index, setIndex]           = useState(() => Math.min(initialIndex, Math.max(0, items.length - 1)));
  const doneAnim                    = useRef(new Animated.Value(0)).current;
  const [reply, setReply]           = useState('');
  const [inputFocused, setFocused]  = useState(false);
  const inputRef                    = useRef<TextInput>(null);
  const focusAnim                   = useRef(new Animated.Value(0)).current;
  // Ref so handleBlur can read latest done state without stale closure
  const doneRef                     = useRef(false);
  // JS-thread width: start at 0 if the initial item is already done
  const _safeIdx   = Math.min(index, Math.max(0, items.length - 1));
  const _initDone  = items.length > 0 && isItemDoneToday(items[_safeIdx].id);
  const slotWidthAnim = useRef(new Animated.Value(_initDone ? 0 : 100)).current;

  // Whenever the user navigates to a different item, snap slot to correct width
  useEffect(() => {
    slotWidthAnim.setValue(doneRef.current ? 0 : 100);
  }, [index]);

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(focusAnim,     { toValue: 1,  useNativeDriver: true,  tension: 280, friction: 24 }).start();
    Animated.spring(slotWidthAnim, { toValue: 44, useNativeDriver: false, tension: 280, friction: 24 }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(focusAnim,     { toValue: 0,                        useNativeDriver: true,  tension: 280, friction: 24 }).start();
    // Collapse to 0 when done (nothing left to show), restore to 100 otherwise
    Animated.spring(slotWidthAnim, { toValue: doneRef.current ? 0 : 100, useNativeDriver: false, tension: 280, friction: 24 }).start();
  };

  if (!user || !goalDef || items.length === 0) {
    navigation.goBack();
    return null;
  }

  const item          = items[index];
  const done          = isItemDoneToday(item.id);
  doneRef.current     = done;                      // keep ref in sync for handleBlur
  const isLast        = index === items.length - 1;
  // Per-item image, fall back to goal-level image
  const imageUri = ITEM_IMAGES[item.id] ?? GOAL_IMAGES[goalId];

  // ── Reply / Ask Neo ─────────────────────────────────────────────────────────

  const handleReply = () => {
    const text = reply.trim();
    if (!text) return;
    Keyboard.dismiss();
    setReply('');
    navigation.navigate('Tabs', {
      screen: 'AskNeo',
      params: { initialMessage: `About "${item.title}": ${text}` },
    });
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goNext = () => {
    // If keyboard is up, dismiss it first — don't navigate on same tap
    if (inputFocused) { Keyboard.dismiss(); return; }
    if (!isLast) setIndex(i => i + 1);
    else navigation.goBack();
  };

  const goPrev = () => {
    if (inputFocused) { Keyboard.dismiss(); return; }
    if (index > 0) setIndex(i => i - 1);
  };

  // ── Mark done (one-way — undo available in full details view) ───────────────

  const handleMarkDone = () => {
    if (done) return;
    completeItem(item.id);
    Animated.sequence([
      Animated.timing(doneAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(doneAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      // Collapse right slot — Mark done button is gone, input fills full width
      Animated.spring(slotWidthAnim, { toValue: 0, useNativeDriver: false, tension: 280, friction: 24 }).start();
    });
  };

  const doneFlashOpacity = doneAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.6],
  });

  // ── Progress bar state ────────────────────────────────────────────────────

  const barOpacity = (i: number) => {
    if (isItemDoneToday(items[i].id)) return 1;    // completed
    if (i === index) return 0.85;                   // current
    return 0.3;                                     // upcoming
  };

  return (
    <ImageBackground
      source={imageUri ? { uri: imageUri } : undefined}
      style={styles.imageBg}
      resizeMode="cover"
    >
      {/* Dark scrim so text is always legible over any photo */}
      <View style={styles.scrim} />

      {/* Green flash on "mark done" */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: '#4caf50', opacity: doneFlashOpacity, zIndex: 99 },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <SafeAreaView edges={['top']} style={styles.safe}>

        {/* ── Progress bars ─────────────────────────────────────────────────── */}
        <View style={styles.progressRow}>
          {items.map((it, i) => (
            <View key={it.id} style={[styles.progressTrack, { flex: 1 }]}>
              <View style={[styles.progressFill, { opacity: barOpacity(i) }]} />
            </View>
          ))}
        </View>

        {/* ── Top bar: goal chip + close ───────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.goalChip}>
            <Text style={styles.goalChipText}>
              {goalDef.icon}  {goalDef.label}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
          >
            <X size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Tap zones — left = prev, right = next, behind all content */}
          <TouchableOpacity
            style={styles.tapLeft}
            onPress={goPrev}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.tapRight}
            onPress={goNext}
            activeOpacity={1}
          />

          {/* Item count */}
          <Text style={styles.itemCount}>
            {index + 1} / {items.length}
          </Text>

          {/* Title */}
          <Text style={styles.title}>
            {item.title}
          </Text>

          {/* Why this matters */}
          {item.why ? (
            <Text style={styles.why}>
              {item.why}
            </Text>
          ) : null}

          {/* Done state indicator */}
          {done && (
            <View style={styles.doneChip}>
              <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
              <Text style={styles.doneChipText}>Done today</Text>
            </View>
          )}

          {/* Full details — contextual link in the slide itself */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RoutineItem', { item })}
            style={styles.fullDetailsLink}
          >
            <Text style={styles.fullDetailsText}>Full details →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bottom bar — single row ───────────────────────────────────────── */}
        <View style={[styles.bottomBar, { paddingBottom: inputFocused ? Spacing[3] : (insets.bottom || Spacing[5]) }]}>
          <View style={styles.bottomRow}>

            {/* Reply input pill */}
            <View style={styles.replyRow}>
              <TextInput
                ref={inputRef}
                style={styles.replyInput}
                value={reply}
                onChangeText={setReply}
                placeholder={done ? "How did it go? Ask Neo anything…" : "Got feedback or questions? Ask Neo"}
                placeholderTextColor="rgba(255,255,255,0.6)"
                returnKeyType="send"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSubmitEditing={handleReply}
              />
              {/* Send icon inside pill — fades out when focused */}
              <Animated.View
                style={{ opacity: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}
                pointerEvents={inputFocused ? 'none' : 'auto'}
              >
                <TouchableOpacity onPress={handleReply} activeOpacity={0.7} style={styles.replySendBtn}>
                  <Send size={16} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Right slot — always present so send button is reachable even when done */}
            <Animated.View style={[styles.rightSlot, { width: slotWidthAnim }]}>

              {/* Mark done — only when not yet done, fades out when input focused */}
              {!done && (
                <Animated.View
                  style={[
                    styles.rightSlotChild,
                    { opacity: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
                  ]}
                  pointerEvents={inputFocused ? 'none' : 'auto'}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleMarkDone}
                    style={styles.doneBtn}
                  >
                    <Text style={styles.doneBtnText}>Mark done</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* External send — always available, pops in when input focused */}
              <Animated.View
                style={[
                  styles.rightSlotChild,
                  {
                    opacity: focusAnim,
                    transform: [{
                      scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                    }],
                  },
                ]}
                pointerEvents={inputFocused ? 'auto' : 'none'}
              >
                <TouchableOpacity
                  onPress={handleReply}
                  activeOpacity={0.7}
                  style={[styles.externalSendBtn, { opacity: reply.trim() ? 1 : 0.5 }]}
                >
                  <Send size={18} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
              </Animated.View>

            </Animated.View>

          </View>
        </View>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  imageBg: {
    flex: 1,
    backgroundColor: '#1a1a2e', // fallback when no image
  },

  // Full-screen dark scrim for text legibility
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },

  safe: { flex: 1 },

  // Progress bars — all white, opacity conveys state
  progressRow: {
    flexDirection:     'row',
    gap:               4,
    paddingHorizontal: Spacing[4],
    paddingTop:        Spacing[3],
    paddingBottom:     Spacing[2],
  },
  progressTrack: {
    height:           3,
    borderRadius:     Radius.full,
    overflow:         'hidden',
    backgroundColor:  'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height:           3,
    width:            '100%',
    borderRadius:     Radius.full,
    backgroundColor:  '#fff',
  },

  // Top bar
  topBar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical:   Spacing[3],
  },
  goalChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1],
    borderRadius:      Radius.full,
    backgroundColor:   'rgba(255,255,255,0.18)',
  },
  goalChipText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.sm,
    color:      '#fff',
  },
  closeBtn: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Main content
  content: {
    flex:              1,
    paddingHorizontal: Spacing[6],
    justifyContent:    'center',
    gap:               Spacing[4],
  },
  itemCount: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize:   Typography.size.sm,
    color:      'rgba(255,255,255,0.6)',
  },
  title: {
    fontFamily:    Typography.fontFamily.bodyBold,
    fontSize:      Typography.size['3xl'],
    lineHeight:    Typography.size['3xl'] * 1.2,
    letterSpacing: -0.5,
    color:         '#fff',
  },
  why: {
    fontFamily: Typography.fontFamily.body,
    fontSize:   Typography.size.base,
    lineHeight: Typography.size.base * 1.65,
    color:      'rgba(255,255,255,0.82)',
  },
  doneChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing[1],
    alignSelf:         'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical:   Spacing[1],
    borderRadius:      Radius.full,
    backgroundColor:   'rgba(255,255,255,0.2)',
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.4)',
  },
  doneChipText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.xs,
    color:      '#fff',
  },

  // Bottom bar — single row (paddingBottom injected inline from insets)
  bottomBar: {
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[3],
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderTopColor:    'rgba(255,255,255,0.2)',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[2],
  },

  // Tap zones — cover left/right of content area, sit behind text (rendered first)
  tapLeft: {
    position: 'absolute',
    top:      0,
    left:     0,
    bottom:   0,
    width:    '40%',
  },
  tapRight: {
    position: 'absolute',
    top:      0,
    right:    0,
    bottom:   0,
    width:    '60%',
  },

  // Full details link in content area
  fullDetailsLink: {
    alignSelf: 'flex-start',
  },
  fullDetailsText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.sm,
    color:      'rgba(255,255,255,0.5)',
  },

  // Reply input pill
  replyRow: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing[2],
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingLeft:     Spacing[4],
    paddingRight:    Spacing[1],
    paddingVertical: Spacing[1],
  },
  replyInput: {
    flex:            1,
    fontFamily:      Typography.fontFamily.body,
    fontSize:        Typography.size.sm,
    color:           '#fff',
    paddingVertical: Spacing[2],
  },
  replySendBtn: {
    width:           32,
    height:          32,
    borderRadius:    Radius.full,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Right slot — cross-fades Mark done ↔ Send; width animated via slotWidthAnim
  rightSlot: {
    height:   44,
  },
  rightSlotChild: {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    alignItems:     'center',
    justifyContent: 'center',
  },

  // Mark done — fills the right slot
  doneBtn: {
    width:          '100%',
    height:         44,
    borderRadius:   Radius['2xl'],
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing[1],
    backgroundColor:'#fff',
  },
  doneBtnText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize:   Typography.size.sm,
    color:      '#111',
  },

  // External send button — circular, appears when input focused
  externalSendBtn: {
    width:           44,
    height:          44,
    borderRadius:    Radius.full,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.55)',
    alignItems:      'center',
    justifyContent:  'center',
  },
});
