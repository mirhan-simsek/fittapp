import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';

export function Screen({ title, subtitle, children, right }: { title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{title}</Text>
              {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
            </View>
            {right}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.section}>{children}</Text>;
}

export function Btn({
  label,
  onPress,
  variant = 'primary',
  small,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? 'transparent' : colors.card2;
  const fg = variant === 'primary' ? colors.onAccent : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        small && { paddingVertical: 8, paddingHorizontal: 12 },
        { backgroundColor: bg, opacity: pressed ? 0.8 : 1 },
        variant === 'danger' && { borderWidth: 1, borderColor: colors.danger },
        style,
      ]}
    >
      <Text style={[s.btnText, { color: fg }, small && { fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
      <Text style={[s.chipText, active && { color: colors.onAccent, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.segItem, value === o.value && { backgroundColor: colors.accent }]}>
          <Text style={[s.segText, value === o.value && { color: colors.onAccent, fontWeight: '700' }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Field({
  value,
  onChangeText,
  placeholder,
  numeric,
  style,
  suffix,
  autoFocus,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  style?: StyleProp<TextStyle>;
  suffix?: string;
  autoFocus?: boolean;
}) {
  return (
    <View style={[s.fieldWrap, style as StyleProp<ViewStyle>]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.sub}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        autoFocus={autoFocus}
        style={s.field}
        selectTextOnFocus
      />
      {suffix ? <Text style={s.suffix}>{suffix}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, max, color = colors.accent }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={s.barBg}>
      <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      {sub ? <Text style={s.statSub}>{sub}</Text> : null}
    </View>
  );
}

export const Muted = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[{ color: colors.sub, fontSize: 13 }, style]}>{children}</Text>
);

/** Simple line chart built from plain Views (no extra dependencies). */
export function LineChart({ data, height = 160, color = colors.accent, unit }: { data: { label: string; value: number }[]; height?: number; color?: string; unit?: string }) {
  const [w, setW] = useState(0);
  const padX = 14;
  const padY = 16;
  if (data.length === 0) return null;

  const vals = data.map((d) => d.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const innerW = Math.max(1, w - padX * 2);
  const innerH = height - padY * 2;
  const pts = data.map((d, i) => ({
    x: padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: padY + (1 - (d.value - min) / span) * innerH,
  }));

  return (
    <View>
      <View style={{ height, width: '100%' }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && (
          <>
            {[0, 0.5, 1].map((p) => (
              <View key={p} style={[s.grid, { top: padY + p * innerH }]} />
            ))}
            {pts.slice(1).map((p, i) => {
              const a = pts[i];
              const dx = p.x - a.x;
              const dy = p.y - a.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: (a.x + p.x) / 2 - len / 2,
                    top: (a.y + p.y) / 2 - 1.25,
                    width: len,
                    height: 2.5,
                    borderRadius: 2,
                    backgroundColor: color,
                    transform: [{ rotate: `${angle}rad` }],
                  }}
                />
              );
            })}
            {pts.map((p, i) => (
              <View key={i} style={{ position: 'absolute', left: p.x - 4, top: p.y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: color, borderWidth: 2, borderColor: colors.card }} />
            ))}
          </>
        )}
      </View>
      <View style={s.chartFoot}>
        <Text style={s.chartLabel}>{data[0].label}</Text>
        <Text style={s.chartLabel}>
          {min.toFixed(1)}–{max.toFixed(1)} {unit ?? ''}
        </Text>
        <Text style={s.chartLabel}>{data[data.length - 1].label}</Text>
      </View>
    </View>
  );
}

export function BarChart({ data, height = 110, color = colors.accent }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: height + 34, gap: 8 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.chartLabel}>{d.value}</Text>
          <View style={{ height, justifyContent: 'flex-end', width: '100%' }}>
            <View style={{ height: Math.max(3, (d.value / max) * height), backgroundColor: d.value > 0 ? color : colors.border, borderRadius: 6 }} />
          </View>
          <Text style={[s.chartLabel, { marginTop: 4 }]}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.sub, fontSize: 14, marginTop: 2 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 },
  section: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 6 },
  btn: { borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },
  chip: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.text, fontSize: 13 },
  seg: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: 4, borderWidth: 1, borderColor: colors.border },
  segItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radius.sm },
  segText: { color: colors.sub, fontSize: 14 },
  fieldWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card2, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  field: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 10 },
  suffix: { color: colors.sub, fontSize: 13, marginLeft: 6 },
  barBg: { height: 8, borderRadius: 4, backgroundColor: colors.card2, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  statLabel: { color: colors.sub, fontSize: 12 },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
  statSub: { color: colors.sub, fontSize: 12, marginTop: 2 },
  grid: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border },
  chartFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLabel: { color: colors.sub, fontSize: 11 },
});
