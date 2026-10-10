import type { Exercise, Muscle, Program } from '../types';

export const MUSCLES: Muscle[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];

const e = (id: string, muscle: Muscle, tr: string, en: string): Exercise => ({ id, muscle, name: { tr, en } });

export const EXERCISES: Exercise[] = [
  // chest
  e('bench_press', 'chest', 'Bench Press', 'Bench Press'),
  e('incline_db_press', 'chest', 'Eğimli Dumbbell Press', 'Incline Dumbbell Press'),
  e('chest_fly', 'chest', 'Dumbbell Fly', 'Dumbbell Fly'),
  e('push_up', 'chest', 'Şınav', 'Push-Up'),
  e('cable_crossover', 'chest', 'Kablo Crossover', 'Cable Crossover'),
  e('dips', 'chest', 'Paralel Bar (Dips)', 'Dips'),
  // back
  e('deadlift', 'back', 'Deadlift', 'Deadlift'),
  e('pull_up', 'back', 'Barfiks', 'Pull-Up'),
  e('lat_pulldown', 'back', 'Lat Pulldown', 'Lat Pulldown'),
  e('barbell_row', 'back', 'Barbell Row', 'Barbell Row'),
  e('seated_row', 'back', 'Oturarak Kablo Row', 'Seated Cable Row'),
  e('db_row', 'back', 'Tek Kol Dumbbell Row', 'One-Arm Dumbbell Row'),
  // legs
  e('squat', 'legs', 'Squat', 'Squat'),
  e('leg_press', 'legs', 'Leg Press', 'Leg Press'),
  e('rdl', 'legs', 'Romanian Deadlift', 'Romanian Deadlift'),
  e('lunge', 'legs', 'Lunge', 'Lunge'),
  e('leg_extension', 'legs', 'Leg Extension', 'Leg Extension'),
  e('leg_curl', 'legs', 'Leg Curl', 'Leg Curl'),
  e('calf_raise', 'legs', 'Baldır Kaldırma', 'Calf Raise'),
  e('hip_thrust', 'legs', 'Hip Thrust', 'Hip Thrust'),
  // shoulders
  e('ohp', 'shoulders', 'Overhead Press', 'Overhead Press'),
  e('db_shoulder_press', 'shoulders', 'Dumbbell Omuz Press', 'Dumbbell Shoulder Press'),
  e('lateral_raise', 'shoulders', 'Yana Açış', 'Lateral Raise'),
  e('face_pull', 'shoulders', 'Face Pull', 'Face Pull'),
  e('rear_delt_fly', 'shoulders', 'Arka Omuz Fly', 'Rear Delt Fly'),
  // arms
  e('barbell_curl', 'arms', 'Barbell Curl', 'Barbell Curl'),
  e('hammer_curl', 'arms', 'Hammer Curl', 'Hammer Curl'),
  e('tricep_pushdown', 'arms', 'Triceps Pushdown', 'Triceps Pushdown'),
  e('skullcrusher', 'arms', 'Skull Crusher', 'Skull Crusher'),
  e('overhead_ext', 'arms', 'Başüstü Triceps Ekstansiyon', 'Overhead Triceps Extension'),
  // core
  e('plank', 'core', 'Plank (sn)', 'Plank (sec)'),
  e('crunch', 'core', 'Mekik', 'Crunch'),
  e('leg_raise', 'core', 'Bacak Kaldırma', 'Hanging Leg Raise'),
  e('russian_twist', 'core', 'Russian Twist', 'Russian Twist'),
  // cardio
  e('run', 'cardio', 'Koşu (dk)', 'Running (min)'),
  e('cycling', 'cardio', 'Bisiklet (dk)', 'Cycling (min)'),
  e('rowing', 'cardio', 'Kürek Makinesi (dk)', 'Rowing Machine (min)'),
  e('jump_rope', 'cardio', 'İp Atlama (dk)', 'Jump Rope (min)'),
];

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((x) => [x.id, x]));

export const PROGRAMS: Program[] = [
  {
    id: 'fullbody3',
    name: { tr: 'Full Body (3 gün)', en: 'Full Body (3 days)' },
    desc: { tr: 'Yeni başlayanlar için haftada 3 gün tüm vücut.', en: 'Whole body 3 days a week, great for beginners.' },
    days: [
      { name: { tr: 'Gün A', en: 'Day A' }, exerciseIds: ['squat', 'bench_press', 'barbell_row', 'ohp', 'plank'] },
      { name: { tr: 'Gün B', en: 'Day B' }, exerciseIds: ['deadlift', 'incline_db_press', 'lat_pulldown', 'lunge', 'barbell_curl'] },
      { name: { tr: 'Gün C', en: 'Day C' }, exerciseIds: ['leg_press', 'dips', 'seated_row', 'lateral_raise', 'crunch'] },
    ],
  },
  {
    id: 'ppl',
    name: { tr: 'Push / Pull / Legs', en: 'Push / Pull / Legs' },
    desc: { tr: 'İtiş, çekiş ve bacak günleri; haftada 3–6 gün.', en: 'Push, pull and leg days; 3–6 days a week.' },
    days: [
      { name: { tr: 'Push', en: 'Push' }, exerciseIds: ['bench_press', 'ohp', 'incline_db_press', 'lateral_raise', 'tricep_pushdown'] },
      { name: { tr: 'Pull', en: 'Pull' }, exerciseIds: ['deadlift', 'pull_up', 'barbell_row', 'face_pull', 'barbell_curl'] },
      { name: { tr: 'Legs', en: 'Legs' }, exerciseIds: ['squat', 'rdl', 'leg_press', 'leg_curl', 'calf_raise'] },
    ],
  },
  {
    id: 'upperlower',
    name: { tr: 'Üst / Alt (4 gün)', en: 'Upper / Lower (4 days)' },
    desc: { tr: 'Haftada 4 gün üst ve alt vücut dönüşümlü.', en: 'Upper and lower body alternating, 4 days a week.' },
    days: [
      { name: { tr: 'Üst 1', en: 'Upper 1' }, exerciseIds: ['bench_press', 'barbell_row', 'db_shoulder_press', 'lat_pulldown', 'hammer_curl', 'tricep_pushdown'] },
      { name: { tr: 'Alt 1', en: 'Lower 1' }, exerciseIds: ['squat', 'rdl', 'leg_extension', 'calf_raise', 'plank'] },
      { name: { tr: 'Üst 2', en: 'Upper 2' }, exerciseIds: ['incline_db_press', 'pull_up', 'ohp', 'seated_row', 'barbell_curl', 'skullcrusher'] },
      { name: { tr: 'Alt 2', en: 'Lower 2' }, exerciseIds: ['deadlift', 'leg_press', 'lunge', 'leg_curl', 'hip_thrust'] },
    ],
  },
  {
    id: 'home',
    name: { tr: 'Evde Vücut Ağırlığı', en: 'Home Bodyweight' },
    desc: { tr: 'Ekipmansız, evde yapılabilen antrenman.', en: 'No equipment needed, train anywhere.' },
    days: [
      { name: { tr: 'Tüm Vücut', en: 'Full Body' }, exerciseIds: ['push_up', 'lunge', 'plank', 'crunch', 'jump_rope'] },
    ],
  },
];
