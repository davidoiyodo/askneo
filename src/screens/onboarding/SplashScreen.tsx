import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Colors } from '../../theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: Colors.brand[900] }]}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.logo}>AskNeo</Text>
        <Text style={styles.tagline}>Your care companion</Text>
      </Animated.View>
      <Text style={styles.ecosystem}>Neonatal DAO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontFamily: Typography.fontFamily.display,
    fontSize: 48,
    color: '#FFF6F7',
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.base,
    color: Colors.brand[300],
    letterSpacing: 0.5,
  },
  ecosystem: {
    position: 'absolute',
    bottom: 48,
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    color: Colors.brand[600],
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
