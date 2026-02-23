import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, UserStats, RecurrenceRule } from '../models/types';
import { requestNotificationPermissions, scheduleHabitReminder, cancelHabitReminder, rescheduleAllReminders } from '../utils/notifications';

// Default habits for the MVP
const DEFAULT_HABITS: Habit[] = [
    { id: '1', title: 'Breathing Exercises', category: 'morning', status: 'pending', pointsValue: 10 },
    { id: '2', title: 'Drink Water', category: 'morning', status: 'pending', pointsValue: 5 },
    { id: '3', title: 'Stretching', category: 'morning', status: 'pending', pointsValue: 15 },
    { id: '4', title: 'Cold Shower', category: 'morning', status: 'pending', pointsValue: 20 },
    { id: '5', title: 'Healthy Breakfast', category: 'morning', status: 'pending', pointsValue: 10 },
];

const DEFAULT_STATS: UserStats = {
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    lastLoginDate: new Date().toISOString().split('T')[0],
};

interface HabitContextType {
    habits: Habit[];
    todaysHabits: Habit[];
    activeHabits: Habit[];
    completedHabits: Habit[];
    postponedHabits: Habit[];
    skippedHabits: Habit[];
    userStats: UserStats;
    addHabit: (habit: Omit<Habit, 'id' | 'status'>) => void;
    toggleHabitCompletion: (id: string) => void;
    postponeHabit: (id: string, targetDate: string) => void;
    unpostponeHabit: (id: string) => void;
    skipHabit: (id: string) => void;
    updateHabitTimes: (id: string, dueTime?: string, reminderTime?: string) => void;
    resetDailyProgression: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Migrate old data: convert isCompleted boolean -> status string
const migrateHabits = (habits: any[]): Habit[] => {
    return habits.map(h => {
        if ('isCompleted' in h && !('status' in h)) {
            const { isCompleted, ...rest } = h;
            return { ...rest, status: isCompleted ? 'done' : 'pending' } as Habit;
        }
        return h as Habit;
    });
};

export const HabitProvider = ({ children }: { children: ReactNode }) => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Scheduling helper: determines if a habit is due today
    const isDueToday = (habit: Habit): boolean => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Handle postponed habits: only show on or after the target date
        if (habit.status === 'postponed' && habit.postponedUntil) {
            if (todayStr < habit.postponedUntil) return false;
            // Target date reached — reset to pending
            habit.status = 'pending';
            habit.postponedUntil = undefined;
        } else if (habit.status === 'postponed') {
            return false;
        }

        // Skipped habits don't show today
        if (habit.status === 'skipped') return false;

        const rule = habit.recurrence;
        if (!rule || rule.type === 'daily') return true;

        const dayOfWeek = today.getDay();
        const dateOfMonth = today.getDate();

        switch (rule.type) {
            case 'specific_days':
                return rule.daysOfWeek?.includes(dayOfWeek) ?? true;
            case 'every_other_day': {
                const start = new Date(rule.startDate);
                const diffTime = today.getTime() - start.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return diffDays % 2 === 0;
            }
            case 'weekly': {
                // Weekly now uses daysOfWeek (single day) instead of startDate
                if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
                    return rule.daysOfWeek.includes(dayOfWeek);
                }
                const startDay = new Date(rule.startDate).getDay();
                return dayOfWeek === startDay;
            }
            case 'monthly':
                return dateOfMonth === (rule.dayOfMonth ?? 1);
            default:
                return true;
        }
    };

    const todaysHabits = habits.filter(isDueToday);
    const activeHabits = todaysHabits.filter(h => h.status === 'pending');
    const completedHabits = todaysHabits.filter(h => h.status === 'done');
    const postponedHabits = habits.filter(h => h.status === 'postponed');
    const skippedHabits = habits.filter(h => h.status === 'skipped');

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedHabits = await AsyncStorage.getItem('@habits');
                const storedStats = await AsyncStorage.getItem('@userStats');

                if (storedHabits) {
                    const parsed = JSON.parse(storedHabits);
                    setHabits(migrateHabits(parsed));
                } else {
                    setHabits(DEFAULT_HABITS);
                }

                if (storedStats) setUserStats(JSON.parse(storedStats));

                setIsLoaded(true);

                // Request notification permissions and schedule reminders
                const hasPerms = await requestNotificationPermissions();
                if (hasPerms) {
                    const habitsToSchedule = storedHabits ? migrateHabits(JSON.parse(storedHabits)) : DEFAULT_HABITS;
                    await rescheduleAllReminders(habitsToSchedule);
                }
            } catch (e) {
                console.error('Failed to load local data', e);
            }
        };
        loadData();
    }, []);

    // Handle daily streak logic when app loads
    useEffect(() => {
        if (!isLoaded) return;

        const checkDailyReset = async () => {
            const today = new Date().toISOString().split('T')[0];
            if (userStats.lastLoginDate !== today) {
                const lastLogin = new Date(userStats.lastLoginDate);
                const currentDate = new Date(today);
                const timeDiff = currentDate.getTime() - lastLogin.getTime();
                const daysDiff = timeDiff / (1000 * 3600 * 24);

                let newStats = { ...userStats, lastLoginDate: today };

                if (daysDiff === 1) {
                    newStats.currentStreak += 1;
                    if (newStats.currentStreak > newStats.longestStreak) {
                        newStats.longestStreak = newStats.currentStreak;
                    }
                } else if (daysDiff > 1) {
                    newStats.currentStreak = 0;
                }

                setUserStats(newStats);
                resetDailyProgression();
                await AsyncStorage.setItem('@userStats', JSON.stringify(newStats));
            }
        };

        checkDailyReset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    const saveHabits = async (newHabits: Habit[]) => {
        setHabits(newHabits);
        await AsyncStorage.setItem('@habits', JSON.stringify(newHabits));
    };

    const saveStats = async (newStats: UserStats) => {
        setUserStats(newStats);
        await AsyncStorage.setItem('@userStats', JSON.stringify(newStats));
    };

    const addHabit = (habitData: Omit<Habit, 'id' | 'status'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: Date.now().toString(),
            status: 'pending',
        };
        saveHabits([...habits, newHabit]);
        // Schedule notification if reminder is set
        if (newHabit.reminderTime) {
            scheduleHabitReminder(newHabit);
        }
    };

    const toggleHabitCompletion = (id: string) => {
        let pointsToAdd = 0;
        const updatedHabits = habits.map(habit => {
            if (habit.id === id) {
                const newStatus = habit.status === 'done' ? 'pending' : 'done';
                if (newStatus === 'done') pointsToAdd = habit.pointsValue;
                else pointsToAdd = -habit.pointsValue;

                return { ...habit, status: newStatus } as Habit;
            }
            return habit;
        });

        saveHabits(updatedHabits);

        if (pointsToAdd !== 0) {
            saveStats({
                ...userStats,
                totalPoints: userStats.totalPoints + pointsToAdd,
            });
        }
    };

    const postponeHabit = (id: string, targetDate: string) => {
        const updatedHabits = habits.map(habit => {
            if (habit.id === id) {
                return { ...habit, status: 'postponed' as const, postponedUntil: targetDate };
            }
            return habit;
        });
        saveHabits(updatedHabits);
        cancelHabitReminder(id);
    };

    const unpostponeHabit = (id: string) => {
        const updatedHabits = habits.map(habit => {
            if (habit.id === id) {
                return { ...habit, status: 'pending' as const, postponedUntil: undefined };
            }
            return habit;
        });
        saveHabits(updatedHabits);
        // Reschedule notification
        const habit = updatedHabits.find(h => h.id === id);
        if (habit?.reminderTime) scheduleHabitReminder(habit);
    };

    const skipHabit = (id: string) => {
        const updatedHabits = habits.map(habit => {
            if (habit.id === id) {
                return { ...habit, status: 'skipped' as const };
            }
            return habit;
        });
        saveHabits(updatedHabits);
        cancelHabitReminder(id);
    };

    const resetDailyProgression = () => {
        // Reset done AND skipped back to pending on new day
        const resetHabits = habits.map(h => {
            if (h.status === 'done' || h.status === 'skipped') {
                return { ...h, status: 'pending' as const };
            }
            return h;
        });
        saveHabits(resetHabits);
    };

    const updateHabitTimes = (id: string, newDueTime?: string, newReminderTime?: string) => {
        let updatedHabit: Habit | null = null;
        const updatedHabits = habits.map(habit => {
            if (habit.id === id) {
                updatedHabit = { ...habit, dueTime: newDueTime, reminderTime: newReminderTime };
                return updatedHabit;
            }
            return habit;
        });
        saveHabits(updatedHabits);

        // Handle notification rescheduling
        if (updatedHabit) {
            cancelHabitReminder(id).then(() => {
                if ((updatedHabit as Habit).reminderTime && (updatedHabit as Habit).status === 'pending') {
                    scheduleHabitReminder(updatedHabit as Habit);
                }
            });
        }
    };

    return (
        <HabitContext.Provider value={{
            habits, todaysHabits, activeHabits, completedHabits, postponedHabits, skippedHabits,
            userStats, addHabit, toggleHabitCompletion, postponeHabit, unpostponeHabit, skipHabit, updateHabitTimes, resetDailyProgression,
        }}>
            {children}
        </HabitContext.Provider>
    );
};

export const useHabit = () => {
    const context = useContext(HabitContext);
    if (context === undefined) {
        throw new Error('useHabit must be used within a HabitProvider');
    }
    return context;
};
