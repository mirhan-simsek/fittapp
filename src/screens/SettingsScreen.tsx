import React, { useEffect, useState } from 'react';
import { Alert, Platform, Switch, Text, View } from 'react-native';
import { Btn, Card, Chip, Field, Muted, Screen, SectionTitle, Segmented } from '../components/ui';
import { scheduleReminders } from '../notifications';
import { useStore } from '../store';
import { colors } from '../theme';
import type { Reminder } from '../types';
import { num, pad } from '../utils';

const DAY_ORDER = [2, 3, 4, 5, 6, 7, 1]; // Mon..Sun in expo weekday numbering

export default function SettingsScreen() {
  const { state, t, setLang, setGoals, setReminder, reset } = useStore();
  const g = state.goals;
  const r = state.reminder;

  const [kcal, setKcal] = useState(String(g.kcal));
  const [protein, setProtein] = useState(String(g.protein));
  const [water, setWater] = useState(String(g.waterMl));
  const [weekly, setWeekly] = useState(String(g.weeklyWorkouts));

  useEffect(() => {
    setKcal(String(g.kcal));
    setProtein(String(g.protein));
    setWater(String(g.waterMl));
    setWeekly(String(g.weeklyWorkouts));
  }, [g.kcal, g.protein, g.waterMl, g.weeklyWorkouts]);

  const saveGoals = () => {
    const next = { kcal: Math.round(num(kcal)), protein: Math.round(num(protein)), waterMl: Math.round(num(water)), weeklyWorkouts: Math.round(num(weekly)) };
    if (next.kcal <= 0 || next.protein <= 0 || next.waterMl <= 0 || next.weeklyWorkouts <= 0 || next.weeklyWorkouts > 14) {
      Alert.alert(t('invalidValue'));
      return;
    }
    setGoals(next);
    Alert.alert(t('save'), '✓');
  };

  const applyReminder = async (next: Reminder) => {
    setReminder(next);
    try {
      const res = await scheduleReminders(next, t('reminderTitle'), t('reminderBody'));
      if (res === 'denied') {
        setReminder({ ...next, enabled: false });
        Alert.alert(t('permissionDenied'));
      } else if (res === 'unsupported' && next.enabled) {
        Alert.alert(t('notSupportedWeb'));
      }
    } catch {
      // scheduling can fail in some environments (e.g. Expo Go limitations); keep UI usable
    }
  };

  // keep scheduled notification text in sync when the language changes
  useEffect(() => {
    if (state.reminder.enabled) {
      scheduleReminders(state.reminder, t('reminderTitle'), t('reminderBody')).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lang]);

  const toggleDay = (d: number) => {
    const days = r.days.includes(d) ? r.days.filter((x) => x !== d) : [...r.days, d];
    applyReminder({ ...r, days });
  };

  const stepHour = (delta: number) => applyReminder({ ...r, hour: (r.hour + delta + 24) % 24 });
  const stepMinute = (delta: number) => applyReminder({ ...r, minute: (r.minute + delta + 60) % 60 });

  const confirmReset = () => {
    Alert.alert(t('resetData'), t('resetConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          reset();
          if (Platform.OS !== 'web') {
            try {
              await scheduleReminders({ ...r, enabled: false }, '', '');
            } catch {}
          }
          Alert.alert(t('resetDone'));
        },
      },
    ]);
  };

  return (
    <Screen title={t('settingsTitle')}>
      <SectionTitle>{t('language')}</SectionTitle>
      <Segmented
        value={state.lang}
        onChange={setLang}
        options={[
          { value: 'tr', label: 'Türkçe' },
          { value: 'en', label: 'English' },
        ]}
      />

      <SectionTitle>{t('goals')}</SectionTitle>
      <Card>
        <Muted>{t('goalKcal')}</Muted>
        <Field numeric value={kcal} onChangeText={setKcal} />
        <Muted>{t('goalProtein')}</Muted>
        <Field numeric value={protein} onChangeText={setProtein} />
        <Muted>{t('goalWater')}</Muted>
        <Field numeric value={water} onChangeText={setWater} />
        <Muted>{t('goalWorkouts')}</Muted>
        <Field numeric value={weekly} onChangeText={setWeekly} />
        <Btn label={t('save')} onPress={saveGoals} />
      </Card>

      <SectionTitle>{t('reminders')}</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontSize: 15 }}>{t('remindersOn')}</Text>
          <Switch
            value={r.enabled}
            onValueChange={(v) => applyReminder({ ...r, enabled: v })}
            trackColor={{ true: colors.accent, false: colors.card2 }}
            thumbColor="#fff"
          />
        </View>
        <Muted>{t('remindDays')}</Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DAY_ORDER.map((d) => (
            <Chip key={d} label={t(`d${d}` as 'd1')} active={r.days.includes(d)} onPress={() => toggleDay(d)} />
          ))}
        </View>
        <Muted>{t('remindTime')}</Muted>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Btn small variant="ghost" label="−" onPress={() => stepHour(-1)} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>{pad(r.hour)}</Text>
          <Btn small variant="ghost" label="+" onPress={() => stepHour(1)} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>:</Text>
          <Btn small variant="ghost" label="−" onPress={() => stepMinute(-5)} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>{pad(r.minute)}</Text>
          <Btn small variant="ghost" label="+" onPress={() => stepMinute(5)} />
        </View>
      </Card>

      <SectionTitle>{t('data')}</SectionTitle>
      <Muted>{t('storedLocally')}</Muted>
      <Btn variant="danger" label={t('resetData')} onPress={confirmReset} />
    </Screen>
  );
}
