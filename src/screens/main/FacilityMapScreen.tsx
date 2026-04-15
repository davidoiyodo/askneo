import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { ChevronLeft, Phone, Navigation, MapPin, Clock, Car } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography, Spacing, Radius, Shadow, Colors } from '../../theme';
import { facilities, getDistanceKm, openDirections } from '../../data/facilities';

type Params = {
  facilityId: string;
  userLat: number;
  userLng: number;
};

type RouteInfo = {
  coords: { latitude: number; longitude: number }[];
  distanceKm: number;
  durationMin: number;
};

// OSRM public routing server — no API key required, good for demo
// For production use a self-hosted OSRM or a paid routing API
async function fetchOSRMRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
): Promise<RouteInfo | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes?.length) return null;
    const r = data.routes[0];
    return {
      coords: (r.geometry.coordinates as [number, number][]).map(
        ([lng, lat]) => ({ latitude: lat, longitude: lng }),
      ),
      distanceKm: r.legs[0].distance / 1000,
      durationMin: Math.round(r.legs[0].duration / 60),
    };
  } catch {
    return null;
  }
}

export default function FacilityMapScreen({ route, navigation }: { route: any; navigation: any }) {
  const { theme } = useTheme();
  const { facilityId, userLat, userLng } = route.params as Params;
  const mapRef = useRef<MapView>(null);

  const facility = facilities.find(f => f.id === facilityId)!;

  // Fallback straight-line distance
  const straightKm = getDistanceKm(userLat, userLng, facility.lat, facility.lng);

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    fetchOSRMRoute(userLat, userLng, facility.lat, facility.lng).then(setRouteInfo);
  }, []);

  // Display values — prefer route data once available
  const distLabel = routeInfo
    ? routeInfo.distanceKm < 1
      ? `${Math.round(routeInfo.distanceKm * 1000)} m`
      : `${routeInfo.distanceKm.toFixed(1)} km`
    : straightKm < 1
      ? `${Math.round(straightKm * 1000)} m`
      : `${straightKm.toFixed(1)} km`;

  const etaLabel = routeInfo ? `~${routeInfo.durationMin} min drive` : null;

  // The polyline to draw — road route if loaded, straight dashed line as fallback
  const polylineCoords = routeInfo?.coords ?? [
    { latitude: userLat, longitude: userLng },
    { latitude: facility.lat, longitude: facility.lng },
  ];
  const isDashedFallback = !routeInfo;

  // Region that fits both pins
  const midLat = (userLat + facility.lat) / 2;
  const midLng = (userLng + facility.lng) / 2;
  const latDelta = Math.abs(userLat - facility.lat) * 2.5 + 0.01;
  const lngDelta = Math.abs(userLng - facility.lng) * 2.5 + 0.01;

  return (
    <View style={styles.root}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={{ latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        <Polyline
          coordinates={polylineCoords}
          strokeColor={Colors.brand[500]}
          strokeWidth={isDashedFallback ? 2 : 4}
          lineDashPattern={isDashedFallback ? [6, 4] : undefined}
        />

        <Marker
          coordinate={{ latitude: facility.lat, longitude: facility.lng }}
          title={facility.name}
          description={facility.address}
        />
      </MapView>

      {/* Back button overlay */}
      <SafeAreaView edges={['top']} style={[styles.overlay, { pointerEvents: 'box-none' }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={[styles.backBtn, { backgroundColor: theme.bg.surface }]}
        >
          <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2} />
          <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom facility card */}
      <SafeAreaView edges={['bottom']} style={[styles.card, { backgroundColor: theme.bg.surface }]}>
        <View style={[styles.handle, { backgroundColor: theme.border.default }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardLeft}>
              <Text style={[styles.facilityName, { color: theme.text.primary }]} numberOfLines={2}>
                {facility.name}
              </Text>
              <View style={styles.metaRow}>
                <MapPin size={12} color={theme.text.tertiary} strokeWidth={2} />
                <Text style={[styles.metaText, { color: theme.text.secondary }]}>
                  {facility.area} · {facility.address}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Clock size={12} color={theme.text.tertiary} strokeWidth={2} />
                <Text style={[styles.metaText, { color: theme.text.secondary }]}>{facility.hours}</Text>
              </View>
            </View>

            {/* Distance + ETA badges */}
            <View style={styles.badgeStack}>
              <View style={[styles.distBadge, { backgroundColor: theme.accent.sage.bg }]}>
                <Text style={[styles.distBadgeText, { color: theme.accent.sage.text }]}>{distLabel}</Text>
              </View>
              {etaLabel && (
                <View style={[styles.etaBadge, { backgroundColor: theme.accent.gold.bg }]}>
                  <Car size={10} color={theme.accent.gold.text} strokeWidth={2} />
                  <Text style={[styles.etaBadgeText, { color: theme.accent.gold.text }]}>{etaLabel}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            {facility.emergency && (
              <View style={[styles.tag, { backgroundColor: theme.accent.rose.bg }]}>
                <Text style={[styles.tagText, { color: theme.accent.rose.text }]}>24h Emergency</Text>
              </View>
            )}
            {facility.tags.slice(0, 3).map(t => (
              <View key={t} style={[styles.tag, { backgroundColor: theme.bg.subtle }]}>
                <Text style={[styles.tagText, { color: theme.text.secondary }]}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${facility.phone.replace(/\s+/g, '')}`)}
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.callBtn, { borderColor: theme.border.default }]}
            >
              <Phone size={16} color={theme.text.brand} strokeWidth={2} />
              <Text style={[styles.actionLabel, { color: theme.text.brand }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openDirections(facility)}
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.directionsBtn, { backgroundColor: theme.interactive.primary }]}
            >
              <Navigation size={16} color="#fff" strokeWidth={2} />
              <Text style={[styles.actionLabel, { color: '#fff' }]}>Start Navigation</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.disclaimer, { color: theme.text.tertiary }]}>
            Sample data — call ahead to confirm hours and availability.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing[1],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    ...Shadow.md,
  },
  backLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    ...Shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing[3],
    marginBottom: Spacing[1],
  },
  cardBody: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
    gap: Spacing[3],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  cardLeft: { flex: 1, gap: 4 },
  facilityName: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    lineHeight: Typography.size.lg * 1.25,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  badgeStack: {
    gap: Spacing[1],
    alignItems: 'flex-end',
    flexShrink: 0,
    marginTop: 2,
  },
  distBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  distBadgeText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xs,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  etaBadgeText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: 11,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
    marginTop: -Spacing[1],
  },
  tag: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderRadius: Radius.full,
  },
  callBtn: {
    flex: 1,
    borderWidth: 1.5,
  },
  directionsBtn: {
    flex: 2,
  },
  actionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.base,
  },
  disclaimer: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    textAlign: 'center',
    marginTop: -Spacing[1],
    paddingBottom: Spacing[1],
  },
});
