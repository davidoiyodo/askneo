import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow, Colors } from '../../theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BuildBundleModal from '../../components/modals/BuildBundleModal';
import { bundles, p2pItems, bundleCatalog } from '../../data/neostore';
import type { CustomBundle } from '../../hooks/useAppContext';

// ── Cart item row ──────────────────────────────────────────────────────────────
function CartItemRow({
  name, label, unitPriceLabel, lineTotal, qty,
  onAdd, onRemove, onDelete, theme,
}: {
  name: string;
  label?: string;
  unitPriceLabel: string;
  lineTotal: number;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onDelete: () => void;
  theme: any;
}) {
  return (
    <View style={[styles.itemRow, { borderBottomColor: theme.border.subtle }]}>
      <View style={styles.itemMain}>
        <Text style={[styles.itemName, { color: theme.text.primary }]} numberOfLines={2}>{name}</Text>
        {label && <Text style={[styles.itemLabel, { color: theme.text.tertiary }]}>{label}</Text>}
        <Text style={[styles.itemUnitPrice, { color: theme.text.secondary }]}>{unitPriceLabel}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemLineTotal, { color: theme.text.primary }]}>
          ₦{lineTotal.toLocaleString()}
        </Text>
        <View style={styles.itemActions}>
          <View style={[styles.qtyControl, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
            <TouchableOpacity onPress={onRemove} style={styles.qtyBtn} activeOpacity={0.7}>
              <Minus size={13} color={theme.text.brand} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: theme.text.primary }]}>{qty}</Text>
            <TouchableOpacity onPress={onAdd} style={styles.qtyBtn} activeOpacity={0.7}>
              <Plus size={13} color={theme.text.brand} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.deleteBtn}>
            <Trash2 size={15} color={theme.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, theme }: { title: string; theme: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{title}</Text>
  );
}

export default function CartScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const {
    user, cart, customBundle,
    addToCart, removeFromCart, deleteFromCart, clearCart, setCustomBundle,
  } = useAppContext();

  const [buildBundleVisible, setBuildBundleVisible] = useState(false);
  const [deliveryName, setDeliveryName] = useState(user?.name ?? '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.doctorPhone ? '' : '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');

  const cartEntries = Object.entries(cart);
  const bundleEntries = cartEntries.filter(([id]) => id.startsWith('bundle-'));
  const shopEntries   = cartEntries.filter(([id]) => id.startsWith('bi-'));
  const p2pEntries    = cartEntries.filter(([id]) => id.startsWith('p2p-'));

  const isEmpty = cartEntries.length === 0 && !customBundle;

  // Totals
  const bundleSubtotal = bundleEntries.reduce((sum, [id, qty]) => {
    const b = bundles.find(b => b.id === id);
    return sum + (b?.price ?? 0) * qty;
  }, 0);

  const shopSubtotal = shopEntries.reduce((sum, [id, qty]) => {
    const item = bundleCatalog.find(i => i.id === id);
    return sum + (item?.price ?? 0) * qty;
  }, 0);

  const p2pLogisticsTotal = p2pEntries.reduce((sum, [id, qty]) => {
    const item = p2pItems.find(i => i.id === id);
    return sum + (item?.logisticsPrice ?? 0) * qty;
  }, 0);

  const customBundleTotal = customBundle?.total ?? 0;
  const subtotal = bundleSubtotal + shopSubtotal + p2pLogisticsTotal + customBundleTotal;

  const customBundleItemCount = customBundle
    ? Object.values(customBundle.selection).reduce((s, q) => s + q, 0)
    : 0;

  const handlePlaceOrder = () => {
    if (!deliveryName.trim()) {
      Alert.alert('Missing info', 'Please enter your full name.');
      return;
    }
    if (!deliveryPhone.trim()) {
      Alert.alert('Missing info', 'Please enter your phone number.');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      Alert.alert('Missing info', 'Please enter your delivery address.');
      return;
    }
    Alert.alert(
      'Order received! 🎉',
      `Thanks ${deliveryName.split(' ')[0]}! Your order of ₦${subtotal.toLocaleString()} has been received. We'll contact you on ${deliveryPhone} to confirm your ${deliveryType === 'pickup' ? 'pickup' : 'delivery'}.`,
      [{
        text: 'Done',
        onPress: () => {
          clearCart();
          navigation.navigate('Tabs');
        },
      }]
    );
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
        <View style={styles.emptyWrapper}>
          {/* Back button */}
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
            >
              <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
              <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Centered content */}
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.bg.subtle }]}>
              <ShoppingBag size={36} color={theme.text.tertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>Your cart is empty</Text>
            <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
              Head back to NeoStore to add bundles, individual items, or claim P2P gifts.
            </Text>
            <Button label="Browse NeoStore" onPress={() => navigation.goBack()} style={{ alignSelf: 'center' }} />
          </View>

          {/* Balancer — same height as topRow so content sits on true vertical centre */}
          <View style={styles.emptyBalancer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
            >
              <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
              <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pageHeader}>
            <Text style={[styles.pageTitle, { color: theme.text.primary }]}>Your Cart</Text>
            <Text style={[styles.pageSubtitle, { color: theme.text.secondary }]}>
              {cartEntries.length + (customBundle ? 1 : 0)} line{cartEntries.length + (customBundle ? 1 : 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* ── Curated Bundles ──────────────────────────────────────────── */}
          {bundleEntries.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Curated Bundles" theme={theme} />
              <Card style={styles.sectionCard} padding="none">
                {bundleEntries.map(([id, qty]) => {
                  const b = bundles.find(b => b.id === id);
                  if (!b) return null;
                  return (
                    <CartItemRow
                      key={id}
                      theme={theme}
                      name={b.name}
                      unitPriceLabel={`₦${b.price.toLocaleString()} each`}
                      lineTotal={b.price * qty}
                      qty={qty}
                      onAdd={() => addToCart(id)}
                      onRemove={() => removeFromCart(id)}
                      onDelete={() => deleteFromCart(id)}
                    />
                  );
                })}
              </Card>
            </View>
          )}

          {/* ── Custom Bundle ────────────────────────────────────────────── */}
          {customBundle && (
            <View style={styles.section}>
              <SectionHeader title="Custom Bundle" theme={theme} />
              <Card style={styles.sectionCard} padding="none">
                <View style={[styles.customBundleRow, { borderBottomColor: 'transparent' }]}>
                  <View style={styles.customBundleInfo}>
                    <Text style={[styles.itemName, { color: theme.text.primary }]}>Custom Bundle</Text>
                    <Text style={[styles.itemLabel, { color: theme.text.tertiary }]}>
                      {customBundleItemCount} item{customBundleItemCount !== 1 ? 's' : ''} selected
                    </Text>
                    <TouchableOpacity onPress={() => setBuildBundleVisible(true)} activeOpacity={0.7}>
                      <Text style={[styles.editLink, { color: theme.text.brand }]}>Edit bundle →</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.customBundleRight}>
                    <Text style={[styles.itemLineTotal, { color: theme.text.primary }]}>
                      ₦{customBundle.total.toLocaleString()}
                    </Text>
                    <TouchableOpacity onPress={() => setCustomBundle(null)} activeOpacity={0.7} style={styles.deleteBtn}>
                      <Trash2 size={15} color={theme.text.tertiary} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* ── Individual Items ─────────────────────────────────────────── */}
          {shopEntries.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Individual Items" theme={theme} />
              <Card style={styles.sectionCard} padding="none">
                {shopEntries.map(([id, qty]) => {
                  const item = bundleCatalog.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <CartItemRow
                      key={id}
                      theme={theme}
                      name={item.name}
                      unitPriceLabel={`₦${item.price.toLocaleString()} each`}
                      lineTotal={item.price * qty}
                      qty={qty}
                      onAdd={() => addToCart(id)}
                      onRemove={() => removeFromCart(id)}
                      onDelete={() => deleteFromCart(id)}
                    />
                  );
                })}
              </Card>
            </View>
          )}

          {/* ── P2P Gifts ────────────────────────────────────────────────── */}
          {p2pEntries.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="P2P Gifts" theme={theme} />
              <Card style={styles.sectionCard} padding="none">
                {p2pEntries.map(([id, qty]) => {
                  const item = p2pItems.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <CartItemRow
                      key={id}
                      theme={theme}
                      name={item.name}
                      label={`From ${item.p2pUser} · ${item.p2pLocation}`}
                      unitPriceLabel={`Item free · ₦${(item.logisticsPrice ?? 0).toLocaleString()} logistics`}
                      lineTotal={(item.logisticsPrice ?? 0) * qty}
                      qty={qty}
                      onAdd={() => addToCart(id)}
                      onRemove={() => removeFromCart(id)}
                      onDelete={() => deleteFromCart(id)}
                    />
                  );
                })}
              </Card>
            </View>
          )}

          {/* ── Order Summary ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Order Summary" theme={theme} />
            <Card style={styles.sectionCard} padding="none">
              {bundleSubtotal > 0 && (
                <View style={[styles.summaryRow, { borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.summaryLabel, { color: theme.text.secondary }]}>Curated bundles</Text>
                  <Text style={[styles.summaryValue, { color: theme.text.primary }]}>₦{bundleSubtotal.toLocaleString()}</Text>
                </View>
              )}
              {customBundleTotal > 0 && (
                <View style={[styles.summaryRow, { borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.summaryLabel, { color: theme.text.secondary }]}>Custom bundle</Text>
                  <Text style={[styles.summaryValue, { color: theme.text.primary }]}>₦{customBundleTotal.toLocaleString()}</Text>
                </View>
              )}
              {shopSubtotal > 0 && (
                <View style={[styles.summaryRow, { borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.summaryLabel, { color: theme.text.secondary }]}>Individual items</Text>
                  <Text style={[styles.summaryValue, { color: theme.text.primary }]}>₦{shopSubtotal.toLocaleString()}</Text>
                </View>
              )}
              {p2pLogisticsTotal > 0 && (
                <View style={[styles.summaryRow, { borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.summaryLabel, { color: theme.text.secondary }]}>P2P logistics</Text>
                  <Text style={[styles.summaryValue, { color: theme.text.primary }]}>₦{p2pLogisticsTotal.toLocaleString()}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotalRow, { borderBottomColor: 'transparent', borderTopColor: theme.border.subtle }]}>
                <Text style={[styles.summaryTotalLabel, { color: theme.text.primary }]}>Total</Text>
                <Text style={[styles.summaryTotalValue, { color: theme.text.primary }]}>₦{subtotal.toLocaleString()}</Text>
              </View>
            </Card>
          </View>

          {/* ── Delivery Details ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Delivery Details" theme={theme} />
            <Card style={styles.sectionCard} padding="none">
              <View style={styles.formBody}>
                {/* Delivery type toggle */}
                <View style={[styles.toggleRow, { backgroundColor: theme.bg.subtle }]}>
                  {(['delivery', 'pickup'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setDeliveryType(type)}
                      activeOpacity={0.8}
                      style={[
                        styles.toggleOption,
                        deliveryType === type && [styles.toggleOptionActive, { backgroundColor: theme.bg.surface, ...Shadow.sm }],
                      ]}
                    >
                      <Text style={[
                        styles.toggleLabel,
                        { color: deliveryType === type ? theme.text.brand : theme.text.tertiary },
                      ]}>
                        {type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.fieldGroup, { borderColor: theme.border.subtle }]}>
                  {/* Full name */}
                  <View style={[styles.field, { borderBottomColor: theme.border.subtle }]}>
                    <Text style={[styles.fieldLabel, { color: theme.text.tertiary }]}>Full name</Text>
                    <TextInput
                      style={[styles.fieldInput, { color: theme.text.primary }]}
                      placeholder="Your full name"
                      placeholderTextColor={theme.text.tertiary}
                      value={deliveryName}
                      onChangeText={setDeliveryName}
                      autoCapitalize="words"
                    />
                  </View>
                  {/* Phone */}
                  <View style={[styles.field, { borderBottomColor: deliveryType === 'delivery' ? theme.border.subtle : 'transparent' }]}>
                    <Text style={[styles.fieldLabel, { color: theme.text.tertiary }]}>Phone number</Text>
                    <TextInput
                      style={[styles.fieldInput, { color: theme.text.primary }]}
                      placeholder="+234 or +233..."
                      placeholderTextColor={theme.text.tertiary}
                      value={deliveryPhone}
                      onChangeText={setDeliveryPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  {/* Address — only for delivery */}
                  {deliveryType === 'delivery' && (
                    <View style={[styles.field, { borderBottomColor: 'transparent' }]}>
                      <Text style={[styles.fieldLabel, { color: theme.text.tertiary }]}>Delivery address</Text>
                      <TextInput
                        style={[styles.fieldInput, styles.fieldInputMultiline, { color: theme.text.primary }]}
                        placeholder="Street, city, state"
                        placeholderTextColor={theme.text.tertiary}
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        multiline
                        numberOfLines={2}
                      />
                    </View>
                  )}
                </View>

                {deliveryType === 'pickup' && (
                  <Text style={[styles.pickupNote, { color: theme.text.tertiary }]}>
                    We'll send you pickup location details after confirming your order.
                  </Text>
                )}
              </View>
            </Card>
          </View>

          {/* ── Place Order ──────────────────────────────────────────────── */}
          <Button
            label={`Place Order · ₦${subtotal.toLocaleString()}`}
            onPress={handlePlaceOrder}
            fullWidth
            size="lg"
          />

          <Text style={[styles.disclaimer, { color: theme.text.tertiary }]}>
            By placing your order you agree to be contacted by an AskNeo team member to confirm delivery details and payment.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <BuildBundleModal
        visible={buildBundleVisible}
        initialSelection={customBundle?.selection ?? {}}
        onClose={() => setBuildBundleVisible(false)}
        onConfirm={(selection, total) => {
          const hasItems = Object.keys(selection).length > 0;
          setCustomBundle(hasItems ? { selection, total } : null);
        }}
      />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pageHeader: { gap: 2 },
  pageTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  section: { gap: Spacing[2] },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing[1],
  },
  sectionCard: { overflow: 'hidden', padding: 0 },

  // Cart item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    gap: Spacing[3],
  },
  itemMain: { flex: 1, gap: 2 },
  itemName: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  itemLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  itemUnitPrice: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: Spacing[2],
  },
  itemLineTotal: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qtyBtn: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
  },
  qtyText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xs,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: Spacing[1],
  },

  // Custom bundle row
  customBundleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  customBundleInfo: { flex: 1, gap: 4 },
  customBundleRight: {
    alignItems: 'flex-end',
    gap: Spacing[2],
  },
  editLink: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },

  // Order summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  summaryValue: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    paddingVertical: Spacing[4],
  },
  summaryTotalLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  summaryTotalValue: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    letterSpacing: -0.3,
  },

  // Delivery form
  formBody: {
    padding: Spacing[5],
    gap: Spacing[4],
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
    gap: 2,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  toggleOptionActive: { borderRadius: Radius.full },
  toggleLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  fieldGroup: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  field: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    gap: 3,
  },
  fieldLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.xs,
  },
  fieldInput: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    paddingVertical: 0,
  },
  fieldInputMultiline: {
    minHeight: 44,
  },
  pickupNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.6,
    textAlign: 'center',
  },
  disclaimer: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.7,
    textAlign: 'center',
  },

  // Empty state
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[6],
  },
  emptyBalancer: {
    height: 36, // mirrors topRow height so emptyState centres on the full screen
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
    marginBottom: Spacing[2],
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
    marginBottom: Spacing[2],
  },
});
