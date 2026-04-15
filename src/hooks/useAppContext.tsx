import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const REMINDERS_KEY = 'askneo_reminder_timestamps';
const TASKS_KEY = 'askneo_tasks';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  sourceSessionId?: string;
  addedAt: number;
}

// Record<reminderId, completedAt timestamp (ms)>
export type ReminderLog = Record<string, number>;

export type UserStage = 'ttc' | 'pregnancy' | 'newmom' | 'partner';

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
  doctorName?: string;
  doctorPhone?: string;
  lastVisitDate?: string;        // ISO date of last doctor visit
  nextAppointmentDate?: string;  // ISO date of next appointment
  visitPrepQuestions?: string[]; // user-curated questions for next visit
  emergencyContacts: EmergencyContact[];
  onboardingComplete: boolean;
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
  reminderLog: ReminderLog;
  logReminder: (id: string, resetAfterHours?: number, label?: string) => void;
  clearReminder: (id: string) => void;
  isReminderDone: (id: string, resetAfterHours?: number) => boolean;
  reminderDueIn: (id: string, resetAfterHours?: number) => number | null; // minutes remaining, null if not done
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
  reminderLog: {},
  logReminder: () => {},
  clearReminder: () => {},
  isReminderDone: () => false,
  reminderDueIn: () => null,
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

async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleReminderNotification(id: string, label: string, afterHours: number) {
  // Cancel any existing notification for this reminder
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  const canNotify = await requestNotificationPermission();
  if (!canNotify) return;
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: 'Time to log again',
      body: label,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.round(afterHours * 3600),
      repeats: false,
    },
  });
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reminderLog, setReminderLog] = useState<ReminderLog>({});
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [cart, setCartState] = useState<Record<string, number>>({});
  const [customBundle, setCustomBundleState] = useState<CustomBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('askneo_user'),
      AsyncStorage.getItem('askneo_highlights'),
      AsyncStorage.getItem('askneo_wishlist'),
      AsyncStorage.getItem(REMINDERS_KEY),
      AsyncStorage.getItem(TASKS_KEY),
      AsyncStorage.getItem('askneo_cart'),
      AsyncStorage.getItem('askneo_custom_bundle'),
    ]).then(([userVal, highlightsVal, wishlistVal, remindersVal, tasksVal, cartVal, customBundleVal]) => {
      if (userVal) setUserState(JSON.parse(userVal));
      if (highlightsVal) setHighlights(JSON.parse(highlightsVal));
      if (wishlistVal) setWishlist(JSON.parse(wishlistVal));
      if (remindersVal) setReminderLog(JSON.parse(remindersVal));
      if (tasksVal) setTasks(JSON.parse(tasksVal));
      if (cartVal) setCartState(JSON.parse(cartVal));
      if (customBundleVal) setCustomBundleState(JSON.parse(customBundleVal));
      setIsLoading(false);
    });
  }, []);

  // ── Reminder helpers ───────────────────────────────────────────────────

  const isReminderDone = (id: string, resetAfterHours?: number): boolean => {
    const ts = reminderLog[id];
    if (!ts) return false;
    if (!resetAfterHours) return true; // no reset — stays done
    return Date.now() - ts < resetAfterHours * 3600_000;
  };

  // Returns minutes until reset (null if not currently done)
  const reminderDueIn = (id: string, resetAfterHours?: number): number | null => {
    const ts = reminderLog[id];
    if (!ts || !resetAfterHours) return null;
    const msLeft = resetAfterHours * 3600_000 - (Date.now() - ts);
    if (msLeft <= 0) return null;
    return Math.ceil(msLeft / 60_000);
  };

  const logReminder = (id: string, resetAfterHours?: number, label?: string) => {
    const now = Date.now();
    setReminderLog(prev => {
      const next = { ...prev, [id]: now };
      AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
      return next;
    });
    if (resetAfterHours && label) {
      scheduleReminderNotification(id, label, resetAfterHours);
    }
  };

  const clearReminder = (id: string) => {
    Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    setReminderLog(prev => {
      const { [id]: _, ...next } = prev;
      AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
      return next;
    });
  };

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
      lastVisitDate: new Date().toISOString().split('T')[0],
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
    AsyncStorage.multiRemove(['askneo_user', 'askneo_highlights', 'askneo_chat_history', 'askneo_wishlist', 'askneo_cart', 'askneo_custom_bundle']);
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
      reminderLog, logReminder, clearReminder, isReminderDone, reminderDueIn,
      tasks, addTask, toggleTask, removeTask, markVisitComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
