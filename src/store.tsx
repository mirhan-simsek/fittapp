import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Key, Lang, translate } from './i18n';
import type { AppState, Goals, Meal, Measurement, Reminder, Workout } from './types';
import { dateKey, uid } from './utils';

const STORAGE_KEY = 'fittrack:v1';

export const defaultState: AppState = {
  lang: 'tr',
  workouts: [],
  weights: [],
  measurements: [],
  meals: [],
  water: {},
  goals: { kcal: 2200, protein: 140, waterMl: 2500, weeklyWorkouts: 3 },
  reminder: { enabled: false, days: [2, 4, 6], hour: 18, minute: 0 },
};

type TFn = (key: Key, params?: Record<string, string | number>) => string;

interface StoreValue {
  state: AppState;
  ready: boolean;
  t: TFn;
  setLang: (l: Lang) => void;
  addWorkout: (w: Omit<Workout, 'id'>) => void;
  deleteWorkout: (id: string) => void;
  setWeight: (date: string, kg: number) => void;
  deleteWeight: (date: string) => void;
  addMeasurement: (m: Measurement) => void;
  addMeal: (m: Omit<Meal, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addWater: (date: string, deltaMl: number) => void;
  setGoals: (g: Goals) => void;
  setReminder: (r: Reminder) => void;
  reset: () => void;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // load once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState({
            ...defaultState,
            ...parsed,
            goals: { ...defaultState.goals, ...(parsed.goals ?? {}) },
            reminder: { ...defaultState.reminder, ...(parsed.reminder ?? {}) },
          });
        }
      } catch {
        // corrupted storage: start fresh
      } finally {
        loaded.current = true;
        setReady(true);
      }
    })();
  }, []);

  // persist on every change (after the initial load)
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const t = useCallback<TFn>((key, params) => translate(state.lang, key, params), [state.lang]);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      ready,
      t,
      setLang: (lang) => setState((s) => ({ ...s, lang })),
      addWorkout: (w) => setState((s) => ({ ...s, workouts: [{ ...w, id: uid() }, ...s.workouts] })),
      deleteWorkout: (id) => setState((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== id) })),
      setWeight: (date, kg) =>
        setState((s) => ({
          ...s,
          weights: [...s.weights.filter((w) => w.date !== date), { date, kg }].sort((a, b) => a.date.localeCompare(b.date)),
        })),
      deleteWeight: (date) => setState((s) => ({ ...s, weights: s.weights.filter((w) => w.date !== date) })),
      addMeasurement: (m) =>
        setState((s) => ({
          ...s,
          measurements: [...s.measurements.filter((x) => x.date !== m.date), m].sort((a, b) => a.date.localeCompare(b.date)),
        })),
      addMeal: (m) => setState((s) => ({ ...s, meals: [...s.meals, { ...m, id: uid() }] })),
      deleteMeal: (id) => setState((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) })),
      addWater: (date, delta) =>
        setState((s) => ({ ...s, water: { ...s.water, [date]: Math.max(0, (s.water[date] ?? 0) + delta) } })),
      setGoals: (goals) => setState((s) => ({ ...s, goals })),
      setReminder: (reminder) => setState((s) => ({ ...s, reminder })),
      reset: () => setState((s) => ({ ...defaultState, lang: s.lang })),
    }),
    [state, ready, t],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}

export { dateKey };
