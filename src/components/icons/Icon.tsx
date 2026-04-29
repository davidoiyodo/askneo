import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS, IconVariant } from './mingcute-paths';

type Props = {
  name: string;
  size?: number;
  color?: string;
  variant?: IconVariant;
};

export default function Icon({ name, size = 24, color = 'currentColor', variant = 'line' }: Props) {
  const map = ICON_PATHS[variant];
  const segments = map[name];

  if (!segments) {
    if (__DEV__) {
      console.warn(`[Icon] Unknown icon: "${name}" (variant: ${variant})`);
    }
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {segments.map((seg, i) => (
        <Path
          key={i}
          d={seg.d}
          fill={color}
          fillRule={seg.fillRule as 'evenodd' | 'nonzero' | undefined}
          clipRule={seg.fillRule as 'evenodd' | 'nonzero' | undefined}
        />
      ))}
    </Svg>
  );
}
