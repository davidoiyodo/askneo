import { Platform, Linking } from 'react-native';

export type FacilitySpecialty = 'maternity' | 'neonatal' | 'fertility';

export interface HealthFacility {
  id: string;
  name: string;
  specialties: FacilitySpecialty[];
  address: string;
  area: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  hours: string;
  emergency: boolean;  // 24/7 emergency services
  tags: string[];      // e.g. ['Private', 'NICU', 'IVF']
}

// ── Haversine distance ────────────────────────────────────────────────────────

export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Directions ────────────────────────────────────────────────────────────────

export function openDirections(facility: HealthFacility): void {
  const label = encodeURIComponent(facility.name);
  const nativeUrl = Platform.OS === 'ios'
    ? `maps://maps.apple.com/?daddr=${facility.lat},${facility.lng}&dirflg=d`
    : `geo:${facility.lat},${facility.lng}?q=${facility.lat},${facility.lng}(${label})`;
  const fallback = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;
  Linking.openURL(nativeUrl).catch(() => Linking.openURL(fallback));
}

// ── Query helper ──────────────────────────────────────────────────────────────

export function getFacilitiesBySpecialty(
  specialty: FacilitySpecialty,
  userLat?: number,
  userLng?: number,
): HealthFacility[] {
  const filtered = facilities.filter(f => f.specialties.includes(specialty));
  if (!userLat || !userLng) return filtered;
  return [...filtered].sort(
    (a, b) =>
      getDistanceKm(userLat, userLng, a.lat, a.lng) -
      getDistanceKm(userLat, userLng, b.lat, b.lng),
  );
}

// ── Sample data — Lagos, Nigeria (v1) ─────────────────────────────────────────
// NOTE: This is demonstration data for the MVP. Verify contact details
// directly with each facility before relying on them in production.

export const facilities: HealthFacility[] = [

  // ── Maternity ──────────────────────────────────────────────────────────────

  {
    id: 'f-01',
    name: 'Lagos Island General Hospital',
    specialties: ['maternity', 'neonatal'],
    address: '1 Broad Street',
    area: 'Lagos Island',
    city: 'Lagos',
    phone: '+234 1 263 4101',
    lat: 6.4528,
    lng: 3.3942,
    hours: '24 hours',
    emergency: true,
    tags: ['Government', 'Emergency', 'NICU'],
  },
  {
    id: 'f-02',
    name: 'Reddington Hospital',
    specialties: ['maternity', 'neonatal'],
    address: '12 Idowu Martins Street',
    area: 'Victoria Island',
    city: 'Lagos',
    phone: '+234 1 461 9000',
    lat: 6.4286,
    lng: 3.4218,
    hours: '24 hours',
    emergency: true,
    tags: ['Private', 'Emergency', 'NICU'],
  },
  {
    id: 'f-03',
    name: 'Evercare Hospital Lagos',
    specialties: ['maternity', 'neonatal'],
    address: '1 Admiralty Way',
    area: 'Lekki Phase 1',
    city: 'Lagos',
    phone: '+234 1 277 3000',
    lat: 6.4347,
    lng: 3.5044,
    hours: '24 hours',
    emergency: true,
    tags: ['Private', 'Emergency', 'NICU'],
  },
  {
    id: 'f-04',
    name: 'St. Nicholas Hospital',
    specialties: ['maternity'],
    address: '57 Campbell Street',
    area: 'Lagos Island',
    city: 'Lagos',
    phone: '+234 1 263 5670',
    lat: 6.4511,
    lng: 3.3914,
    hours: '24 hours',
    emergency: true,
    tags: ['Private', 'Emergency'],
  },
  {
    id: 'f-05',
    name: 'Eko Hospital & Specialists Centre',
    specialties: ['maternity'],
    address: '31 Mobolaji Bank-Anthony Way',
    area: 'Surulere',
    city: 'Lagos',
    phone: '+234 1 773 2000',
    lat: 6.4972,
    lng: 3.3577,
    hours: '24 hours',
    emergency: true,
    tags: ['Private', 'Emergency'],
  },

  // ── Neonatal ───────────────────────────────────────────────────────────────

  {
    id: 'f-06',
    name: 'LUTH — Lagos University Teaching Hospital',
    specialties: ['neonatal', 'maternity'],
    address: 'Idi-Araba',
    area: 'Yaba',
    city: 'Lagos',
    phone: '+234 1 774 5051',
    lat: 6.5093,
    lng: 3.3656,
    hours: '24 hours',
    emergency: true,
    tags: ['Teaching Hospital', 'NICU', 'Emergency'],
  },
  {
    id: 'f-07',
    name: "Massey Street Children's Hospital",
    specialties: ['neonatal'],
    address: '10 Massey Street',
    area: 'Lagos Island',
    city: 'Lagos',
    phone: '+234 1 263 2621',
    lat: 6.4559,
    lng: 3.3972,
    hours: '24 hours',
    emergency: true,
    tags: ['Government', 'Paediatric', 'Emergency'],
  },

  // ── Fertility ──────────────────────────────────────────────────────────────

  {
    id: 'f-08',
    name: 'Bridge Clinic Lagos',
    specialties: ['fertility'],
    address: '4 Bourdillon Road',
    area: 'Ikoyi',
    city: 'Lagos',
    phone: '+234 1 271 5990',
    lat: 6.4548,
    lng: 3.4344,
    hours: 'Mon–Sat  8am–6pm',
    emergency: false,
    tags: ['Fertility', 'IVF'],
  },
  {
    id: 'f-09',
    name: 'Nordica Fertility Centre',
    specialties: ['fertility'],
    address: '3 Wole Olateju Crescent',
    area: 'Lekki Phase 1',
    city: 'Lagos',
    phone: '+234 1 340 9780',
    lat: 6.4330,
    lng: 3.4938,
    hours: 'Mon–Sat  8am–5pm',
    emergency: false,
    tags: ['Fertility', 'IVF', 'IUI'],
  },
  {
    id: 'f-10',
    name: 'MART Medical Centre',
    specialties: ['fertility'],
    address: '14 Elsie Femi-Pearse Street',
    area: 'Victoria Island',
    city: 'Lagos',
    phone: '+234 1 271 2030',
    lat: 6.4274,
    lng: 3.4232,
    hours: 'Mon–Fri  8am–6pm',
    emergency: false,
    tags: ['Fertility', 'IVF'],
  },
  {
    id: 'f-11',
    name: 'St. Ives Specialist Hospital',
    specialties: ['fertility'],
    address: '14 Admiralty Way',
    area: 'Lekki Phase 1',
    city: 'Lagos',
    phone: '+234 1 270 8080',
    lat: 6.4338,
    lng: 3.5031,
    hours: 'Mon–Sat  8am–6pm',
    emergency: false,
    tags: ['Fertility', 'IUI'],
  },
  {
    id: 'f-12',
    name: 'Lagoon Hospital Fertility Unit',
    specialties: ['fertility'],
    address: '20 Hygeia Crescent',
    area: 'Apapa',
    city: 'Lagos',
    phone: '+234 1 469 7000',
    lat: 6.4493,
    lng: 3.3591,
    hours: 'Mon–Sat  8am–5pm',
    emergency: false,
    tags: ['Fertility', 'IVF'],
  },
];
