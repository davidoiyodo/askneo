import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const TASKS_KEY = 'askneo_tasks';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  sourceSessionId?: string;
  addedAt: number;
}

export type UserStage = 'ttc' | 'pregnancy' | 'newmom' | 'partner';

export type GoalId =
  // Pregnancy
  | 'safe-delivery'
  | 'natural-birth'
  | 'baby-development'
  | 'breastfeeding-readiness'
  | 'staying-active'
  // Newmom
  | 'feeding-success'
  | 'baby-growth'
  | 'sleep-patterns'
  | 'mom-recovery'
  // TTC
  | 'cycle-awareness'
  | 'conception-optimisation'
  | 'emotional-wellbeing'
  | 'ivf-preparation'
  // Partner
  | 'supporting-partner'
  | 'birth-preparation'
  | 'newborn-readiness';

export type SubGoalId =
  | 'brain-development'
  | 'vision-development'
  | 'bone-development'
  | 'immune-development'
  | 'heart-development';

export type BirthIntention = 'natural' | 'caesarean' | 'undecided';
export type FeedingIntention = 'breast' | 'formula' | 'undecided';

export interface WishlistItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  tag?: string;
}

export interface CustomBundle {
  selection: Record<string, number>;
  total: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface AppUser {
  name: string;
  email: string;        // unique account identifier, used to sign in
  password: string;
  stage: UserStage;
  dueDate?: string;     // ISO date string
  babyDOB?: string;     // ISO date string
  inviteCode?: string;
  partnerName?: string;
  partnerStatus?: 'invited' | 'active';
  // Linked partner context (set on partner-stage users from the invite code)
  partnerStage?: 'pregnancy' | 'newmom' | 'ttc';
  partnerDueDate?: string;   // ISO — woman's EDD (if pregnancy) or cycle date (if ttc)
  partnerBabyDOB?: string;   // ISO — baby's DOB (if newmom)
  doctorName?: string;
  doctorPhone?: string;
  lastVisitDate?: string;        // ISO date of last doctor visit
  nextAppointmentDate?: string;  // ISO date of next appointment
  visitPrepQuestions?: string[]; // user-curated questions for next visit
  emergencyContacts: EmergencyContact[];
  onboardingComplete: boolean;
  // Goals & personalisation
  goals?: GoalId[];
  subGoals?: SubGoalId[];
  birthIntention?: BirthIntention;
  feedingIntention?: FeedingIntention;
  personalIntentions?: string[];
  // TTC profile
  dateOfBirth?: string;        // ISO date YYYY-MM-DD — for age-based guidance
  ttcStartDate?: string;       // ISO date — approximate start of TTC journey
  knownConditions?: string[];  // e.g. ['pcos', 'endometriosis', 'thyroid', 'fibroids', 'irregular-cycles']
  cyclesIrregular?: boolean;   // derived from knownConditions but stored for quick access
}

interface AppContextType {
  user: AppUser | null;
  isLoading: boolean;
  setUser: (user: AppUser) => void;
  updateUser: (partial: Partial<AppUser>) => void;
  signIn: (email: string, password: string) => Promise<'ok' | 'not_found' | 'wrong_password'>;
  signOut: () => void;
  highlights: string[];
  addHighlight: (text: string) => void;
  removeHighlight: (index: number) => void;
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  cart: Record<string, number>;
  customBundle: CustomBundle | null;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  deleteFromCart: (id: string) => void;
  clearCart: () => void;
  setCustomBundle: (bundle: CustomBundle | null) => void;
  tasks: TaskItem[];
  addTask: (text: string, sourceSessionId?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  markVisitComplete: () => void;
}

const defaultUser: AppUser = {
  name: '',
  email: '',
  password: '',
  stage: 'pregnancy',
  emergencyContacts: [],
  onboardingComplete: false,
};

const AppContext = createContext<AppContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  updateUser: () => {},
  signIn: async () => 'not_found',
  signOut: () => {},
  highlights: [],
  addHighlight: () => {},
  removeHighlight: () => {},
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  cart: {},
  customBundle: null,
  addToCart: () => {},
  removeFromCart: () => {},
  deleteFromCart: () => {},
  clearCart: () => {},
  setCustomBundle: () => {},
  tasks: [],
  addTask: () => {},
  toggleTask: () => {},
  removeTask: () => {},
  markVisitComplete: () => {},
});

// Configure how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [cart, setCartState] = useState<Record<string, number>>({});
  const [customBundle, setCustomBundleState] = useState<CustomBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('askneo_user'),
      AsyncStorage.getItem('askneo_highlights'),
      AsyncStorage.getItem('askneo_wishlist'),
      AsyncStorage.getItem(TASKS_KEY),
      AsyncStorage.getItem('askneo_cart'),
      AsyncStorage.getItem('askneo_custom_bundle'),
    ]).then(([userVal, highlightsVal, wishlistVal, tasksVal, cartVal, customBundleVal]) => {
      if (userVal) setUserState(JSON.parse(userVal));
      if (highlightsVal) setHighlights(JSON.parse(highlightsVal));
      if (wishlistVal) setWishlist(JSON.parse(wishlistVal));
      if (tasksVal) setTasks(JSON.parse(tasksVal));
      if (cartVal) setCartState(JSON.parse(cartVal));
      if (customBundleVal) setCustomBundleState(JSON.parse(customBundleVal));
      setIsLoading(false);
    });
  }, []);

  // ── Task helpers ───────────────────────────────────────────────────────

  const addTask = (text: string, sourceSessionId?: string) => {
    setTasks(prev => {
      if (prev.some(t => t.text === text && !t.done)) return prev;
      const next = [...prev, { id: Date.now().toString(), text, done: false, sourceSessionId, addedAt: Date.now() }];
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markVisitComplete = () => {
    updateUser({
      // For pregnancy users, lastVisitDate is derived from ANC visits — don't overwrite it
      ...(user?.stage !== 'pregnancy' ? { lastVisitDate: new Date().toISOString().split('T')[0] } : {}),
      nextAppointmentDate: undefined,
      visitPrepQuestions: undefined,
    });
  };

  const removeTask = (id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ── Cart helpers ───────────────────────────────────────────────────────

  const addToCart = (id: string) => {
    setCartState(prev => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      AsyncStorage.setItem('askneo_cart', JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setCartState(prev => {
      const next = { ...prev };
      if ((next[id] ?? 0) <= 1) delete next[id];
      else next[id]--;
      AsyncStorage.setItem('askneo_cart', JSON.stringify(next));
      return next;
    });
  };

  const deleteFromCart = (id: string) => {
    setCartState(prev => {
      const { [id]: _, ...next } = prev;
      AsyncStorage.setItem('askneo_cart', JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    setCartState({});
    setCustomBundleState(null);
    AsyncStorage.multiRemove(['askneo_cart', 'askneo_custom_bundle']);
  };

  const setCustomBundle = (bundle: CustomBundle | null) => {
    setCustomBundleState(bundle);
    if (bundle) {
      AsyncStorage.setItem('askneo_custom_bundle', JSON.stringify(bundle));
    } else {
      AsyncStorage.removeItem('askneo_custom_bundle');
    }
  };

  // ── User helpers ───────────────────────────────────────────────────────

  const setUser = (u: AppUser) => {
    setUserState(u);
    AsyncStorage.multiRemove(['askneo_anc_visits', 'askneo_anc_setup_count']);
    AsyncStorage.setItem('askneo_user', JSON.stringify(u));
  };

  const updateUser = (partial: Partial<AppUser>) => {
    setUserState(prev => {
      const updated = { ...(prev ?? defaultUser), ...partial };
      AsyncStorage.setItem('askneo_user', JSON.stringify(updated));
      return updated;
    });
  };

  const signIn = async (email: string, password: string): Promise<'ok' | 'not_found' | 'wrong_password'> => {
    const stored = await AsyncStorage.getItem('askneo_user');
    if (!stored) return 'not_found';
    const storedUser: AppUser = JSON.parse(stored);
    if (storedUser.email !== email) return 'not_found';
    if (storedUser.password !== password) return 'wrong_password';
    setUserState(storedUser);
    return 'ok';
  };

  const signOut = () => {
    AsyncStorage.multiRemove(['askneo_user', 'askneo_highlights', 'askneo_chat_history', 'askneo_wishlist', 'askneo_cart', 'askneo_custom_bundle', 'askneo_anc_visits', 'askneo_anc_setup_count']);
    setUserState(null);
    setHighlights([]);
    setWishlist([]);
  };

  const addHighlight = (text: string) => {
    setHighlights(prev => {
      const next = [text, ...prev.filter(h => h !== text)].slice(0, 12);
      AsyncStorage.setItem('askneo_highlights', JSON.stringify(next));
      return next;
    });
  };

  const removeHighlight = (index: number) => {
    setHighlights(prev => {
      const next = prev.filter((_, i) => i !== index);
      AsyncStorage.setItem('askneo_highlights', JSON.stringify(next));
      return next;
    });
  };

  const addToWishlist = (item: WishlistItem) => {
    setWishlist(prev => {
      if (prev.some(w => w.id === item.id)) return prev;
      const next = [...prev, item];
      AsyncStorage.setItem('askneo_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => {
      const next = prev.filter(w => w.id !== id);
      AsyncStorage.setItem('askneo_wishlist', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      user, isLoading, setUser, updateUser, signIn, signOut,
      highlights, addHighlight, removeHighlight,
      wishlist, addToWishlist, removeFromWishlist,
      cart, customBundle, addToCart, removeFromCart, deleteFromCart, clearCart, setCustomBundle,
      tasks, addTask, toggleTask, removeTask, markVisitComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
