import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext, EmergencyContact } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddContactModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { user, updateUser } = useAppContext();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Please enter at least a name and phone number.');
      return;
    }
    const contacts = user?.emergencyContacts ?? [];
    if (contacts.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 emergency contacts.');
      return;
    }
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      relation: relation.trim() || 'Contact',
    };
    updateUser({ emergencyContacts: [...contacts, newContact] });
    setName('');
    setPhone('');
    setRelation('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setRelation('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={[styles.sheet, { backgroundColor: theme.bg.surface }]}>
          <View style={[styles.handle, { backgroundColor: theme.border.default }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text.primary }]}>Add emergency contact</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
              <X size={20} color={theme.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            This person will be alerted if you trigger an emergency alert from AskNeo.
          </Text>

          <View style={styles.fields}>
            <TextInput
              style={[styles.input, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.app }]}
              placeholder="Full name"
              placeholderTextColor={theme.text.tertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <TextInput
              style={[styles.input, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.app }]}
              placeholder="Phone number"
              placeholderTextColor={theme.text.tertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
            <TextInput
              style={[styles.input, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.app }]}
              placeholder="Relationship (e.g. Husband, Mum, Doctor)"
              placeholderTextColor={theme.text.tertiary}
              value={relation}
              onChangeText={setRelation}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>

          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.85}
            style={[styles.addBtn, { backgroundColor: theme.interactive.primary }]}
          >
            <Plus size={16} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addBtnLabel}>Add contact</Text>
          </TouchableOpacity>
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
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    marginTop: -Spacing[2],
  },
  fields: { gap: Spacing[3] },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 50,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    paddingVertical: Spacing[4],
    marginTop: Spacing[2],
  },
  addBtnLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
});
