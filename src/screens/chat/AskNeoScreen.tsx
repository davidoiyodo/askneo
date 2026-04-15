import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, ChevronLeft, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import ChatBubble, { Message } from '../../components/chat/ChatBubble';
import { ChatTab, welcomeMessages } from '../../data/responses';
import { getResponse, isVisitQuery, buildVisitContext } from '../../utils/chatEngine';
import { useDailyLogs } from '../../hooks/useDailyLogs';

const CHAT_HISTORY_KEY = 'askneo_chat_history';

const TAB_LABELS: Array<{ key: ChatTab; label: string }> = [
  { key: 'baby',     label: 'Baby Care' },
  { key: 'pregnancy', label: 'Pregnancy' },
  { key: 'ttc',     label: 'TTC' },
];

const makeId = () => Math.random().toString(36).slice(2);

const makeWelcome = (tab: ChatTab): Message => ({
  id: makeId(),
  sender: 'neo',
  text: welcomeMessages[tab],
  timestamp: new Date(),
});

const defaultHistory = (): Record<ChatTab, Message[]> => ({
  baby:      [makeWelcome('baby')],
  pregnancy: [makeWelcome('pregnancy')],
  ttc:       [makeWelcome('ttc')],
});

export default function AskNeoScreen({ navigation, route }: { navigation: any; route: any }) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const { logs } = useDailyLogs();

  const defaultTab: ChatTab =
    user?.stage === 'ttc' ? 'ttc' :
    user?.stage === 'newmom' ? 'baby' : 'pregnancy';

  const [activeTab, setActiveTab] = useState<ChatTab>(defaultTab);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [messagesByTab, setMessagesByTab] = useState<Record<ChatTab, Message[]>>(defaultHistory);

  const historyLoaded = useRef(false);
  const listRef = useRef<FlatList>(null);
  const typingDot = useRef(new Animated.Value(0)).current;
  const tabOpacity = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  const switchTab = useCallback((tab: ChatTab) => {
    Animated.timing(tabOpacity, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
      setActiveTab(tab);
      Animated.timing(tabOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  }, [tabOpacity]);

  // ── Pre-load prompt from Home card ────────────────────────────────────
  useEffect(() => {
    const prompt = route.params?.prompt;
    if (!prompt) return;
    setReplyingTo({
      id: 'prompt-' + prompt.id,
      sender: 'neo',
      text: prompt.body,
      timestamp: new Date(),
    });
    setInputText(prompt.title);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [route.params?.prompt]);

  // ── Auto-send initialMessage from HomeScreen inline input ─────────────
  useEffect(() => {
    const msg = route.params?.initialMessage;
    if (!msg) return;
    // Delay slightly to let history load from AsyncStorage first
    const timer = setTimeout(() => sendMessage(msg), 200);
    return () => clearTimeout(timer);
  }, [route.params?.initialMessage]);

  // ── Load persisted history on mount ───────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(CHAT_HISTORY_KEY).then(val => {
      if (val) {
        const stored = JSON.parse(val) as Record<ChatTab, Array<Omit<Message, 'timestamp'> & { timestamp: string }>>;
        const deserialize = (tab: ChatTab): Message[] => {
          const msgs = stored[tab];
          if (!msgs || msgs.length === 0) return [makeWelcome(tab)];
          return msgs.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
        };
        setMessagesByTab({
          baby:      deserialize('baby'),
          pregnancy: deserialize('pregnancy'),
          ttc:       deserialize('ttc'),
        });
      }
      historyLoaded.current = true;
    });
  }, []);

  // ── Persist history whenever it changes ───────────────────────────────
  useEffect(() => {
    if (!historyLoaded.current) return;
    AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesByTab));
  }, [messagesByTab]);

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDot, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(typingDot, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback((overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text) return;
    if (!overrideText) setInputText('');

    const currentReply = replyingTo;
    setReplyingTo(null);

    const userMsg: Message = {
      id: makeId(),
      sender: 'user',
      text,
      timestamp: new Date(),
      ...(currentReply
        ? { replyTo: { id: currentReply.id, sender: currentReply.sender, text: currentReply.text } }
        : {}),
    };

    setMessagesByTab(prev => {
      const updatedTab = [...prev[activeTab], userMsg];

      setIsTyping(true);
      startTypingAnimation();

      setTimeout(() => {
        const result = getResponse(text, activeTab, updatedTab, user?.stage);
        let responseText = result.text;

        if (isVisitQuery(text) && user?.stage) {
          const ctx = buildVisitContext(logs, user.stage);
          if (ctx) {
            responseText = `${result.text}\n\n📋 Based on your recent logs:\n${ctx}`;
          }
        }

        const neoMsg: Message = {
          id: makeId(),
          sender: 'neo',
          text: responseText,
          timestamp: new Date(),
          response: { ...result, text: responseText },
        };

        setMessagesByTab(latest => {
          if (result.detectedTab && result.detectedTab !== activeTab) {
            // Move the user message + reply into the detected tab
            return {
              ...latest,
              [activeTab]: latest[activeTab].filter(m => m.id !== userMsg.id),
              [result.detectedTab]: [...latest[result.detectedTab], userMsg, neoMsg],
            };
          }
          return {
            ...latest,
            [activeTab]: [...latest[activeTab], neoMsg],
          };
        });

        if (result.detectedTab) {
          switchTab(result.detectedTab);
        }

        setIsTyping(false);
        typingDot.stopAnimation();
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }, 900 + Math.random() * 500);

      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

      return { ...prev, [activeTab]: updatedTab };
    });
  }, [inputText, activeTab, replyingTo, switchTab, user?.stage, logs]);

  const messages = messagesByTab[activeTab];

  const renderTypingIndicator = () => (
    <View style={[styles.typingRow]}>
      <View style={[styles.typingAvatar, { backgroundColor: theme.interactive.primary }]}>
        <Text style={styles.typingAvatarText}>N</Text>
      </View>
      <View style={[styles.typingBubble, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
        <Animated.View style={[styles.typingDots, { opacity: typingDot }]}>
          <View style={[styles.dot, { backgroundColor: theme.text.tertiary }]} />
          <View style={[styles.dot, { backgroundColor: theme.text.tertiary }]} />
          <View style={[styles.dot, { backgroundColor: theme.text.tertiary }]} />
        </Animated.View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
          >
            <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
            <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerLogo, { color: theme.text.brand }]}>AskNeo</Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: theme.bg.subtle }]}>
          {TAB_LABELS.map(t => {
            const active = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => switchTab(t.key)}
                style={[
                  styles.tab,
                  active && [styles.tabActive, { backgroundColor: theme.bg.surface, ...Shadow.sm }],
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? theme.text.brand : theme.text.tertiary },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Message list */}
        <Animated.View style={{ flex: 1, opacity: tabOpacity }}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <ChatBubble message={item} onReply={handleReply} />}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? renderTypingIndicator : null}
          />
        </Animated.View>

        {/* Reply preview bar */}
        {replyingTo && (
          <View style={[styles.replyPreviewBar, { backgroundColor: theme.bg.subtle, borderTopColor: theme.border.subtle }]}>
            <View style={[styles.replyAccent, { backgroundColor: theme.interactive.primary }]} />
            <View style={styles.replyPreviewContent}>
              <Text style={[styles.replyPreviewLabel, { color: theme.text.brand }]}>
                {replyingTo.id.startsWith('prompt-') ? 'From your timeline' : replyingTo.sender === 'user' ? 'Replying to yourself' : 'Replying to Neo'}
              </Text>
              <Text style={[styles.replyPreviewText, { color: theme.text.secondary }]} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <X size={16} color={theme.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.bg.surface, borderTopColor: replyingTo ? 'transparent' : theme.border.subtle }]}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { backgroundColor: theme.bg.app, color: theme.text.primary, borderColor: theme.border.default },
            ]}
            placeholder={`Ask about ${activeTab === 'baby' ? 'your baby' : activeTab === 'pregnancy' ? 'your pregnancy' : 'conception'}...`}
            placeholderTextColor={theme.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!inputText.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? theme.interactive.primary : theme.border.subtle },
            ]}
          >
            <ArrowUp size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    gap: Spacing[3],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  backLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  headerLogo: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xl,
    letterSpacing: -0.3,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  tabActive: {
    borderRadius: Radius.full,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  messageList: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingAvatarText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 12,
    color: '#fff',
  },
  typingBubble: {
    borderRadius: Radius['2xl'],
    borderBottomLeftRadius: Radius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    gap: Spacing[3],
  },
  replyAccent: {
    width: 3,
    height: 36,
    borderRadius: 2,
    flexShrink: 0,
  },
  replyPreviewContent: {
    flex: 1,
    gap: 2,
  },
  replyPreviewLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  replyPreviewText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    gap: Spacing[2],
  },
  input: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 52,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
