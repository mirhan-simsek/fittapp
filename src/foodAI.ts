import * as ImagePicker from 'expo-image-picker';
import { FOOD_AI_TOKEN, FOOD_AI_URL } from './config';
import type { Lang } from './i18n';

export interface AIFoodItem {
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

export interface AIResult {
  isFood: boolean;
  note: string;
  items: AIFoodItem[];
}

export type AIErrorCode =
  | 'not_configured'
  | 'permission'
  | 'cancelled'
  | 'network'
  | 'rate_limited'
  | 'unauthorized'
  | 'failed';

export class AIError extends Error {
  code: AIErrorCode;
  detail: string;
  constructor(code: AIErrorCode, detail = '') {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

export const isFoodAIConfigured = () => FOOD_AI_URL.trim().length > 0;

/** Opens camera or gallery, returns a compressed base64 JPEG. Throws AIError('cancelled') if the user backs out. */
export async function pickPhoto(source: 'camera' | 'gallery'): Promise<{ base64: string; mimeType: string }> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.4, // small upload, still good enough to recognise food
    base64: true,
    exif: false,
  };

  let result: ImagePicker.ImagePickerResult;
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new AIError('permission');
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new AIError('permission');
    result = await ImagePicker.launchImageLibraryAsync(options);
  }

  if (result.canceled || !result.assets?.[0]?.base64) throw new AIError('cancelled');
  return { base64: result.assets[0].base64, mimeType: result.assets[0].mimeType ?? 'image/jpeg' };
}

export async function analyzeFood(photo: { base64: string; mimeType: string }, lang: Lang): Promise<AIResult> {
  if (!isFoodAIConfigured()) throw new AIError('not_configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let res: Response;
  try {
    res = await fetch(FOOD_AI_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-app-token': FOOD_AI_TOKEN },
      body: JSON.stringify({ imageBase64: photo.base64, mimeType: photo.mimeType, lang }),
      signal: controller.signal,
    });
  } catch {
    throw new AIError('network');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) throw new AIError('rate_limited');
  if (res.status === 401) throw new AIError('unauthorized');
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = [`HTTP ${res.status}`, body?.error, body?.status ? `upstream ${body.status}` : '', body?.model, body?.detail]
        .filter(Boolean)
        .join(' · ');
    } catch {}
    throw new AIError('failed', detail);
  }

  try {
    return (await res.json()) as AIResult;
  } catch {
    throw new AIError('failed', 'Invalid response from server');
  }
}
