import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Minus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius, Shadow } from '../../theme';
import { bundleCatalog } from '../../data/neostore';

const CATEGORIES = ['Feeding', 'Clothing', 'Hygiene', 'Health', 'Comfort', 'Sleep'];

interface Props {
  visible: boolean;
  initialSelection: Record<string, number>;
  onClose: () => void;
  onConfirm: (selection: Record<string, number>, total: number) => void;
}

export default function BuildBundleModal({ visible, initialSelection, onClose, onConfirm }: Props) {
  const { theme } = useTheme();
  const [selection, setSelection] = useState<Record<string, number>>(initialSelection);

  // Sync when modal re-opens with updated initial selection
  useEffect(() => {
    if (visible) setSelection(initialSelection);
  }, [visible]);

  const add = (id: string) => setSelection(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const remove = (id: string) => setSelection(prev => {
    const next = { ...prev };
    if ((next[id] ?? 0) <= 1) delete next[id];
    else next[id]--;
    return next;
  });

  const itemCount = Object.values(selection).reduce((s, q) => s + q, 0);
  const total = bundleCatalog.reduce((sum, item) => sum + item.price * (selection[item.id] ?? 0), 0);

  const isEditing = Object.keys(initialSelection).length > 0;

  const handleConfirm = () => {
    onConfirm(selection, total);
    onClose();
  };

  const handleRemove = () => {
    onConfirm({}, 0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />

        <View style={[styles.sheet, { backgroundColor: theme.bg.app }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.text.primary }]}>Build Your Bundle</Text>
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                {itemCount > 0
                  ? `${itemCount} item${itemCount !== 1 ? 's' : ''} · ₦${total.toLocaleString()}`
                  : 'Select what you need'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={[styles.closeBtn, { backgroundColor: theme.bg.subtle }]}
            >
              <X size={18} color={theme.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Item list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {CATEGORIES.map(cat => {
              const items = bundleCatalog.filter(i => i.category === cat);
              return (
                <View key={cat} style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{cat}</Text>
                  {items.map(item => {
                    const qty = selection[item.id] ?? 0;
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.itemRow,
                          {
                            backgroundColor: theme.bg.surface,
                            borderColor: qty > 0 ? theme.interactive.primary : theme.border.subtle,
                          },
                        ]}
                      >
                        <View style={styles.itemInfo}>
                          <Text style={[styles.itemName, { color: theme.text.primary }]}>{item.name}</Text>
                          <Text style={[styles.itemPrice, { color: theme.text.brand }]}>
                            ₦{item.price.toLocaleString()}
                          </Text>
                        </View>

                        {qty === 0 ? (
                          <TouchableOpacity
                            onPress={() => add(item.id)}
                            activeOpacity={0.8}
                            style={[styles.addBtn, { backgroundColor: theme.interactive.primary }]}
                          >
                            <Plus size={15} color="#fff" strokeWidth={2.5} />
                          </TouchableOpacity>
                        ) : (
                          <View style={[styles.qtyControl, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
                            <TouchableOpacity onPress={() => remove(item.id)} style={styles.qtyBtn} activeOpacity={0.7}>
                              <Minus size={13} color={theme.text.brand} strokeWidth={2.5} />
                            </TouchableOpacity>
                            <Text style={[styles.qtyText, { color: theme.text.primary }]}>{qty}</Text>
                            <TouchableOpacity onPress={() => add(item.id)} style={styles.qtyBtn} activeOpacity={0.7}>
                              <Plus size={13} color={theme.text.brand} strokeWidth={2.5} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: theme.border.subtle, backgroundColor: theme.bg.surface }]}>
            <View style={styles.footerInner}>
              <View>
                <Text style={[styles.footerLabel, { color: theme.text.secondary }]}>Bundle total</Text>
                <Text style={[styles.footerTotal, { color: theme.text.primary }]}>
                  {total > 0 ? `₦${total.toLocaleString()}` : '₦0'}
                </Text>
              </View>
              <View style={styles.footerActions}>
                {isEditing && (
                  <TouchableOpacity onPress={handleRemove} activeOpacity={0.7} style={styles.removeBtn}>
                    <Text style={[styles.removeBtnLabel, { color: theme.text.tertiary }]}>Remove</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleConfirm}
                  activeOpacity={0.85}
                  disabled={itemCount === 0}
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: itemCount > 0 ? theme.interactive.primary : theme.border.subtle },
                  ]}
                >
                  <Text style={styles.confirmBtnLabel}>
                    {isEditing ? 'Update bundle' : 'Add to cart'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  headerText: { gap: 2 },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    gap: Spacing[5],
  },
  section: { gap: Spacing[2] },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: Spacing[1],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    gap: Spacing[3],
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  itemPrice: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    overflow: 'hidden',
    flexShrink: 0,
  },
  qtyBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  qtyText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    minWidth: 22,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  footerLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  footerTotal: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xl,
    letterSpacing: -0.3,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  removeBtn: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
  },
  removeBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  confirmBtn: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    borderRadius: Radius.full,
  },
  confirmBtnLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
});
