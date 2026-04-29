import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Share,
} from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius } from '../../theme';
import Icon from '../icons/Icon';

const BENEFITS = [
  '💬 Receives prompts on how to support you',
  '📌 Access to highlights you choose to share',
  '🛍️ Can contribute to your NeoStore wishlist',
  '🚨 Alerted in emergencies alongside your contacts',
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PartnerInviteModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { user, updateUser } = useAppContext();
  const [partnerName, setPartnerName] = useState(user?.partnerName ?? '');

  const isInvited = user?.partnerStatus === 'invited';
  const isActive = user?.partnerStatus === 'active';

  const handleInvite = async () => {
    const name = partnerName.trim();
    if (name) {
      updateUser({ partnerName: name });
    }
    try {
      await Share.share({
        message: `${user?.name ?? 'Your partner'} has invited you to join their AskNeo care circle.\n\nDownload AskNeo to follow their journey, get support prompts, and be alerted in emergencies.\n\nInvite code: ${(user?.name ?? 'NEO').toUpperCase().slice(0, 4)}2025`,
      });
      updateUser({ partnerName: name || user?.partnerName, partnerStatus: 'invited' });
    } catch {}
  };

  const markActive = () => {
    updateUser({ partnerStatus: 'active' });
  };

  const handleClose = () => {
    setPartnerName(user?.partnerName ?? '');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={[styles.sheet, { backgroundColor: theme.bg.surface }]}>
          <View style={[styles.handle, { backgroundColor: theme.border.default }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text.primary }]}>
              {isActive ? 'Partner connected' : isInvited ? 'Invite sent' : 'Invite your partner'}
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
              <Icon name="close" size={20} color={theme.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Active state */}
          {isActive && (
            <View style={[styles.statusBanner, { backgroundColor: theme.accent.sage.bg, borderColor: theme.accent.sage.border }]}>
              <Icon name="check_circle" size={20} color={theme.accent.sage.text} />
              <Text style={[styles.statusText, { color: theme.accent.sage.text }]}>
                {user?.partnerName ?? 'Your partner'} has joined AskNeo
              </Text>
            </View>
          )}

          {/* Invited state */}
          {isInvited && !isActive && (
            <>
              <View style={[styles.statusBanner, { backgroundColor: theme.accent.gold.bg, borderColor: theme.accent.gold.border }]}>
                <Icon name="time" size={20} color={theme.accent.gold.text} />
                <Text style={[styles.statusText, { color: theme.accent.gold.text }]}>
                  Waiting for {user?.partnerName ?? 'partner'} to accept
                </Text>
              </View>
              <TouchableOpacity onPress={handleInvite} activeOpacity={0.7} style={[styles.resendBtn, { borderColor: theme.border.default }]}>
                <Icon name="send" size={14} color={theme.text.brand} />
                <Text style={[styles.resendLabel, { color: theme.text.brand }]}>Resend invite</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={markActive} activeOpacity={0.7} style={[styles.activeBtn, { backgroundColor: theme.interactive.primary }]}>
                <Icon name="check_circle" size={16} color="#fff" />
                <Text style={styles.activeBtnLabel}>Partner joined — mark as active</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Default: not yet invited */}
          {!isInvited && !isActive && (
            <>
              <View style={[styles.benefitsCard, { backgroundColor: theme.bg.app, borderColor: theme.border.subtle }]}>
                {BENEFITS.map(b => (
                  <Text key={b} style={[styles.benefit, { color: theme.text.primary }]}>{b}</Text>
                ))}
              </View>

              <View style={styles.fields}>
                <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Partner's name (optional)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.app }]}
                  placeholder="e.g. Emeka"
                  placeholderTextColor={theme.text.tertiary}
                  value={partnerName}
                  onChangeText={setPartnerName}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                onPress={handleInvite}
                activeOpacity={0.85}
                style={[styles.inviteBtn, { backgroundColor: theme.interactive.primary }]}
              >
                <Icon name="send" size={16} color="#fff" />
                <Text style={styles.inviteBtnLabel}>Send invite link</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing[2],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
  },
  statusText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingVertical: Spacing[3],
  },
  resendLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  activeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
  },
  activeBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  benefitsCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  benefit: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  fields: { gap: Spacing[2] },
  fieldLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 50,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    marginTop: Spacing[2],
  },
  inviteBtnLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
});
