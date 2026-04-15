import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';

interface Props {
  navigation: any;
  route: any;
}

export default function ArticleScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { article } = route.params;

  // Render body: lines starting/ending with ** are bold headings
  const renderBody = () => {
    const lines = article.body.split('\n');
    return lines.map((line: string, i: number) => {
      if (line.trim() === '') return <View key={i} style={{ height: Spacing[3] }} />;
      const isBold = line.startsWith('**') && line.endsWith('**');
      const text = isBold ? line.slice(2, -2) : line;
      return (
        <Text
          key={i}
          style={[
            isBold ? styles.bodyBold : styles.body,
            { color: isBold ? theme.text.primary : theme.text.secondary },
          ]}
        >
          {text}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* Hero — emoji is always rendered as fallback, image layers on top */}
        <View style={[styles.hero, { backgroundColor: article.coverBg, paddingTop: insets.top + Spacing[2] }]}>
          <Text style={styles.heroEmoji}>{article.coverEmoji}</Text>
          <Image
            source={{ uri: article.coverImage }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        </View>

        {/* Floating back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.backBtn, { top: insets.top + Spacing[3], backgroundColor: theme.bg.surface }]}
        >
          <ArrowLeft size={18} color={theme.text.primary} strokeWidth={2} />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>

          {/* Tag + read time */}
          <View style={styles.metaRow}>
            <View style={[styles.tagPill, { backgroundColor: theme.bg.subtle }]}>
              <Text style={[styles.tagText, { color: theme.text.brand }]}>{article.tag}</Text>
            </View>
            <View style={styles.readTime}>
              <Clock size={12} color={theme.text.tertiary} strokeWidth={2} />
              <Text style={[styles.readTimeText, { color: theme.text.tertiary }]}>
                {article.readMinutes} min read
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text.primary }]}>{article.title}</Text>

          {/* Author */}
          <View style={[styles.authorRow, { borderTopColor: theme.border.subtle, borderBottomColor: theme.border.subtle }]}>
            <View style={[styles.avatarWrap, { backgroundColor: article.author.avatarBg }]}>
              <Text style={styles.avatarInitials}>{article.author.initials}</Text>
              <Image
                source={{ uri: article.author.image }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            </View>
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: theme.text.primary }]}>{article.author.name}</Text>
              <Text style={[styles.authorRole, { color: theme.text.tertiary }]}>{article.author.role}</Text>
            </View>
          </View>

          {/* Excerpt callout */}
          <View style={[styles.excerptBlock, { backgroundColor: theme.bg.subtle, borderLeftColor: theme.interactive.primary }]}>
            <Text style={[styles.excerpt, { color: theme.text.primary }]}>{article.excerpt}</Text>
          </View>

          {/* Body */}
          <View style={styles.bodyBlock}>
            {renderBody()}
          </View>

          {/* Ask Neo CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Tabs', {
              screen: 'AskNeo',
              params: { prompt: { id: `article-${article.id}`, title: article.title, body: article.excerpt } },
            })}
            style={[styles.ctaBtn, { backgroundColor: theme.interactive.primary }]}
          >
            <MessageCircle size={18} color="#fff" strokeWidth={2} />
            <Text style={styles.ctaText}>Ask Neo about this</Text>
          </TouchableOpacity>

          <View style={{ height: insets.bottom + Spacing[6] }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 72,
    lineHeight: 86,
  },
  backBtn: {
    position: 'absolute',
    left: Spacing[5],
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    gap: Spacing[5],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagPill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  tagText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  readTimeText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  title: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size['2xl'],
    lineHeight: Typography.size['2xl'] * 1.3,
    letterSpacing: -0.3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarInitials: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    color: '#5C0217',
  },
  authorInfo: { flex: 1, gap: 2 },
  authorName: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  authorRole: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  excerptBlock: {
    borderLeftWidth: 3,
    paddingLeft: Spacing[4],
    paddingVertical: Spacing[3],
    paddingRight: Spacing[3],
    borderRadius: Radius.sm,
  },
  excerpt: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  bodyBlock: { gap: Spacing[1] },
  body: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.75,
  },
  bodyBold: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
    marginTop: Spacing[3],
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    borderRadius: Radius.xl,
  },
  ctaText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
});
