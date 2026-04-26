import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius, Shadow, Colors } from '../../theme';
import Button from '../../components/ui/Button';
import OnboardingBackButton from '../../components/ui/OnboardingBackButton';
import { EmergencyContact, UserStage } from '../../hooks/useAppContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { stage: UserStage; name: string; email: string; date: string; inviteCode: string; password: string } };
};

export default function EmergencyContactsScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { stage, name, email, date, inviteCode, password } = route.params;
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Missing info', 'Please enter at least a name and phone number.');
      return;
    }
    if (contacts.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 emergency contacts.');
      return;
    }
    setContacts(prev => [
      ...prev,
      { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim(), relation: newRelation.trim() || 'Contact' },
    ]);
    setNewName('');
    setNewPhone('');
    setNewRelation('');
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <OnboardingBackButton onPress={() => navigation.goBack()} />

          <View style={styles.header}>
            <Text style={[styles.step, { color: theme.text.link }]}>Step 3 of 4</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Emergency contacts</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Add up to 5 trusted people. In an emergency, Neo can send them an alert with your location and what to do.
            </Text>
          </View>

          {contacts.length > 0 && (
            <View style={styles.contactList}>
              {contacts.map(c => (
                <View key={c.id} style={[styles.contactChip, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}>
                  <View style={[styles.contactAvatar, { backgroundColor: theme.interactive.primary }]}>
                    <Text style={styles.contactAvatarText}>{c.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: theme.text.primary }]}>{c.name}</Text>
                    <Text style={[styles.contactMeta, { color: theme.text.secondary }]}>{c.relation} · {c.phone}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeContact(c.id)} style={styles.removeBtn}>
                    <Text style={[styles.removeText, { color: theme.text.tertiary }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {contacts.length < 5 && (
            <View style={[styles.addForm, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <Text style={[styles.addFormLabel, { color: theme.text.secondary }]}>Add a contact</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border.default, color: theme.text.primary, backgroundColor: theme.bg.app }]}
                placeholder="Full name"
                placeholderTextColor={theme.text.tertiary}
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                style={[styles.input, { borderColor: theme.border.default, color: theme.text.primary, backgroundColor: theme.bg.app }]}
                placeholder="Phone number"
                placeholderTextColor={theme.text.tertiary}
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, { borderColor: theme.border.default, color: theme.text.primary, backgroundColor: theme.bg.app }]}
                placeholder="Relationship (e.g. Husband, Mum, Doctor)"
                placeholderTextColor={theme.text.tertiary}
                value={newRelation}
                onChangeText={setNewRelation}
              />
              <Button label={`+ Add contact (${contacts.length}/5)`} onPress={addContact} variant="secondary" size="sm" />
            </View>
          )}

          <View style={styles.actions}>
            <Button
              label="Continue"
              onPress={() => navigation.navigate('PartnerInvite', { stage, name, email, date, inviteCode, password, emergencyContacts: contacts })}
              fullWidth
            />
            {contacts.length === 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('PartnerInvite', { stage, name, email, date, inviteCode, password, emergencyContacts: [] })}>
                <Text style={[styles.skip, { color: theme.text.link }]}>Skip for now</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[6],
  },
  header: { gap: Spacing[2] },
  step: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
  },
  contactList: { gap: Spacing[2] },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  contactInfo: { flex: 1 },
  contactName: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  contactMeta: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  removeBtn: { padding: Spacing[1] },
  removeText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  addForm: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  addFormLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    marginBottom: Spacing[1],
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 48,
  },
  actions: { gap: Spacing[4], alignItems: 'center' },
  skip: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
});
