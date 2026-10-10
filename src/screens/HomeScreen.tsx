import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Btn, Card, Muted, ProgressBar, Screen, SectionTitle, Stat } from '../components/ui';
import { EXERCISE_MAP } from '../data/exercises';
import { useStore } from '../store';
import { colors } from '../theme';
import { dateKey, fmtDate, pad, startOfWeek } from '../utils';

export default function HomeScreen() {
  const { state, t } = useStore();
  const nav = useNavigation<any>();
  const today = dateKey();

  const weekStart = startOfWeek();
  const weekCount = state.workouts.filter((w) => new Date(w.date) >= weekStart).length;

  const kcal = state.meals.filter((m) => m.date === today).reduce((a, m) => a + m.kcal, 0);
  const water = state.water[today] ?? 0;
  const lastWeight = state.weights[state.weights.length - 1];
  const last = state.workouts[0];

  const r = state.reminder;
  const reminderText = r.enabled && r.days.length
    ? t('reminderOn', {
        days: [2, 3, 4, 5, 6, 7, 1]
          .filter((d) => r.days.includes(d))
          .map((d) => t(`d${d}` as 'd1'))
          .join(', '),
        time: `${pad(r.hour)}:${pad(r.minute)}`,
      })
    : t('reminderOff');

  return (
    <Screen title={t('hello')} subtitle={t('todaySub')}>
      <Card>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{t('weeklyGoal')}</Text>
        <Text style={{ color: colors.accent, fontSize: 26, fontWeight: '800' }}>
          {t('workoutsOfGoal', { n: weekCount, goal: state.goals.weeklyWorkouts })}
        </Text>
        <ProgressBar value={weekCount} max={state.goals.weeklyWorkouts} />
        <Btn label={t('startWorkout')} onPress={() => nav.navigate('Workout')} style={{ marginTop: 6 }} />
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Stat label={t('caloriesToday')} value={`${Math.round(kcal)}`} sub={`/ ${state.goals.kcal} ${t('kcal')}`} />
          <ProgressBar value={kcal} max={state.goals.kcal} color={colors.orange} />
        </Card>
        <Card style={{ flex: 1 }}>
          <Stat label={t('waterToday')} value={`${water}`} sub={`/ ${state.goals.waterMl} ${t('ml')}`} />
          <ProgressBar value={water} max={state.goals.waterMl} color={colors.blue} />
        </Card>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Stat
            label={t('latestWeight')}
            value={lastWeight ? `${lastWeight.kg} ${t('kg')}` : '—'}
            sub={lastWeight ? fmtDate(lastWeight.date, state.lang) : t('noWeight')}
          />
        </Card>
        <Card style={{ flex: 1 }}>
          <Stat label={t('totalWorkouts')} value={`${state.workouts.length}`} />
        </Card>
      </View>

      <SectionTitle>{t('lastWorkout')}</SectionTitle>
      <Card>
        {last ? (
          <>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{last.name}</Text>
            <Muted>
              {fmtDate(dateKey(new Date(last.date)), state.lang)} · {last.durationMin} {t('min')} ·{' '}
              {t('exercisesCount', { n: last.exercises.length })}
            </Muted>
            <Muted>
              {last.exercises
                .slice(0, 4)
                .map((e) => EXERCISE_MAP[e.exerciseId]?.name[state.lang] ?? e.exerciseId)
                .join(' • ')}
            </Muted>
          </>
        ) : (
          <Muted>{t('noWorkoutYet')}</Muted>
        )}
      </Card>

      <Card>
        <Muted>🔔 {reminderText}</Muted>
      </Card>
    </Screen>
  );
}
