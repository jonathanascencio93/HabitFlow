export type RecurrenceType = 'daily' | 'specific_days' | 'every_other_day' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  type: RecurrenceType;
  daysOfWeek?: number[];    // 0=Sun, 1=Mon...6=Sat (for 'specific_days')
  dayOfMonth?: number;      // 1-31 (for 'monthly')
  startDate: string;        // ISO date string — anchor for 'every_other_day' and 'weekly'
}

export type HabitStatus = 'pending' | 'done' | 'postponed';

export interface Habit {
  id: string;
  title: string;
  category: 'morning' | 'work' | 'health' | 'chore' | 'habit';
  status: HabitStatus;
  pointsValue: number;
  recurrence?: RecurrenceRule;
  timerMinutes?: number;
  postponedUntil?: string;   // ISO date string — habit reappears on this date
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastLoginDate: string; // ISO String
}

export interface HealthMetric {
  type: 'steps' | 'sleep' | 'workout';
  value: number; // e.g., number of steps, minutes of sleep
  date: string; // ISO String
}
