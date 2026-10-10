import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { AIError, analyzeFood, isFoodAIConfigured, pickPhoto } from '../foodAI';
import type { Key } from '../i18n';

interface AIDraft {
  name: string;
  portion: string;
  kcal: string;
  protein: string;
  carb: string;
  fat: string;
}
import { Btn, Card, Field, Muted, ProgressBar, Screen, SectionTitle, Stat } from '../components/ui';
import { foods } from '../data/foods';
import { useStore } from '../store';
import { colors } from '../theme';
import { addDays, dateKey, fmtDate, num } from '../utils';

export default function NutritionScreen() {
  const { state, t, addMeal, deleteMeal, addWater } = useStore();
  const [date, setDate] = useState(dateKey());
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carb, setCarb] = useState('');
  const [fat, setFat] = useState('');
  const [foodQ, setFoodQ] = useState('');
  const foodMatches = foods
    .filter((f) => f.name.toLocaleLowerCase('tr').includes(foodQ.trim().toLocaleLowerCase('tr')))
    .slice(0, 6);

  const [aiBusy, setAiBusy] = useState(false);
  const [aiItems, setAiItems] = useState<AIDraft[] | null>(null);
  const [aiNote, setAiNote] = useState('');

  const updateAi = (i: number, patch: Partial<AIDraft>) =>
    setAiItems((items) => (items ? items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) : items));

  const showError = (e: unknown) => {
    const code = e instanceof AIError ? e.code : 'failed';
    if (code === 'cancelled') return;
    const map: Record<string, Key> = {
      not_configured: 'errNotConfigured',
      permission: 'errPermission',
      network: 'errNetwork',
      rate_limited: 'errRateLimited',
      unauthorized: 'errUnauthorized',
      failed: 'errFailed',
    };
    Alert.alert(t(map[code] ?? 'errFailed'), e instanceof AIError && e.detail ? e.detail : undefined);
  };

  const runPhoto = async (source: 'camera' | 'gallery') => {
    if (!isFoodAIConfigured()) {
      Alert.alert(t('errNotConfigured'));
      return;
    }
    try {
      const photo = await pickPhoto(source);
      setAiBusy(true);
      setAiItems(null);
      const res = await analyzeFood(photo, state.lang);
      if (!res.isFood || res.items.length === 0) {
        Alert.alert(t('photoNoFood'));
        return;
      }
      setAiNote(res.note ?? '');
      setAiItems(
        res.items.map((x) => ({
          name: x.name,
          portion: x.portion,
          kcal: String(x.kcal),
          protein: String(x.protein),
          carb: String(x.carb),
          fat: String(x.fat),
        })),
      );
    } catch (e) {
      showError(e);
    } finally {
      setAiBusy(false);
    }
  };

  const choosePhotoSource = () =>
    Alert.alert(t('photoCalc'), undefined, [
      { text: t('photoCamera'), onPress: () => runPhoto('camera') },
      { text: t('photoGallery'), onPress: () => runPhoto('gallery') },
      { text: t('cancel'), style: 'cancel' },
    ]);

  const addAiItems = () => {
    if (!aiItems) return;
    for (const it of aiItems) {
      const k = num(it.kcal);
      if (k <= 0) continue;
      addMeal({ date, name: it.name.trim() || t('meals'), kcal: k, protein: num(it.protein), carb: num(it.carb), fat: num(it.fat) });
    }
    setAiItems(null);
  };

  const today = dateKey();
  const meals = state.meals.filter((m) => m.date === date);
  const total = meals.reduce(
    (a, m) => ({ kcal: a.kcal + m.kcal, protein: a.protein + m.protein, carb: a.carb + m.carb, fat: a.fat + m.fat }),
    { kcal: 0, protein: 0, carb: 0, fat: 0 },
  );
  const water = state.water[date] ?? 0;
  const left = state.goals.kcal - total.kcal;

  const label = date === today ? t('today') : date === addDays(today, -1) ? t('yesterday') : fmtDate(date, state.lang, { day: 'numeric', month: 'long' });

  const submit = () => {
    const k = num(kcal);
    if (!name.trim() && k <= 0) {
      Alert.alert(t('invalidValue'));
      return;
    }
    if (k <= 0) {
      Alert.alert(t('invalidValue'));
      return;
    }
    addMeal({ date, name: name.trim() || t('meals'), kcal: k, protein: num(protein), carb: num(carb), fat: num(fat) });
    setName('');
    setKcal('');
    setProtein('');
    setCarb('');
    setFat('');
  };

  return (
    <Screen title={t('nutritionTitle')}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Btn small variant="ghost" label="‹" onPress={() => setDate(addDays(date, -1))} />
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{label}</Text>
        <Btn small variant="ghost" label="›" onPress={() => date < today && setDate(addDays(date, 1))} style={date >= today ? { opacity: 0.35 } : undefined} />
      </View>

      <Card>
        <Stat label={t('calories')} value={`${Math.round(total.kcal)} / ${state.goals.kcal} ${t('kcal')}`} sub={left >= 0 ? t('remaining', { n: Math.round(left) }) : t('over', { n: Math.round(-left) })} />
        <ProgressBar value={total.kcal} max={state.goals.kcal} color={left >= 0 ? colors.orange : colors.danger} />
        <Text style={{ color: colors.text, fontWeight: '700', marginTop: 8 }}>{t('macros')}</Text>
        <Macro label={t('protein')} value={total.protein} goal={state.goals.protein} color={colors.accent} unit={t('g')} />
        <Macro label={t('carb')} value={total.carb} color={colors.blue} unit={t('g')} />
        <Macro label={t('fat')} value={total.fat} color={colors.orange} unit={t('g')} />
      </Card>

      <Card>
        <Stat label={`💧 ${t('water')}`} value={`${water} / ${state.goals.waterMl} ${t('ml')}`} />
        <ProgressBar value={water} max={state.goals.waterMl} color={colors.blue} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Btn small variant="ghost" label="−250" onPress={() => addWater(date, -250)} style={{ flex: 1 }} />
          <Btn small label="+250" onPress={() => addWater(date, 250)} style={{ flex: 1 }} />
          <Btn small label="+500" onPress={() => addWater(date, 500)} style={{ flex: 1 }} />
        </View>
      </Card>

      <Btn label={t('photoCalc')} onPress={choosePhotoSource} />
      {aiBusy && (
        <Card style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: colors.text }}>{t('photoAnalyzing')}</Text>
        </Card>
      )}
      {aiItems && (
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t('photoResult')}</Text>
          <Muted>{aiNote ? `${aiNote} ` : ''}{t('photoEditHint')}</Muted>
          {aiItems.map((it, i) => (
            <View key={i} style={{ gap: 6, paddingTop: 6, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <Field value={it.name} onChangeText={(v) => updateAi(i, { name: v })} />
              {it.portion ? <Muted>{it.portion}</Muted> : null}
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Field style={{ flex: 1 }} numeric value={it.kcal} onChangeText={(v) => updateAi(i, { kcal: v })} suffix={t('kcal')} />
                <Field style={{ flex: 1 }} numeric value={it.protein} onChangeText={(v) => updateAi(i, { protein: v })} suffix="P" />
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Field style={{ flex: 1 }} numeric value={it.carb} onChangeText={(v) => updateAi(i, { carb: v })} suffix="K" />
                <Field style={{ flex: 1 }} numeric value={it.fat} onChangeText={(v) => updateAi(i, { fat: v })} suffix="Y" />
              </View>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn variant="ghost" label={t('photoDiscard')} onPress={() => setAiItems(null)} style={{ flex: 1 }} />
            <Btn label={t('photoAddAll')} onPress={addAiItems} style={{ flex: 1 }} />
          </View>
        </Card>
      )}

      <SectionTitle>{t('quickAdd')}</SectionTitle>
      <Card>
        <Field value={foodQ} onChangeText={setFoodQ} placeholder={t('searchFood')} />
        {foodQ.trim().length > 0 &&
          foodMatches.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => {
                addMeal({ date, name: `${f.name} (${f.per})`, kcal: f.kcal, protein: f.protein, carb: f.carbs, fat: f.fat });
                setFoodQ('');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 14 }}>{f.name}</Text>
                <Muted>
                  {f.per} · {f.kcal} {t('kcal')} · P {f.protein}
                </Muted>
              </View>
              <Text style={{ color: colors.accent, fontSize: 20 }}>＋</Text>
            </Pressable>
          ))}
      </Card>

      <SectionTitle>{t('addMeal')}</SectionTitle>
      <Card>
        <Field value={name} onChangeText={setName} placeholder={t('mealName')} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Field style={{ flex: 1 }} numeric value={kcal} onChangeText={setKcal} placeholder={t('kcal')} />
          <Field style={{ flex: 1 }} numeric value={protein} onChangeText={setProtein} placeholder={`${t('protein')} (${t('g')})`} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Field style={{ flex: 1 }} numeric value={carb} onChangeText={setCarb} placeholder={`${t('carb')} (${t('g')})`} />
          <Field style={{ flex: 1 }} numeric value={fat} onChangeText={setFat} placeholder={`${t('fat')} (${t('g')})`} />
        </View>
        <Btn label={t('add')} onPress={submit} />
      </Card>

      <SectionTitle>{t('meals')}</SectionTitle>
      {meals.length === 0 ? (
        <Muted>{t('noMeals')}</Muted>
      ) : (
        meals.map((m) => (
          <Card key={m.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{m.name}</Text>
                <Muted>
                  {Math.round(m.kcal)} {t('kcal')} · P {Math.round(m.protein)} · K {Math.round(m.carb)} · Y {Math.round(m.fat)}
                </Muted>
              </View>
              <Pressable onPress={() => deleteMeal(m.id)} hitSlop={10}>
                <Text style={{ color: colors.danger, fontSize: 18 }}>🗑</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

function Macro({ label, value, goal, color, unit }: { label: string; value: number; goal?: number; color: string; unit: string }) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Muted>{label}</Muted>
        <Muted>
          {Math.round(value)}
          {goal ? ` / ${goal}` : ''} {unit}
        </Muted>
      </View>
      <ProgressBar value={value} max={goal ?? Math.max(value, 1)} color={color} />
    </View>
  );
}
