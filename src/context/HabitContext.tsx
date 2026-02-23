import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, UserStats, RecurrenceRule } from '../models/types';

// Default habits for the MVP
const DEFAULT_HABITS: Habit[] = [
    { id: '1', title: 'Breathing Exercises', category: 'morning', isCompleted: false, pointsValue: 10 },
    { id: '2', title: 'Drink Water', category: 'morning', isCompleted: false, pointsValue: 5 },
    { id: '3', title: 'Stretching', category: 'morning', isCompleted: false, pointsValue: 15 },
    { id: '4', title: 'Cold Shower', category: 'morning', isCompleted: false, pointsValue: 20 },
    { id: '5', title: 'Healthy Breakfast', category: 'morning', isCompleted: false, pointsValue: 10 },
];

const DEFAULT_STATS: UserStats = {
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    lastLoginDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
};

interface HabitContextType {
    habits: Habit[];
    todaysHabits: Habit[];
    userStats: UserStats;
    addHabit: (habit: Omit<Habit, 'id' | 'isCompleted'>) => void;
    toggleHabitCompletion: (id: string) => void;
    resetDailyProgression: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider = ({ children }: { children: ReactNode }) => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Scheduling helper: determines if a habit is due today
    const isDueToday = (habit: Habit): boolean => {
        const rule = habit.recurrence;
        if (!rule || rule.type === 'daily') return true;

        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Sun...6=Sat
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

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedHabits = await AsyncStorage.getItem('@habits');
                const storedStats = await AsyncStorage.getItem('@userStats');

                if (storedHabits) setHabits(JSON.parse(storedHabits));
                else setHabits(DEFAULT_HABITS);

                if (storedStats) setUserStats(JSON.parse(storedStats));

                setIsLoaded(true);
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
                    // Maintained streak
                    newStats.currentStreak += 1;
                    if (newStats.currentStreak > newStats.longestStreak) {
                        newStats.longestStreak = newStats.currentStreak;
                    }
                } else if (daysDiff > 1) {
                    // Broke streak
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

    const addHabit = (habitData: Omit<Habit, 'id' | 'isCompleted'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: Date.now().toString(),
            isCompleted: false,
        };
        saveHabits([...habits, newHabit]);
    };

    const toggleHabitCompletion = (id: string) => {
        let pointsToAdd = 0;
        const updatedHabits = habits.map(habit => {
            if (habit.id === id) {
                if (!habit.isCompleted) pointsToAdd = habit.pointsValue;
                else pointsToAdd = -habit.pointsValue; // Subtract points if unchecking

                return { ...habit, isCompleted: !habit.isCompleted };
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

    const resetDailyProgression = () => {
        const resetHabits = habits.map(h => ({ ...h, isCompleted: false }));
        saveHabits(resetHabits);
    };

    return (
        <HabitContext.Provider value={{ habits, todaysHabits, userStats, addHabit, toggleHabitCompletion, resetDailyProgression }}>
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
