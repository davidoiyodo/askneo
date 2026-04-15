import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();

  const getBg = () => {
    if (disabled) return theme.border.subtle;
    switch (variant) {
      case 'primary':     return theme.interactive.primary;
      case 'secondary':   return theme.interactive.secondary;
      case 'ghost':       return 'transparent';
      case 'destructive': return theme.interactive.destructive;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.text.disabled;
    switch (variant) {
      case 'primary':     return theme.interactive.primaryText;
      case 'secondary':   return theme.interactive.secondaryText;
      case 'ghost':       return theme.text.brand;
      case 'destructive': return theme.interactive.destructiveText;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingHorizontal: Spacing[4], paddingVertical: Spacing[2] };
      case 'md': return { paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] };
      case 'lg': return { paddingHorizontal: Spacing[6], paddingVertical: Spacing[4] };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return Typography.size.sm;
      case 'md': return Typography.size.base;
      case 'lg': return Typography.size.md;
    }
  };

  const minHeight = size === 'sm' ? 36 : size === 'lg' ? 56 : 48;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        getPadding(),
        { backgroundColor: getBg(), minHeight, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.label, { color: getTextColor(), fontSize: getFontSize() }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontFamily: Typography.fontFamily.bodySemibold,
    letterSpacing: 0.1,
  },
});
