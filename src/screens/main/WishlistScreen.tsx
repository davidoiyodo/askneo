import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow, Colors } from '../../theme';
import Button from '../../components/ui/Button';
import Icon from '../../components/icons/Icon';

export default function WishlistScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user, wishlist, removeFromWishlist } = useAppContext();

  const total = wishlist.reduce((sum, item) => sum + item.price, 0);
  const currency = wishlist[0]?.currency ?? '₦';
  const hasCustom = wishlist.some(item => item.price === 0);

  const handleRemove = (id: string, name: string) => {
    Alert.alert(
      'Remove item',
      `Remove "${name}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWishlist(id) },
      ]
    );
  };

  const handleShare = () => {
    const itemLines = wishlist
      .map(item => item.price === 0
        ? `• ${item.name} — Custom pricing`
        : `• ${item.name} — ${item.currency}${item.price.toLocaleString()}`)
      .join('\n');

    const totalLine = hasCustom && total === 0
      ? 'Custom pricing'
      : `${currency}${total.toLocaleString()}`;

    const message = `🎁 ${user?.name ?? 'My'}'s Baby Wishlist\n\nThese are the items I'd love to receive as gifts:\n\n${itemLines}\n\nTotal value: ${totalLine}\n\nFind these and more on AskNeo 💙`;

    Share.share({ message });
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (wishlist.length === 0) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
        <View style={styles.emptyWrapper}>
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
            >
              <Icon name="left" size={20} color={theme.text.primary} />
              <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.bg.subtle }]}>
              <Icon name="gift" size={36} color={theme.text.tertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>Your wishlist is empty</Text>
            <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
              Browse NeoStore and tap the ♡ on any item to save it here.
            </Text>
            <Button label="Browse NeoStore" onPress={() => navigation.goBack()} style={{ alignSelf: 'center' }} />
          </View>
          <View style={styles.emptyBalancer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
        >
          <Icon name="left" size={20} color={theme.text.primary} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>My Wishlist</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Items you're hoping to receive as gifts.
          </Text>
        </View>

        <View style={[styles.summaryRow, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <Text style={[styles.summaryText, { color: theme.text.secondary }]}>
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} · Total: {currency}{total.toLocaleString()}{hasCustom ? ' · Incl. custom items' : ''}
          </Text>
        </View>

        <View style={styles.itemList}>
          {wishlist.map(item => (
            <View
              key={item.id}
              style={[styles.itemCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle, ...Shadow.sm }]}
            >
              <View style={styles.itemMain}>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemName, { color: theme.text.primary }]}>{item.name}</Text>
                  <Text style={[styles.itemDesc, { color: theme.text.secondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={[styles.itemPrice, { color: theme.interactive.primary }]}>
                    {item.price === 0 ? 'Custom pricing' : `${item.currency}${item.price.toLocaleString()}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id, item.name)}
                  activeOpacity={0.7}
                  style={styles.trashBtn}
                >
                  <Icon name="delete_2" size={18} color={Colors.danger[500]} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.85}
          style={[styles.shareBtn, { backgroundColor: theme.interactive.primary }]}
        >
          <Icon name="share_2" size={18} color="#fff" />
          <Text style={styles.shareBtnLabel}>Share Wishlist</Text>
        </TouchableOpacity>

        <Text style={[styles.tip, { color: theme.text.tertiary }]}>
          Tip: Share this link with friends and family so they can gift you items directly.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  header: { gap: Spacing[1] },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
  },
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[6],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyBalancer: {
    height: 36,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    gap: Spacing[4],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xl,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    textAlign: 'center',
  },
  summaryRow: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  summaryText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  itemList: { gap: Spacing[3] },
  itemCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  itemContent: { flex: 1, gap: Spacing[1] },
  itemName: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  itemDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  itemPrice: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    marginTop: Spacing[1],
  },
  trashBtn: {
    paddingTop: 2,
  },
  shareBtn: {
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  shareBtnLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
  tip: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.7,
    marginTop: -Spacing[2],
  },
});
