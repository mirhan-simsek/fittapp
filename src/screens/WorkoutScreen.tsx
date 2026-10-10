import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Btn, Card, Chip, Field, Muted, Screen, SectionTitle, Segmented } from '../components/ui';
import { EXERCISES, EXERCISE_MAP, MUSCLES, PROGRAMS } from '../data/exercises';
import { useStore } from '../store';
import { colors, radius } from '../theme';
import type { Muscle, Workout } from '../types';
import { dateKey, fmtDate, num, round1, uid } from '../utils';

interface DraftSet {
  id: string;
  kg: string;
  reps: string;
  done: boolean;
}
interface DraftExercise {
  key: string;
  exerciseId: string;
  sets: DraftSet[];
}
interface Draft {
  name: string;
  startedAt: number;
  exercises: DraftExercise[];
}

export default function WorkoutScreen() {
  const { state, t, addWorkout, deleteWorkout } = useStore();
  const [seg, setSeg] = useState<'log' | 'lib'>('log');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [muscle, setMuscle] = useState<Muscle | 'all'>('all');
  const lang = state.lang;

  // most recent logged sets for an exercise, used to prefill a new session
  const lastSets = (exerciseId: string) => {
    for (const w of state.workouts) {
      const found = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (found && found.sets.length) return found.sets;
    }
    return null;
  };

  const makeExercise = (exerciseId: string): DraftExercise => {
    const prev = lastSets(exerciseId);
    const sets: DraftSet[] = (prev && prev.length ? prev : [{ kg: 0, reps: 10 }]).map((x) => ({
      id: uid(),
      kg: x.kg ? String(x.kg) : '',
      reps: x.reps ? String(x.reps) : '',
      done: false,
    }));
    return { key: uid(), exerciseId, sets };
  };

  const start = (name: string, ids: string[]) => {
    setDraft({ name, startedAt: Date.now(), exercises: ids.map(makeExercise) });
  };

  const finish = () => {
    if (!draft) return;
    const exercises = draft.exercises
      .map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter((x) => x.done && num(x.reps) > 0).map((x) => ({ kg: num(x.kg), reps: num(x.reps) })),
      }))
      .filter((e) => e.sets.length > 0);
    if (exercises.length === 0) {
      Alert.alert(t('nothingToSave'), t('nothingToSaveBody'));
      return;
    }
    const w: Omit<Workout, 'id'> = {
      date: new Date().toISOString(),
      name: draft.name.trim() || t('defaultWorkoutName'),
      durationMin: Math.max(1, Math.round((Date.now() - draft.startedAt) / 60000)),
      exercises,
    };
    addWorkout(w);
    setDraft(null);
  };

  const discard = () => {
    Alert.alert(t('discardWorkout'), t('discardConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('discardWorkout'), style: 'destructive', onPress: () => setDraft(null) },
    ]);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(t('confirmDelete'), undefined, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteWorkout(id) },
    ]);
  };

  const volumeOf = (w: Workout) => w.exercises.reduce((a, e) => a + e.sets.reduce((b, x) => b + x.kg * x.reps, 0), 0);

  const library = useMemo(
    () => EXERCISES.filter((x) => muscle === 'all' || x.muscle === muscle),
    [muscle],
  );

  return (
    <Screen title={t('workoutTitle')}>
      <Segmented
        value={seg}
        onChange={setSeg}
        options={[
          { value: 'log', label: t('segLog') },
          { value: 'lib', label: t('segExercises') },
        ]}
      />

      {seg === 'log' ? (
        <>
          <Btn label={`＋ ${t('emptyWorkout')}`} onPress={() => start(t('defaultWorkoutName'), [])} />

          <SectionTitle>{t('programs')}</SectionTitle>
          {PROGRAMS.map((p) => (
            <Card key={p.id}>
              <Text style={st.cardTitle}>{p.name[lang]}</Text>
              <Muted>{p.desc[lang]}</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {p.days.map((d, i) => (
                  <Chip key={i} label={`▶ ${d.name[lang]}`} onPress={() => start(`${p.name[lang]} – ${d.name[lang]}`, d.exerciseIds)} />
                ))}
              </View>
            </Card>
          ))}

          <SectionTitle>{t('history')}</SectionTitle>
          {state.workouts.length === 0 ? (
            <Muted>{t('noHistory')}</Muted>
          ) : (
            state.workouts.slice(0, 30).map((w) => (
              <Card key={w.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardTitle}>{w.name}</Text>
                    <Muted>
                      {fmtDate(dateKey(new Date(w.date)), lang)} · {w.durationMin} {t('min')} · {t('volume')}: {Math.round(volumeOf(w))} {t('kg')}
                    </Muted>
                  </View>
                  <Pressable onPress={() => confirmDelete(w.id)} hitSlop={10}>
                    <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
                  </Pressable>
                </View>
                {w.exercises.map((e, i) => (
                  <Text key={i} style={{ color: colors.text, fontSize: 13 }}>
                    {EXERCISE_MAP[e.exerciseId]?.name[lang] ?? e.exerciseId}
                    <Text style={{ color: colors.sub }}>
                      {'  '}
                      {e.sets.map((x) => `${round1(x.kg)}×${x.reps}`).join('  ')}
                    </Text>
                  </Text>
                ))}
              </Card>
            ))
          )}
        </>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip label={t('all')} active={muscle === 'all'} onPress={() => setMuscle('all')} />
            {MUSCLES.map((m) => (
              <Chip key={m} label={t(`muscle_${m}` as 'muscle_chest')} active={muscle === m} onPress={() => setMuscle(m)} />
            ))}
          </ScrollView>
          <Card style={{ gap: 0, paddingVertical: 6 }}>
            {library.map((x, i) => (
              <View key={x.id} style={[st.libRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{x.name[lang]}</Text>
                <Muted>{t(`muscle_${x.muscle}` as 'muscle_chest')}</Muted>
              </View>
            ))}
          </Card>
        </>
      )}

      <Modal visible={!!draft} animationType="slide" onRequestClose={discard}>
        {draft && <Session draft={draft} setDraft={setDraft} makeExercise={makeExercise} onFinish={finish} onDiscard={discard} />}
      </Modal>
    </Screen>
  );
}

function Session({
  draft,
  setDraft,
  makeExercise,
  onFinish,
  onDiscard,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft | null>>;
  makeExercise: (id: string) => DraftExercise;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const { state, t } = useStore();
  const lang = state.lang;
  const [picker, setPicker] = useState(false);

  const update = (fn: (d: Draft) => Draft) => setDraft((d) => (d ? fn(d) : d));
  const updateSet = (ek: string, sid: string, patch: Partial<DraftSet>) =>
    update((d) => ({
      ...d,
      exercises: d.exercises.map((e) => (e.key === ek ? { ...e, sets: e.sets.map((x) => (x.id === sid ? { ...x, ...patch } : x)) } : e)),
    }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={st.sessHeader}>
        <Pressable onPress={onDiscard} hitSlop={10}>
          <Text style={{ color: colors.danger, fontSize: 15 }}>{t('discardWorkout')}</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t('activeWorkout')}</Text>
        <Pressable onPress={onFinish} hitSlop={10}>
          <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '700' }}>{t('done')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Field value={draft.name} onChangeText={(v) => update((d) => ({ ...d, name: v }))} placeholder={t('workoutName')} />

        {draft.exercises.length === 0 && <Muted>{t('noExercises')}</Muted>}

        {draft.exercises.map((ex) => (
          <Card key={ex.key}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[st.cardTitle, { flex: 1 }]}>{EXERCISE_MAP[ex.exerciseId]?.name[lang]}</Text>
              <Pressable onPress={() => update((d) => ({ ...d, exercises: d.exercises.filter((e) => e.key !== ex.key) }))} hitSlop={10}>
                <Text style={{ color: colors.sub, fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>
            {ex.sets.map((x, i) => (
              <View key={x.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: colors.sub, width: 22 }}>{i + 1}</Text>
                <Field style={{ flex: 1 }} numeric value={x.kg} onChangeText={(v) => updateSet(ex.key, x.id, { kg: v })} placeholder="0" suffix={t('kg')} />
                <Field style={{ flex: 1 }} numeric value={x.reps} onChangeText={(v) => updateSet(ex.key, x.id, { reps: v })} placeholder="0" suffix={t('reps')} />
                <Pressable
                  onPress={() => updateSet(ex.key, x.id, { done: !x.done })}
                  style={[st.check, x.done && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                >
                  <Text style={{ color: x.done ? colors.onAccent : colors.sub, fontWeight: '800' }}>✓</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    update((d) => ({
                      ...d,
                      exercises: d.exercises.map((e) => (e.key === ex.key ? { ...e, sets: e.sets.filter((y) => y.id !== x.id) } : e)),
                    }))
                  }
                  hitSlop={8}
                >
                  <Text style={{ color: colors.sub }}>－</Text>
                </Pressable>
              </View>
            ))}
            <Btn
              variant="ghost"
              small
              label={`＋ ${t('addSet')}`}
              onPress={() =>
                update((d) => ({
                  ...d,
                  exercises: d.exercises.map((e) => {
                    if (e.key !== ex.key) return e;
                    const prev = e.sets[e.sets.length - 1];
                    return { ...e, sets: [...e.sets, { id: uid(), kg: prev?.kg ?? '', reps: prev?.reps ?? '', done: false }] };
                  }),
                }))
              }
            />
          </Card>
        ))}

        <Btn variant="ghost" label={`＋ ${t('addExercise')}`} onPress={() => setPicker(true)} />
        <Btn label={t('finishWorkout')} onPress={onFinish} />
      </ScrollView>

      <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}>
        <Picker
          onClose={() => setPicker(false)}
          onPick={(id) => {
            update((d) => ({ ...d, exercises: [...d.exercises, makeExercise(id)] }));
            setPicker(false);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

function Picker({ onPick, onClose }: { onPick: (id: string) => void; onClose: () => void }) {
  const { state, t } = useStore();
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<Muscle | 'all'>('all');
  const lang = state.lang;
  const list = EXERCISES.filter(
    (x) => (muscle === 'all' || x.muscle === muscle) && x.name[lang].toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={st.sessHeader}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t('pickExercise')}</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{t('close')}</Text>
        </Pressable>
      </View>
      <View style={{ padding: 16, gap: 10 }}>
        <Field value={q} onChangeText={setQ} placeholder={t('search')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('all')} active={muscle === 'all'} onPress={() => setMuscle('all')} />
          {MUSCLES.map((m) => (
            <Chip key={m} label={t(`muscle_${m}` as 'muscle_chest')} active={muscle === m} onPress={() => setMuscle(m)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={list}
        keyExtractor={(x) => x.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPick(item.id)} style={[st.libRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{item.name[lang]}</Text>
            <Muted>{t(`muscle_${item.muscle}` as 'muscle_chest')}</Muted>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  libRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  sessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  check: { width: 36, height: 36, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card2 },
});
