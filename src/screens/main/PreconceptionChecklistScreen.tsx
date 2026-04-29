import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';
import Icon from '../../components/icons/Icon';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { navigation: NativeStackNavigationProp<any> };

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── Checklist Data ───────────────────────────────────────────────────────────

const CHECKLIST: ChecklistItem[] = [
  // Health Screening
  {
    id: 'gp-checkup',
    category: 'Health Screening',
    title: 'Book a preconception checkup',
    description: 'Talk to your GP or gynaecologist before trying to conceive. They can review your health history, current medications, and any conditions that may affect pregnancy.',
    priority: 'high',
  },
  {
    id: 'blood-tests',
    category: 'Health Screening',
    title: 'Get baseline blood tests',
    description: 'Ask your doctor to check: full blood count (for anaemia), thyroid function, rubella immunity, blood group & rhesus factor, and HbA1c if diabetes risk exists.',
    priority: 'high',
  },
  {
    id: 'cervical-screen',
    category: 'Health Screening',
    title: 'Check cervical smear is up to date',
    description: 'Ideally have this done before pregnancy — it is harder to interpret during pregnancy and may require repeating.',
    priority: 'medium',
  },
  {
    id: 'dental-checkup',
    category: 'Health Screening',
    title: 'Dental checkup',
    description: 'Gum disease is linked to preterm birth. Have any dental work done before you conceive — some procedures are not recommended in pregnancy.',
    priority: 'medium',
  },
  {
    id: 'std-screening',
    category: 'Health Screening',
    title: 'STI screening (if applicable)',
    description: 'Untreated chlamydia, gonorrhoea, and other STIs can affect fertility and pregnancy. Screening is simple and treatment is effective.',
    priority: 'medium',
  },

  // Nutrition
  {
    id: 'folic-acid-start',
    category: 'Nutrition',
    title: 'Start folic acid now (400mcg daily)',
    description: 'Neural tube closure happens at 4–6 weeks — before many women know they\'re pregnant. Starting folic acid 3 months before trying is the gold standard.',
    priority: 'high',
  },
  {
    id: 'vitamin-d',
    category: 'Nutrition',
    title: 'Check vitamin D levels',
    description: 'Vitamin D deficiency is extremely common in Nigeria and affects fertility, implantation, and early pregnancy. Ask your doctor to test your levels.',
    priority: 'high',
  },
  {
    id: 'iron-stores',
    category: 'Nutrition',
    title: 'Build iron stores',
    description: 'Iron deficiency anaemia is one of the most common causes of pregnancy complications. Start building stores now through diet (red meat, lentils, dark leafy greens) and supplementation if needed.',
    priority: 'medium',
  },
  {
    id: 'diet-quality',
    category: 'Nutrition',
    title: 'Improve overall diet quality',
    description: 'Focus on whole grains, fruits and vegetables, lean protein, and healthy fats. Limit ultra-processed foods, sugary drinks, and excess red meat. The Mediterranean pattern is well-evidenced for fertility.',
    priority: 'medium',
  },

  // Lifestyle
  {
    id: 'healthy-weight',
    category: 'Lifestyle',
    title: 'Work towards a healthy weight',
    description: 'Both underweight and overweight significantly affect fertility and pregnancy outcomes. Even a 5–10% change in body weight can restore ovulation in women with PCOS or irregular cycles.',
    priority: 'high',
  },
  {
    id: 'stop-smoking',
    category: 'Lifestyle',
    title: 'Stop smoking',
    description: 'Smoking damages egg quality, reduces ovarian reserve, increases miscarriage risk, and affects placental function. There is no safe level of smoking during conception or pregnancy.',
    priority: 'high',
  },
  {
    id: 'alcohol',
    category: 'Lifestyle',
    title: 'Stop or reduce alcohol',
    description: 'Alcohol affects hormonal balance and egg quality. There is no known safe level in early pregnancy — the safest approach is to stop when trying to conceive.',
    priority: 'high',
  },
  {
    id: 'stress-management',
    category: 'Lifestyle',
    title: 'Establish a stress management routine',
    description: 'Chronic stress disrupts the HPA axis, affecting LH and FSH levels. Regular exercise, adequate sleep, and mindfulness practices have measurable effects on cycle regularity.',
    priority: 'medium',
  },
  {
    id: 'exercise',
    category: 'Lifestyle',
    title: 'Establish regular moderate exercise',
    description: 'Aim for 150 minutes of moderate activity per week. Avoid extreme or very high-intensity training — it can suppress ovulation in women with low body fat.',
    priority: 'medium',
  },

  // Partner Health
  {
    id: 'partner-checkup',
    category: 'Partner Health',
    title: 'Partner preconception checkup',
    description: 'Male factor infertility accounts for 40–50% of conception difficulties. A semen analysis is simple and informative. Your partner\'s GP can refer for this.',
    priority: 'high',
  },
  {
    id: 'partner-folic',
    category: 'Partner Health',
    title: 'Partner to start folic acid',
    description: 'Emerging evidence suggests paternal folic acid intake (at least 400mcg daily) reduces the risk of chromosomal abnormalities in sperm.',
    priority: 'medium',
  },
  {
    id: 'partner-lifestyle',
    category: 'Partner Health',
    title: 'Partner lifestyle review',
    description: 'Smoking, alcohol, heat exposure (laptops on lap, hot baths), and some medications affect sperm quality. Sperm takes ~90 days to mature, so changes take 3 months to show effect.',
    priority: 'medium',
  },
];

const CATEGORIES = ['Health Screening', 'Nutrition', 'Lifestyle', 'Partner Health'];

const STORAGE_KEY = 'askneo_preconception_checklist';

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#C4566A',
  medium: '#F4B740',
  low:    '#5DBB8A',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PreconceptionChecklistScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) {
        try { setChecked(JSON.parse(val)); } catch {}
      }
    });
  }, []);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const totalDone = Object.values(checked).filter(Boolean).length;
  const totalItems = CHECKLIST.length;
  const progress = totalItems > 0 ? totalDone / totalItems : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Icon name="left" size={22} color={theme.text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Preconception Checklist</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Progress bar */}
        <View style={[styles.progressCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: theme.text.primary }]}>Your progress</Text>
            <Text style={[styles.progressCount, { color: theme.text.secondary }]}>
              {totalDone} / {totalItems} done
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.border.subtle }]}>
            <View
              style={[styles.progressFill, {
                backgroundColor: theme.interactive.primary,
                width: `${Math.round(progress * 100)}%` as any,
              }]}
            />
          </View>
          <Text style={[styles.progressSublabel, { color: theme.text.secondary }]}>
            {progress === 0
              ? 'Start working through these before you begin trying to conceive.'
              : progress < 0.5
              ? 'Good start — keep going.'
              : progress < 1
              ? 'You\'re over halfway there.'
              : '✓ All steps complete — you\'ve given yourself a great foundation.'}
          </Text>
        </View>

        {/* Categories */}
        {CATEGORIES.map(category => {
          const items = CHECKLIST.filter(i => i.category === category);
          const doneCat = items.filter(i => checked[i.id]).length;
          return (
            <View key={category} style={[styles.section, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryTitle, { color: theme.text.primary }]}>{category}</Text>
                <Text style={[styles.categoryCount, { color: theme.text.secondary }]}>
                  {doneCat}/{items.length}
                </Text>
              </View>

              {items.map((item, idx) => {
                const done = !!checked[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemRow,
                      idx > 0 && { borderTopWidth: 1, borderTopColor: theme.border.subtle },
                    ]}
                    onPress={() => toggle(item.id)}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                    accessibilityLabel={item.title}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.itemTitleRow}>
                        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
                        <Text style={[
                          styles.itemTitle,
                          { color: done ? theme.text.secondary : theme.text.primary },
                          done && styles.itemDoneText,
                        ]}>
                          {item.title}
                        </Text>
                      </View>
                      {!done && (
                        <Text style={[styles.itemDesc, { color: theme.text.secondary }]}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.checkIcon}>
                      {done
                        ? <Icon name="check_circle" size={22} color={theme.interactive.primary} />
                        : <Icon name="circle_dash" size={22} color={theme.border.default} />
                      }
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Priority legend */}
        <View style={[styles.legendCard, { backgroundColor: theme.bg.subtle }]}>
          <Text style={[styles.legendTitle, { color: theme.text.secondary }]}>Priority guide</Text>
          <View style={styles.legendRow}>
            {[
              { color: '#C4566A', label: 'High — do first' },
              { color: '#F4B740', label: 'Medium — do soon' },
              { color: '#5DBB8A', label: 'Low — nice to have' },
            ].map(l => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  progressCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  progressCount: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    minWidth: 4,
  },
  progressSublabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  section: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[4],
    gap: 0,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  categoryTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  categoryCount: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  itemLeft: { flex: 1, gap: Spacing[2] },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 1,
  },
  itemTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  itemDoneText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.65,
  },
  checkIcon: { paddingTop: 2 },
  legendCard: {
    borderRadius: Radius.xl,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  legendTitle: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[3] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
});
