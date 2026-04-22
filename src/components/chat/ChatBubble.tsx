import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bookmark, BookmarkCheck, Circle, CheckCircle2, CornerUpLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useRoutine } from '../../hooks/useRoutine';
import { ROUTINE_ITEMS } from '../../data/routineItems';
import { Typography, Spacing, Radius } from '../../theme';
import TriageCard from '../triage/TriageCard';
import { NeoResponse } from '../../data/responses';

export interface Message {
  id: string;
  sender: 'user' | 'neo';
  text: string;
  timestamp: Date;
  response?: NeoResponse;
  replyTo?: { id: string; sender: 'user' | 'neo'; text: string };
}

interface ChatBubbleProps {
  message: Message;
  onReply: (message: Message) => void;
}

export default function ChatBubble({ message, onReply }: ChatBubbleProps) {
  const { theme } = useTheme();
  const { highlights, addHighlight, removeHighlight } = useAppContext();
  const { isItemDoneToday, completeItem, uncompleteItem } = useRoutine();
  const isUser = message.sender === 'user';
  const isSaved = highlights.includes(message.text);

  const toggleBookmark = () => {
    if (isSaved) {
      const index = highlights.indexOf(message.text);
      if (index !== -1) removeHighlight(index);
    } else {
      addHighlight(message.text);
    }
  };

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowNeo]}>
      {/* Reply button for user messages (left side) */}
      {isUser && (
        <TouchableOpacity
          onPress={() => onReply(message)}
          activeOpacity={0.7}
          style={[styles.actionBtn, styles.actionBtnCenter]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CornerUpLeft size={14} color={theme.text.tertiary} strokeWidth={2} />
        </TouchableOpacity>
      )}

      <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapNeo]}>
        <Text style={[styles.senderLabel, { color: theme.text.tertiary }]}>
          {isUser ? 'YOU' : 'NEO'}
        </Text>
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: theme.interactive.primary }]
              : [styles.bubbleNeo, { backgroundColor: theme.accent.rose.bg, borderColor: theme.accent.rose.border }],
          ]}
        >
          {/* Quoted reply block */}
          {message.replyTo && (
            <View
              style={[
                styles.quotedBlock,
                {
                  backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
                  borderLeftColor: isUser ? 'rgba(255,255,255,0.5)' : theme.interactive.primary,
                },
              ]}
            >
              <Text style={[styles.quotedSender, { color: isUser ? 'rgba(255,255,255,0.75)' : theme.text.brand }]}>
                {message.replyTo.sender === 'user' ? 'You' : 'Neo'}
              </Text>
              <Text
                style={[styles.quotedText, { color: isUser ? 'rgba(255,255,255,0.6)' : theme.text.secondary }]}
                numberOfLines={2}
              >
                {message.replyTo.text}
              </Text>
            </View>
          )}

          <Text style={[styles.text, { color: isUser ? theme.text.inverse : theme.text.primary }]}>
            {message.text}
          </Text>
        </View>

        {!isUser && message.response?.triage && (
          <TriageCard triage={message.response.triage} tab={message.response.tab} />
        )}

        {!isUser && message.response?.metric && (
          <View style={[styles.metricCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
            <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>
              {message.response.metric.label}
            </Text>
            <Text style={[styles.metricValue, { color: theme.text.brand }]}>
              {message.response.metric.value}
            </Text>
          </View>
        )}

        {!isUser && message.response?.reminder && (() => {
          const rem = ROUTINE_ITEMS.find(r => r.id === message.response!.reminder);
          if (!rem) return null;
          const done = isItemDoneToday(rem.id);
          return (
            <TouchableOpacity
              onPress={() => done ? uncompleteItem(rem.id) : completeItem(rem.id)}
              activeOpacity={0.8}
              style={[
                styles.reminderStrip,
                { backgroundColor: done ? theme.accent.sage.bg : theme.bg.surface, borderColor: done ? theme.accent.sage.border : theme.border.subtle },
              ]}
            >
              <View style={styles.reminderContent}>
                <Text style={[styles.reminderLabel, { color: done ? theme.accent.sage.text : theme.text.primary }]}>
                  {rem.title}
                </Text>
                {rem.note && !done && (
                  <Text style={[styles.reminderNote, { color: theme.text.secondary }]}>{rem.note}</Text>
                )}
              </View>
              {done
                ? <CheckCircle2 size={18} color={theme.accent.sage.text} strokeWidth={2} />
                : <Circle size={18} color={theme.text.tertiary} strokeWidth={1.5} />
              }
            </TouchableOpacity>
          );
        })()}

        <Text style={[styles.time, { color: theme.text.tertiary }, isUser && { textAlign: 'right' }]}>
          {message.timestamp.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* Reply + bookmark for NEO messages (right side) */}
      {!isUser && (
        <View style={styles.neoActions}>
          <TouchableOpacity
            onPress={() => onReply(message)}
            activeOpacity={0.7}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CornerUpLeft size={14} color={theme.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleBookmark}
            activeOpacity={0.7}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSaved
              ? <BookmarkCheck size={15} color={theme.text.tertiary} strokeWidth={2} />
              : <Bookmark size={15} color={theme.text.tertiary} strokeWidth={2} />
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing[4],
    gap: Spacing[2],
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowNeo: {
    justifyContent: 'flex-start',
  },
  bubbleWrap: {
    maxWidth: '80%',
    gap: Spacing[1],
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapNeo: {
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    letterSpacing: 0.6,
    marginBottom: 4,
    marginHorizontal: Spacing[1],
  },
  bubble: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  bubbleUser: {
    borderRadius: Radius['2xl'],
    borderBottomRightRadius: Radius.xs,
  },
  bubbleNeo: {
    borderRadius: Radius['2xl'],
    borderBottomLeftRadius: Radius.xs,
    borderWidth: 1,
  },
  quotedBlock: {
    borderLeftWidth: 3,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: 2,
  },
  quotedSender: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  quotedText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },
  text: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.55,
  },
  time: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
    marginHorizontal: Spacing[1],
  },
  metricCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing[4],
    gap: 4,
    marginTop: Spacing[2],
    width: '100%',
  },
  metricLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  neoActions: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing[3],
  },
  actionBtn: {
    padding: 2,
  },
  actionBtnCenter: {
    alignSelf: 'center',
  },
  reminderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing[3],
    marginTop: Spacing[2],
    width: '100%',
  },
  reminderEmoji: {
    fontSize: 16,
  },
  reminderContent: {
    flex: 1,
    gap: 2,
  },
  reminderLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  reminderNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },
});
