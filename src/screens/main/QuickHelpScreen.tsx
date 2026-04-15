import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Siren, Phone, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow, Colors } from '../../theme';
import AddContactModal from '../../components/modals/AddContactModal';
export default function QuickHelpScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);

  const triggerSOS = () => {
    if (!user?.emergencyContacts?.length) {
      Alert.alert(
        'No emergency contacts',
        'Please add emergency contacts in your Profile to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    const contact = user.emergencyContacts[0];
    const message = encodeURIComponent(
      `EMERGENCY ALERT from AskNeo\n\n${user.name} may need urgent help. Please check on them immediately.\n\nThis alert was sent automatically by AskNeo.`
    );

    Alert.alert(
      'Send Emergency Alert',
      `This will send an alert to ${user.emergencyContacts.map(c => c.name).join(', ')}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            const phone = contact.phone.replace(/\s+/g, '');
            Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`)
              .catch(() => Linking.openURL(`sms:${phone}?body=${message}`));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
        >
          <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Quick Help</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            For moments when you need support fast.
          </Text>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          onPress={triggerSOS}
          activeOpacity={0.85}
          style={[styles.sosBtn, { backgroundColor: Colors.danger[500] }]}
        >
          <Siren size={32} color="#fff" strokeWidth={1.75} />
          <View>
            <Text style={styles.sosLabel}>Emergency Alert</Text>
            <Text style={styles.sosDesc}>
              {user?.emergencyContacts?.length
                ? `Alerts ${user.emergencyContacts.length} contact${user.emergencyContacts.length > 1 ? 's' : ''} via WhatsApp/SMS`
                : 'Add contacts in Profile to use this'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Call emergency services */}
        <TouchableOpacity
          onPress={() => Linking.openURL('tel:112')}
          activeOpacity={0.85}
          style={[styles.callBtn, { backgroundColor: theme.bg.surface, borderColor: Colors.danger[500] }]}
        >
          <Phone size={26} color={Colors.danger[500]} strokeWidth={1.75} />
          <View>
            <Text style={[styles.callLabel, { color: Colors.danger[500] }]}>Call Emergency Services</Text>
            <Text style={[styles.callDesc, { color: theme.text.secondary }]}>Dial 112 (Emergency number)</Text>
          </View>
        </TouchableOpacity>

        {/* Call doctor */}
        {user?.doctorPhone && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${user.doctorPhone}`)}
            activeOpacity={0.85}
            style={[styles.callBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}
          >
            <Phone size={26} color={theme.text.brand} strokeWidth={1.75} />
            <View>
              <Text style={[styles.callLabel, { color: theme.text.primary }]}>
                {user.doctorName ? `Call ${user.doctorName}` : 'Call your doctor'}
              </Text>
              <Text style={[styles.callDesc, { color: theme.text.secondary }]}>{user.doctorPhone}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Emergency contacts list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Your emergency contacts</Text>
          {user?.emergencyContacts?.length ? (
            <View style={styles.contactList}>
              {user.emergencyContacts.map(c => (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL(`tel:${c.phone}`)}
                  style={[styles.contactRow, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle, ...Shadow.sm }]}
                >
                  <View style={[styles.avatar, { backgroundColor: theme.interactive.primary }]}>
                    <Text style={styles.avatarText}>{c.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: theme.text.primary }]}>{c.name}</Text>
                    <Text style={[styles.contactMeta, { color: theme.text.secondary }]}>{c.relation} · {c.phone}</Text>
                  </View>
                  <Phone size={16} color={theme.text.link} strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No emergency contacts added</Text>
              <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
                Add trusted people who can be alerted if you need urgent help.
              </Text>
              <TouchableOpacity
                onPress={() => setAddContactModalVisible(true)}
                activeOpacity={0.85}
                style={[styles.emptyBtn, { backgroundColor: theme.interactive.primary }]}
              >
                <Text style={styles.emptyBtnLabel}>+ Add emergency contact</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={[styles.disclaimer, { color: theme.text.tertiary }]}>
          AskNeo emergency alerts do not replace regulated emergency services. Always call emergency services in a life-threatening situation.
        </Text>

        <AddContactModal visible={addContactModalVisible} onClose={() => setAddContactModalVisible(false)} />
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
  sosBtn: {
    borderRadius: Radius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  sosLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    color: '#fff',
  },
  sosDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  callBtn: {
    borderRadius: Radius['2xl'],
    borderWidth: 1.5,
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  callLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  callDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  section: { gap: Spacing[3] },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  contactList: { gap: Spacing[2] },
  contactRow: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
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
  disclaimer: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.7,
  },
  emptyCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[5],
    gap: Spacing[3],
    alignItems: 'center',
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
