export interface Habit {
  id: string;
  title: string;
  category: 'morning' | 'work' | 'health' | 'chore' | 'habit';
  isCompleted: boolean;
  pointsValue: number;
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
