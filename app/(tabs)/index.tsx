import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useHabit } from '@/src/context/HabitContext';
import { HabitItem } from '@/components/HabitItem';
import { UserStatsBanner } from '@/components/UserStatsBanner';
import { HealthConnectBanner } from '@/components/HealthConnectBanner';
import { auth } from '@/src/config/firebase';
import { signOut } from 'firebase/auth';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';

export default function DashboardScreen() {
  const { activeHabits, completedHabits, toggleHabitCompletion, postponeHabit } = useHabit();
  const { user } = useAuth();
  const displayName = user?.displayName || 'there';
  const [showCompleted, setShowCompleted] = useState(true);

  const morningActive = activeHabits.filter(h => h.category === 'morning');
  const choreActive = activeHabits.filter(h => h.category === 'chore');
  const habitActive = activeHabits.filter(h => h.category === 'habit');
  const otherActive = activeHabits.filter(h => !['morning', 'chore', 'habit'].includes(h.category));

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const renderSection = (title: string, items: typeof activeHabits) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onToggle={toggleHabitCompletion}
            onPostpone={postponeHabit}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today&apos;s Flow</Text>
            <Text style={styles.subtitle}>Let&apos;s go, {displayName} 💪</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={20} color="#717171" />
          </TouchableOpacity>
        </View>

        <UserStatsBanner />
        <HealthConnectBanner />

        {/* Active Habits — grouped by category */}
        {renderSection('Morning Routine', morningActive)}
        {renderSection('Household Chores', choreActive)}
        {renderSection('Good Habits', habitActive)}
        {renderSection('Other Activities', otherActive)}

        {/* Empty state when all habits are done */}
        {activeHabits.length === 0 && completedHabits.length > 0 && (
          <View style={styles.allDoneContainer}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <Text style={styles.allDoneText}>All done for today!</Text>
          </View>
        )}

        {/* Completed Today section */}
        {completedHabits.length > 0 && (
          <View style={styles.completedSection}>
            <TouchableOpacity
              style={styles.completedHeader}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <Text style={styles.completedTitle}>
                Completed Today ({completedHabits.length})
              </Text>
              <FontAwesome5
                name={showCompleted ? 'chevron-up' : 'chevron-down'}
                size={12}
                color="#717171"
              />
            </TouchableOpacity>
            {showCompleted && completedHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5EE',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 8,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#222222',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#717171',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FFE4E1',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  allDoneContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  allDoneEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  allDoneText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A8C4A',
  },
  completedSection: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#717171',
  },
});
