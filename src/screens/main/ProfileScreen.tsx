import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Pencil, Check, X, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext, EmergencyContact } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius } from '../../theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DatePickerField from '../../components/ui/DatePickerField';
import AddContactModal from '../../components/modals/AddContactModal';
import PartnerInviteModal from '../../components/modals/PartnerInviteModal';
import { getBabyAgeLabel, getGestationalWeek } from '../../utils/chatEngine';

const SUBSCRIPTION_FEATURES = {
  free: [
    'AI chat with basic triage',
    'Timeline prompts (limited)',
    '2 emergency contacts',
  ],
  plus: [
    'Full triage + care routing',
    'Unlimited timeline prompts',
    '5 emergency contacts',
    'Chat highlights & summaries',
    'Partner access',
    'Care Circle (up to 8 members)',
    'NeoStore access',
  ],
};

function getProfileDateRange(stage: string): { min: Date; max: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (stage) {
    case 'pregnancy': {
      const max = new Date(today);
      max.setDate(max.getDate() + 300);
      return { min: new Date(today), max };
    }
    case 'newmom': {
      const min = new Date(today);
      min.setFullYear(min.getFullYear() - 2);
      return { min, max: new Date(today) };
    }
    case 'ttc': {
      const min = new Date(today);
      min.setMonth(min.getMonth() - 6);
      return { min, max: new Date(today) };
    }
    default:
      return { min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) };
  }
}

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
  last?: boolean;
}

function Row({ label, value, onPress, destructive, rightElement, last }: RowProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.border.subtle }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.rowLabel, { color: destructive ? '#D64545' : theme.text.primary }]}>{label}</Text>
      {rightElement ?? (
        <Text style={[styles.rowValue, { color: theme.text.tertiary }]}>
          {value}{onPress ? '  ›' : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, updateUser, signOut } = useAppContext();

  // ── Account edit state ─────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftDate, setDraftDate] = useState(''); // ISO string

  // ── Visit edit state ───────────────────────────────────────────────────
  const [editingVisit, setEditingVisit] = useState(false);
  const [draftLastVisit, setDraftLastVisit] = useState('');
  const [draftNextAppt, setDraftNextAppt] = useState('');

  const startEditingVisit = () => {
    setDraftLastVisit(user?.lastVisitDate ?? '');
    setDraftNextAppt(user?.nextAppointmentDate ?? '');
    setEditingVisit(true);
  };
  const saveVisit = () => {
    updateUser({
      lastVisitDate: draftLastVisit || undefined,
      nextAppointmentDate: draftNextAppt || undefined,
    });
    setEditingVisit(false);
  };

  // ── Doctor edit state ──────────────────────────────────────────────────
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [draftDoctorName, setDraftDoctorName] = useState('');
  const [draftDoctorPhone, setDraftDoctorPhone] = useState('');

  const startEditingDoctor = () => {
    setDraftDoctorName(user?.doctorName ?? '');
    setDraftDoctorPhone(user?.doctorPhone ?? '');
    setEditingDoctor(true);
  };
  const saveDoctor = () => {
    updateUser({ doctorName: draftDoctorName.trim() || undefined, doctorPhone: draftDoctorPhone.trim() || undefined });
    setEditingDoctor(false);
  };

  // ── Modal state ────────────────────────────────────────────────────────
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);

  // ── Account helpers ────────────────────────────────────────────────────
  const getStage = () => {
    const labels: Record<string, string> = {
      pregnancy: 'Pregnant',
      newmom: 'New Mom',
      ttc: 'Trying to Conceive',
      partner: 'Partner / Dad',
    };
    return labels[user?.stage ?? ''] ?? '—';
  };

  const getDateLabel = () => {
    if (!user) return '—';
    if (user.stage === 'pregnancy' && user.dueDate) {
      const week = getGestationalWeek(new Date(user.dueDate));
      return `Week ${week} · Due ${new Date(user.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long' })}`;
    }
    if (user.stage === 'newmom' && user.babyDOB) {
      return getBabyAgeLabel(new Date(user.babyDOB));
    }
    return '—';
  };

  const getDateFieldLabel = () => {
    if (!user) return 'Date';
    const labels: Record<string, string> = {
      pregnancy: 'Estimated due date',
      newmom: "Baby's date of birth",
      ttc: 'First day of last period',
      partner: "Partner's due date",
    };
    return labels[user.stage] ?? 'Date';
  };

  const getStoredDate = () => {
    if (!user) return undefined;
    return user.stage === 'newmom' ? user.babyDOB : user.dueDate;
  };

  const startEditing = () => {
    setDraftName(user?.name ?? '');
    setDraftEmail(user?.email ?? '');
    setDraftDate(getStoredDate() ?? '');
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) { Alert.alert('Name required', 'Please enter your name.'); return; }
    const trimmedEmail = draftEmail.trim().toLowerCase();
    if (!trimmedEmail.includes('@')) { Alert.alert('Email required', 'Please enter a valid email address.'); return; }
    const isoDate: string | undefined = draftDate || undefined;
    const update: Parameters<typeof updateUser>[0] = { name: trimmedName, email: trimmedEmail };
    if (user?.stage === 'newmom') update.babyDOB = isoDate;
    else update.dueDate = isoDate;
    updateUser(update);
    setEditing(false);
  };

  const removeContact = (id: string) => {
    const updated = (user?.emergencyContacts ?? []).filter(c => c.id !== id);
    updateUser({ emergencyContacts: updated });
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const contacts = user?.emergencyContacts ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
        >
          <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>

        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={[styles.avatar, { backgroundColor: theme.interactive.primary }]}>
            <Text style={styles.avatarText}>{(user?.name ?? 'M')[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: theme.text.primary }]}>{user?.name ?? 'Mama'}</Text>
            <Text style={[styles.profileStage, { color: theme.text.secondary }]}>{getStage()}</Text>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>ACCOUNT</Text>
            {!editing ? (
              <TouchableOpacity onPress={startEditing} activeOpacity={0.7} style={styles.editBtn}>
                <Pencil size={14} color={theme.text.link} strokeWidth={2} />
                <Text style={[styles.editBtnLabel, { color: theme.text.link }]}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={cancelEditing} activeOpacity={0.7} style={[styles.pillBtn, { borderColor: theme.border.default }]}>
                  <X size={14} color={theme.text.secondary} strokeWidth={2} />
                  <Text style={[styles.pillBtnLabel, { color: theme.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEditing} activeOpacity={0.7} style={[styles.pillBtn, { backgroundColor: theme.interactive.primary, borderColor: theme.interactive.primary }]}>
                  <Check size={14} color="#fff" strokeWidth={2.5} />
                  <Text style={[styles.pillBtnLabel, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Card padding="none">
            {editing ? (
              <View>
                <View style={[styles.editRow, { borderBottomWidth: 1, borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.editFieldLabel, { color: theme.text.secondary }]}>Name</Text>
                  <TextInput
                    style={[styles.editInput, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.subtle }]}
                    value={draftName}
                    onChangeText={setDraftName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                <View style={[styles.editRow, { borderBottomWidth: 1, borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.editFieldLabel, { color: theme.text.secondary }]}>Email</Text>
                  <TextInput
                    style={[styles.editInput, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.subtle }]}
                    value={draftEmail}
                    onChangeText={setDraftEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    placeholder="you@example.com"
                    placeholderTextColor={theme.text.tertiary}
                  />
                </View>
                <View style={styles.editRow}>
                  <Text style={[styles.editFieldLabel, { color: theme.text.secondary }]}>{getDateFieldLabel()}</Text>
                  <DatePickerField
                    value={draftDate}
                    onChange={setDraftDate}
                    minDate={getProfileDateRange(user?.stage ?? '').min}
                    maxDate={getProfileDateRange(user?.stage ?? '').max}
                    placeholder="Select a date"
                  />
                </View>
              </View>
            ) : (
              <View>
                <Row label="Name" value={user?.name ?? '—'} />
                <Row label="Email" value={user?.email ?? 'Not set'} />
                <Row label="Journey" value={getStage()} />
                <Row label="Date" value={getDateLabel()} last />
              </View>
            )}
          </Card>
        </View>

        {/* My records */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>MY RECORDS</Text>
          <Card padding="none">
            <Row
              label="Consultation recordings"
              value="Tap to view"
              onPress={() => navigation.navigate('Consultations')}
              last
            />
          </Card>
        </View>

        {/* My Visits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>MY VISITS</Text>
            {!editingVisit ? (
              <TouchableOpacity onPress={startEditingVisit} activeOpacity={0.7} style={styles.editBtn}>
                <Pencil size={14} color={theme.text.link} strokeWidth={2} />
                <Text style={[styles.editBtnLabel, { color: theme.text.link }]}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setEditingVisit(false)} activeOpacity={0.7} style={[styles.pillBtn, { borderColor: theme.border.default }]}>
                  <X size={14} color={theme.text.secondary} strokeWidth={2} />
                  <Text style={[styles.pillBtnLabel, { color: theme.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveVisit} activeOpacity={0.7} style={[styles.pillBtn, { backgroundColor: theme.interactive.primary, borderColor: theme.interactive.primary }]}>
                  <Check size={14} color="#fff" strokeWidth={2.5} />
                  <Text style={[styles.pillBtnLabel, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Card padding="none">
            {editingVisit ? (
              <View>
                <View style={[styles.editRow, { borderBottomWidth: 1, borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.editFieldLabel, { color: theme.text.secondary }]}>Last visit date</Text>
                  <DatePickerField
                    value={draftLastVisit}
                    onChange={setDraftLastVisit}
                    minDate={new Date(2020, 0, 1)}
                    maxDate={new Date()}
                    placeholder="Select date"
                  />
                </View>
                <View style={styles.editRow}>
                  <Text style={[styles.editFieldLabel, { color: theme.text.secondary }]}>Next appointment</Text>
                  <DatePickerField
                    value={draftNextAppt}
                    onChange={setDraftNextAppt}
                    minDate={new Date()}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                    placeholder="Select date"
                  />
                </View>
              </View>
            ) : (
              <View>
                <Row
                  label="Last visit"
                  value={user?.lastVisitDate
                    ? new Date(user.lastVisitDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Not recorded'}
                />
                <Row
                  label="Next appointment"
                  value={user?.nextAppointmentDate
                    ? new Date(user.nextAppointmentDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Not set'}
                />
                <Row
                  label="Visit Prep"
                  value="View checklist"
                  onPress={() => navigation.navigate('VisitPrep')}
                  last
                />
              </View>
            )}
          </Card>
        </View>

        {/* My Doctor */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>MY DOCTOR</Text>
            {!editingDoctor ? (
              <TouchableOpacity onPress={startEditingDoctor} activeOpacity={0.7} style={styles.editBtn}>
                <Pencil size={14} color={theme.text.link} strokeWidth={2} />
                <Text style={[styles.editBtnLabel, { color: theme.text.link }]}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setEditingDoctor(false)} activeOpacity={0.7} style={[styles.pillBtn, { borderColor: theme.border.default }]}>
                  <X size={14} color={theme.text.secondary} strokeWidth={2} />
                  <Text style={[styles.pillBtnLabel, { color: theme.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveDoctor} activeOpacity={0.7} style={[styles.pillBtn, { backgroundColor: theme.interactive.primary, borderColor: theme.interactive.primary }]}>
                  <Check size={14} color="#fff" strokeWidth={2.5} />
                  <Text style={[styles.pillBtnLabel, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Card padding="none">
            {editingDoctor ? (
              <View>
                <View style={[styles.editRow, { borderBottomWidth: 1, borderBottomColor: theme.border.subtle }]}>
                  <Text style={[styles.editFieldLabel, { color: theme.text.secondary }]}>Doctor's name</Text>
                  <TextInput
                    style={[styles.editInput, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.subtle }]}
                    value={draftDoctorName}
                    onChangeText={setDraftDoctorName}
                    autoCapitalize="words"
                    placeholder="e.g. Dr. Amara Okafor"
                    placeholderTextColor={theme.text.tertiary}
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.editRow}>
                  <Text style={[styles.editFieldLabel, { color: theme.text.secondary }]}>Phone number</Text>
                  <TextInput
                    style={[styles.editInput, { color: theme.text.primary, borderColor: theme.border.default, backgroundColor: theme.bg.subtle }]}
                    value={draftDoctorPhone}
                    onChangeText={setDraftDoctorPhone}
                    keyboardType="phone-pad"
                    placeholder="+234 800 000 0000"
                    placeholderTextColor={theme.text.tertiary}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Row label="Doctor" value={user?.doctorName ?? 'Not set'} />
                <Row label="Phone" value={user?.doctorPhone ?? 'Not set'} last />
              </View>
            )}
          </Card>
        </View>

        {/* Partner */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>PARTNER</Text>
          <Card padding="none">
            <Row
              label="Partner"
              value={
                user?.partnerStatus === 'active' ? user.partnerName ?? 'Active'
                : user?.partnerStatus === 'invited' ? `${user.partnerName ?? 'Invite'} · Invited`
                : user?.partnerName ?? 'Not set up'
              }
              onPress={() => setPartnerModalVisible(true)}
              last
            />
          </Card>
        </View>

        {/* Emergency contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>EMERGENCY CONTACTS</Text>
            {contacts.length > 0 && contacts.length < 5 && (
              <TouchableOpacity onPress={() => setAddContactModalVisible(true)} activeOpacity={0.7} style={styles.editBtn}>
                <Plus size={14} color={theme.text.link} strokeWidth={2} />
                <Text style={[styles.editBtnLabel, { color: theme.text.link }]}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {contacts.length > 0 ? (
            <Card padding="none">
              {contacts.map((c, i) => (
                <View
                  key={c.id}
                  style={[
                    styles.contactRow,
                    i < contacts.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
                  ]}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: theme.interactive.primary }]}>
                    <Text style={styles.contactAvatarText}>{c.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: theme.text.primary }]}>{c.name}</Text>
                    <Text style={[styles.contactMeta, { color: theme.text.secondary }]}>{c.relation} · {c.phone}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Remove contact', `Remove ${c.name}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => removeContact(c.id) },
                    ])}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={theme.text.tertiary} strokeWidth={1.75} />
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          ) : (
            <Card style={{ gap: Spacing[3], alignItems: 'center' }}>
              <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No emergency contacts yet</Text>
              <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
                Add trusted people who will be alerted if you trigger an emergency from AskNeo.
              </Text>
              <TouchableOpacity
                onPress={() => setAddContactModalVisible(true)}
                activeOpacity={0.85}
                style={[styles.emptyBtn, { backgroundColor: theme.interactive.primary }]}
              >
                <Plus size={16} color="#fff" strokeWidth={2.5} />
                <Text style={styles.emptyBtnLabel}>Add your first contact</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>SUBSCRIPTION</Text>
          <Card style={styles.subCard}>
            <View style={styles.subHeader}>
              <Text style={[styles.subPlan, { color: theme.text.primary }]}>Free Plan</Text>
              <View style={[styles.subBadge, { backgroundColor: theme.bg.subtle }]}>
                <Text style={[styles.subBadgeText, { color: theme.text.brand }]}>Current</Text>
              </View>
            </View>
            <View style={styles.featureList}>
              {SUBSCRIPTION_FEATURES.free.map(f => (
                <Text key={f} style={[styles.feature, { color: theme.text.secondary }]}>✓ {f}</Text>
              ))}
            </View>
            <View style={[styles.upgradeBanner, { backgroundColor: theme.interactive.primary, borderRadius: Radius.xl }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>AskNeo Plus</Text>
                <Text style={styles.upgradeDesc}>Full care routing, partner access & more</Text>
              </View>
              <Button label="Upgrade" onPress={() => Alert.alert('Coming soon', 'Subscription tiers will be available soon.')} size="sm" variant="ghost" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>SETTINGS</Text>
          <Card padding="none">
            <Row
              label="Dark mode"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#D0D0D0', true: '#A63A50' }}
                  thumbColor="#fff"
                />
              }
            />
            <Row label="Notifications" value="On" onPress={() => {}} />
            <Row label="Privacy & data" onPress={() => Alert.alert('Privacy', 'AskNeo stores your data locally on your device. No medical history is retained.')} last />
          </Card>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <Card padding="none">
            <Row label="Sign out" destructive onPress={handleSignOut} last />
          </Card>
        </View>

        <Text style={[styles.version, { color: theme.text.tertiary }]}>
          AskNeo v1.0.0 · Neonatal DAO
        </Text>

        <AddContactModal visible={addContactModalVisible} onClose={() => setAddContactModalVisible(false)} />
        <PartnerInviteModal visible={partnerModalVisible} onClose={() => setPartnerModalVisible(false)} />
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
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingBottom: Spacing[2],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xl,
    color: '#fff',
  },
  profileName: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xl,
  },
  profileStage: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    marginTop: 2,
  },
  section: { gap: Spacing[2] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[1],
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    letterSpacing: 0.8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  rowLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.base,
    flex: 1,
  },
  rowValue: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    textAlign: 'right',
    maxWidth: '50%',
  },
  editRow: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    gap: Spacing[1],
  },
  editFieldLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  editInput: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
    minHeight: 44,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    marginTop: 1,
  },
  subCard: { gap: Spacing[4] },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  subPlan: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  subBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  subBadgeText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  featureList: { gap: Spacing[1] },
  feature: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.7,
  },
  upgradeBanner: {
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginTop: Spacing[2],
  },
  upgradeTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
  upgradeDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  version: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    textAlign: 'center',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    marginTop: Spacing[1],
  },
  emptyBtnLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
});
