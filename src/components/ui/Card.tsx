import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing, Radius, Shadow } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export default function Card({ children, style, padding = 'md' }: CardProps) {
  const { theme } = useTheme();

  const padValue = padding === 'none' ? 0 : padding === 'sm' ? Spacing[4] : padding === 'lg' ? Spacing[6] : Spacing[5];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.subtle,
          padding: padValue,
        },
        Shadow.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
  },
});
