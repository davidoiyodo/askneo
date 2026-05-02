import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser } from '../hooks/useAppContext';
import { apiFetch, ApiError, TOKEN_KEY } from './api';

interface RegisterResponse {
  token?: string;
  user?: unknown;
}

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

export async function registerUser(user: AppUser): Promise<void> {
  const payload = toRegisterPayload(user);
  const res = await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res?.token) {
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
  }
}

export async function signOutUser(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
