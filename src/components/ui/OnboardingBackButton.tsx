import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../icons/Icon';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  onPress: () => void;
}

export default function OnboardingBackButton({ onPress }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={styles.btn}
    >
      <Icon name="left" size={22} color={theme.text.secondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    padding: 8,
    marginLeft: -8,
  },
});
