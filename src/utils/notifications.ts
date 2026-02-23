import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Habit } from '../models/types';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        console.log('Notifications require a physical device');
        return false;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
    }

    // iOS-specific channel setup
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
            name: 'Habit Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
        });
    }

    return true;
}

// Schedule a daily notification for a habit at its reminderTime
export async function scheduleHabitReminder(habit: Habit): Promise<string | null> {
    if (!habit.reminderTime) return null;

    // Cancel any existing reminder for this habit first
    await cancelHabitReminder(habit.id);

    const [hours, minutes] = habit.reminderTime.split(':').map(Number);

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: '⏰ Habit Reminder',
            body: `Time for: ${habit.title}`,
            data: { habitId: habit.id },
            sound: 'default',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hours,
            minute: minutes,
        },
    });

    return identifier;
}

// Cancel a specific habit's notification
export async function cancelHabitReminder(habitId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
        if (notification.content.data?.habitId === habitId) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
    }
}

// Reschedule all active habits' reminders (call on app load)
export async function rescheduleAllReminders(habits: Habit[]): Promise<void> {
    // Cancel all existing
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for active habits with reminders
    for (const habit of habits) {
        if (habit.reminderTime && habit.status !== 'postponed' && habit.status !== 'skipped') {
            await scheduleHabitReminder(habit);
        }
    }
}
