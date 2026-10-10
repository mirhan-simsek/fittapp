import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Reminder } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type ScheduleResult = 'ok' | 'denied' | 'unsupported';

/**
 * Replaces all scheduled workout reminders with the given configuration.
 * One weekly repeating notification is created per selected weekday.
 */
export async function scheduleReminders(r: Reminder, title: string, body: string): Promise<ScheduleResult> {
  if (Platform.OS === 'web') return 'unsupported';

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!r.enabled || r.days.length === 0) return 'ok';

  let perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return 'denied';

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Workout reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  for (const weekday of r.days) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: r.hour,
        minute: r.minute,
        channelId: 'reminders',
      },
    });
  }
  return 'ok';
}
