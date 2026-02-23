import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useHabit } from '@/src/context/HabitContext';
import { HabitItem } from '@/components/HabitItem';
import { UserStatsBanner } from '@/components/UserStatsBanner';
import { HealthConnectBanner } from '@/components/HealthConnectBanner';
import { auth } from '@/src/config/firebase';
import { signOut } from 'firebase/auth';
import { FontAwesome5 } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { habits, toggleHabitCompletion } = useHabit();

  const morningHabits = habits.filter(h => h.category === 'morning');
  const choreHabits = habits.filter(h => h.category === 'chore');
  const goodHabits = habits.filter(h => h.category === 'habit');
  const otherHabits = habits.filter(h => !['morning', 'chore', 'habit'].includes(h.category));

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today&apos;s Flow</Text>
            <Text style={styles.subtitle}>Let&apos;s build some momentum</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={20} color="#717171" />
          </TouchableOpacity>
        </View>

        <UserStatsBanner />
        <HealthConnectBanner />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning Routine</Text>
          {morningHabits.length > 0 ? (
            morningHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No morning habits set.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household Chores</Text>
          {choreHabits.length > 0 ? (
            choreHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No chores added today.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Good Habits</Text>
          {goodHabits.length > 0 ? (
            goodHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No habits added today.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Activities</Text>
          {otherHabits.length > 0 ? (
            otherHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No other activities planned today.</Text>
          )}
        </View>

        {/* Padding for bottom nav */}
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
  emptyText: {
    color: '#717171',
    fontStyle: 'italic',
    paddingHorizontal: 24,
  },
});
