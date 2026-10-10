import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { BarChart, Btn, Card, Field, LineChart, Muted, Screen, SectionTitle } from '../components/ui';
import { useStore } from '../store';
import { colors } from '../theme';
import type { Measurement } from '../types';
import { dateKey, fmtDate, num, round1, startOfWeek } from '../utils';

type MKey = 'waist' | 'chest' | 'hip' | 'arm' | 'thigh';
const M_KEYS: MKey[] = ['waist', 'chest', 'hip', 'arm', 'thigh'];

export default function ProgressScreen() {
  const { state, t, setWeight, deleteWeight, addMeasurement } = useStore();
  const lang = state.lang;
  const [w, setW] = useState('');
  const [m, setM] = useState<Record<MKey, string>>({ waist: '', chest: '', hip: '', arm: '', thigh: '' });

  const weights = state.weights;
  const first = weights[0];
  const last = weights[weights.length - 1];
  const diff = first && last ? round1(last.kg - first.kg) : 0;

  const submitWeight = () => {
    const v = num(w);
    if (v <= 20 || v > 400) {
      Alert.alert(t('invalidValue'));
      return;
    }
    setWeight(dateKey(), round1(v));
    setW('');
  };

  const submitMeasure = () => {
    const entry: Measurement = { date: dateKey() };
    let any = false;
    for (const k of M_KEYS) {
      const v = num(m[k]);
      if (v > 0) {
        entry[k] = v;
        any = true;
      }
    }
    if (!any) {
      Alert.alert(t('fillOne'));
      return;
    }
    // merge with an existing entry from today so partial inputs do not erase earlier ones
    const existing = state.measurements.find((x) => x.date === entry.date);
    addMeasurement({ ...existing, ...entry });
    setM({ waist: '', chest: '', hip: '', arm: '', thigh: '' });
  };

  // workouts per week, last 6 weeks (Monday-based)
  const thisWeek = startOfWeek();
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const start = new Date(thisWeek);
    start.setDate(start.getDate() - (5 - i) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const count = state.workouts.filter((x) => {
      const d = new Date(x.date);
      return d >= start && d < end;
    }).length;
    return { label: fmtDate(dateKey(start), lang, { day: 'numeric', month: 'numeric' }), value: count };
  });

  const lastM = state.measurements[state.measurements.length - 1];
  const prevM = state.measurements[state.measurements.length - 2];

  return (
    <Screen title={t('progressTitle')}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{t('weight')}</Text>
          {last ? (
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 20 }}>
              {last.kg} {t('kg')}
            </Text>
          ) : null}
        </View>
        {weights.length === 0 ? (
          <Muted>{t('noWeightData')}</Muted>
        ) : (
          <>
            <LineChart
              data={weights.slice(-20).map((x) => ({ label: fmtDate(x.date, lang), value: x.kg }))}
              unit={t('kg')}
            />
            {weights.length > 1 && (
              <Muted>
                {t('change')}: {diff > 0 ? '+' : ''}
                {diff} {t('kg')}
              </Muted>
            )}
          </>
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Field style={{ flex: 1 }} numeric value={w} onChangeText={setW} placeholder={t('weightPlaceholder')} />
          <Btn label={t('add')} onPress={submitWeight} />
        </View>
        {weights.length > 0 && (
          <View style={{ gap: 6, marginTop: 4 }}>
            {[...weights].reverse().slice(0, 5).map((x) => (
              <View key={x.date} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Muted>{fmtDate(x.date, lang, { day: 'numeric', month: 'long' })}</Muted>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <Text style={{ color: colors.text }}>
                    {x.kg} {t('kg')}
                  </Text>
                  <Pressable onPress={() => deleteWeight(x.date)} hitSlop={8}>
                    <Text style={{ color: colors.danger }}>✕</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <SectionTitle>{t('weeklyWorkoutsChart')}</SectionTitle>
      <Card>
        <BarChart data={weeks} />
      </Card>

      <SectionTitle>{t('measurements')}</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {M_KEYS.map((k) => (
            <View key={k} style={{ width: '48%' }}>
              <Muted style={{ marginBottom: 4 }}>{t(k)}</Muted>
              <Field numeric value={m[k]} onChangeText={(v) => setM((p) => ({ ...p, [k]: v }))} placeholder="0" suffix={t('cm')} />
            </View>
          ))}
        </View>
        <Btn label={t('saveMeasurements')} onPress={submitMeasure} />
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t('latestMeasurements')}</Text>
        {lastM ? (
          <>
            <Muted>{fmtDate(lastM.date, lang, { day: 'numeric', month: 'long' })}</Muted>
            {M_KEYS.filter((k) => lastM[k] !== undefined).map((k) => {
              const d = prevM && prevM[k] !== undefined ? round1((lastM[k] as number) - (prevM[k] as number)) : null;
              return (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text }}>{t(k)}</Text>
                  <Text style={{ color: colors.text }}>
                    {lastM[k]} {t('cm')}
                    {d !== null && d !== 0 ? (
                      <Text style={{ color: colors.sub }}>
                        {'  '}({d > 0 ? '+' : ''}
                        {d})
                      </Text>
                    ) : null}
                  </Text>
                </View>
              );
            })}
          </>
        ) : (
          <Muted>{t('noMeasurements')}</Muted>
        )}
      </Card>
    </Screen>
  );
}
