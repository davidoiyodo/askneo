import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser } from '../hooks/useAppContext';
import { apiFetch, TOKEN_KEY } from './api';

// ── Response shapes ────────────────────────────────────────────────────────────

interface RegisterResponse {
  token?: string;
  user?: unknown;
}

interface LoginResponse {
  status: string;
  token: string;
}

// ── Payload builder (AppUser → snake_case for API) ─────────────────────────────

function toRegisterPayload(user: AppUser) {
  return {
    name:                user.name,
    email:               user.email,
    password:            user.password,
    stage:               user.stage,
    due_date:            user.dueDate            ?? null,
    baby_dob:            user.babyDOB            ?? null,
    invite_code:         user.inviteCode         ?? '',
    partner_stage:       user.partnerStage       ?? null,
    partner_due_date:    user.partnerDueDate     ?? null,
    partner_baby_dob:    user.partnerBabyDOB     ?? null,
    emergency_contacts:  user.emergencyContacts,
    goals:               user.goals              ?? [],
    sub_goals:           user.subGoals           ?? [],
    birth_intention:     user.birthIntention     ?? 'undecided',
    feeding_intention:   user.feedingIntention   ?? 'undecided',
    personal_intentions: user.personalIntentions ?? [],
    ttc_start_date:      user.ttcStartDate       ?? null,
    known_conditions:    user.knownConditions    ?? [],
    irregular_cycles:    user.cyclesIrregular    ?? false,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Server stores dates as Unix timestamp strings — convert back to ISO YYYY-MM-DD
function unixToIso(val: unknown): string | undefined {
  if (!val || val === '') return undefined;
  const ts = parseInt(String(val), 10);
  if (isNaN(ts) || ts === 0) return undefined;
  return new Date(ts * 1000).toISOString().split('T')[0];
}

// Server returns irregular_cycles as "0" / "1" string
function toBoolean(val: unknown): boolean | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  return String(val) !== '0' && val !== false;
}

function presence(val: unknown): string | undefined {
  if (!val || val === '') return undefined;
  return String(val);
}

// ── Response mapper (snake_case API → AppUser) ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromApiUser(data: Record<string, any>): Partial<AppUser> {
  return {
    name:               data.name,
    email:              data.email,
    stage:              data.stage,
    dueDate:            unixToIso(data.due_date),
    babyDOB:            unixToIso(data.baby_dob),
    inviteCode:         presence(data.invite_code),
    partnerStage:       presence(data.partner_stage) as AppUser['partnerStage'],
    partnerDueDate:     unixToIso(data.partner_due_date),
    partnerBabyDOB:     unixToIso(data.partner_baby_dob),
    emergencyContacts:  data.emergency_contacts  ?? [],
    goals:              data.goals               ?? [],
    subGoals:           data.sub_goals           ?? [],
    birthIntention:     data.birth_intention !== 'undecided' ? data.birth_intention : undefined,
    feedingIntention:   data.feeding_intention !== 'undecided' ? data.feeding_intention : undefined,
    personalIntentions: data.personal_intentions ?? [],
    ttcStartDate:       unixToIso(data.ttc_start_date),
    knownConditions:    data.known_conditions?.length ? data.known_conditions : undefined,
    cyclesIrregular:    toBoolean(data.irregular_cycles),
    onboardingComplete: true,
  };
}

// ── Auth functions ─────────────────────────────────────────────────────────────

export async function registerUser(user: AppUser): Promise<void> {
  const res = await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(toRegisterPayload(user)),
  });
  if (res?.token) {
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
  }
}

export async function loginUser(email: string, password: string): Promise<void> {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res?.token) {
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
  }
}

export async function getMe(): Promise<Partial<AppUser>> {
  const res = await apiFetch<{ status: string; data: Record<string, unknown> }>('/users/me');
  return fromApiUser(res.data);
}

export async function signOutUser(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
