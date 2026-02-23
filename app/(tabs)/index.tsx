import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useHabit } from '@/src/context/HabitContext';
import { HabitItem } from '@/components/HabitItem';
import { TimerModal } from '@/components/TimerModal';
import { EditTimesModal } from '@/components/EditTimesModal';
import { UserStatsBanner } from '@/components/UserStatsBanner';
import { HealthConnectBanner } from '@/components/HealthConnectBanner';
import { auth } from '@/src/config/firebase';
import { signOut } from 'firebase/auth';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Helper to format date nicely
const formatDate = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

const addDays = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const toISODate = (d: Date) => d.toISOString().split('T')[0];

export default function DashboardScreen() {
  const { activeHabits, completedHabits, postponedHabits, skippedHabits, toggleHabitCompletion, postponeHabit, unpostponeHabit, skipHabit, updateHabitTimes } = useHabit();
  const { user } = useAuth();
  const displayName = user?.displayName || 'there';
  const [showCompleted, setShowCompleted] = useState(true);
  const [postponeModal, setPostponeModal] = useState<{ visible: boolean; habitId: string; habitTitle: string }>({
    visible: false, habitId: '', habitTitle: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(addDays(1));
  const [timerModal, setTimerModal] = useState<{ visible: boolean; habitId: string; habitTitle: string; duration: number }>({
    visible: false, habitId: '', habitTitle: '', duration: 0,
  });
  const [editTimesModal, setEditTimesModal] = useState<{ visible: boolean; habitId: string; habitTitle: string; dueTime?: string; reminderTime?: string }>({
    visible: false, habitId: '', habitTitle: '',
  });

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

  const handlePostponeRequest = (id: string) => {
    const habit = activeHabits.find(h => h.id === id);
    setPickerDate(addDays(1));
    setShowDatePicker(false);
    setPostponeModal({ visible: true, habitId: id, habitTitle: habit?.title || '' });
  };

  const handlePostponeConfirm = (targetDate: string) => {
    postponeHabit(postponeModal.habitId, targetDate);
    setPostponeModal({ visible: false, habitId: '', habitTitle: '' });
    setShowDatePicker(false);
  };

  const handleTimerOpen = (id: string) => {
    const habit = [...activeHabits, ...completedHabits].find(h => h.id === id);
    if (habit?.timerMinutes) {
      setTimerModal({ visible: true, habitId: id, habitTitle: habit.title, duration: habit.timerMinutes });
    }
  };

  const handleTimerComplete = () => {
    toggleHabitCompletion(timerModal.habitId);
  };

  const handleEditTimesOpen = (id: string) => {
    const habit = [...activeHabits, ...postponedHabits].find(h => h.id === id);
    if (habit) {
      setEditTimesModal({
        visible: true,
        habitId: habit.id,
        habitTitle: habit.title,
        dueTime: habit.dueTime,
        reminderTime: habit.reminderTime,
      });
    }
  };

  const handleEditTimesSave = (id: string, dueTime?: string, reminderTime?: string) => {
    updateHabitTimes(id, dueTime, reminderTime);
    setEditTimesModal(prev => ({ ...prev, visible: false }));
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        handlePostponeConfirm(toISODate(selectedDate));
      }
    } else {
      if (selectedDate) setPickerDate(selectedDate);
    }
  };

  const postponeOptions = [
    { label: 'Tomorrow', date: addDays(1), icon: 'arrow-right' },
    { label: 'In 2 Days', date: addDays(2), icon: 'forward' },
    { label: 'Next Week', date: addDays(7), icon: 'calendar-week' },
  ];

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
            onPostpone={handlePostponeRequest}
            onSkip={skipHabit}
            onTimer={handleTimerOpen}
            onExtendDue={(id, newTime) => updateHabitTimes(id, newTime)}
            onEditTimes={handleEditTimesOpen}
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

        {renderSection('Morning Routine', morningActive)}
        {renderSection('Household Chores', choreActive)}
        {renderSection('Good Habits', habitActive)}
        {renderSection('Other Activities', otherActive)}

        {activeHabits.length === 0 && completedHabits.length > 0 && (
          <View style={styles.allDoneContainer}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <Text style={styles.allDoneText}>All done for today!</Text>
          </View>
        )}

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

        {/* Moved to Another Day section */}
        {postponedHabits.length > 0 && (
          <View style={styles.postponedSection}>
            <Text style={styles.postponedTitle}>
              📅 Moved to Another Day ({postponedHabits.length})
            </Text>
            {postponedHabits.map(habit => (
              <View key={habit.id} style={styles.postponedItem}>
                <View style={styles.postponedInfo}>
                  <Text style={styles.postponedItemTitle}>{habit.title}</Text>
                  <Text style={styles.postponedItemDate}>
                    Scheduled for {habit.postponedUntil ? formatDate(new Date(habit.postponedUntil + 'T12:00:00')) : 'later'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.bringBackButton}
                  onPress={() => unpostponeHabit(habit.id)}
                >
                  <FontAwesome5 name="undo" size={12} color="#FF6B6B" />
                  <Text style={styles.bringBackText}>Bring Back</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {/* Skipped Today section */}
        {skippedHabits.length > 0 && (
          <View style={styles.skippedSection}>
            <Text style={styles.skippedTitle}>
              Skipped ({skippedHabits.length})
            </Text>
            {skippedHabits.map(habit => (
              <View key={habit.id} style={styles.skippedItem}>
                <Text style={styles.skippedItemTitle}>{habit.title}</Text>
                <TouchableOpacity
                  style={styles.undoSkipButton}
                  onPress={() => unpostponeHabit(habit.id)}
                >
                  <FontAwesome5 name="undo" size={11} color="#717171" />
                  <Text style={styles.undoSkipText}>Undo</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Postpone Modal */}
      <Modal
        visible={postponeModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setPostponeModal({ ...postponeModal, visible: false })}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { setPostponeModal({ ...postponeModal, visible: false }); setShowDatePicker(false); }}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Move to another day</Text>
            <Text style={styles.modalSubtitle}>{postponeModal.habitTitle}</Text>

            {/* Quick Options */}
            {postponeOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.modalOption}
                onPress={() => handlePostponeConfirm(toISODate(option.date))}
              >
                <View style={styles.modalOptionLeft}>
                  <View style={styles.modalIconCircle}>
                    <FontAwesome5 name={option.icon} size={14} color="#FF6B6B" />
                  </View>
                  <Text style={styles.modalOptionLabel}>{option.label}</Text>
                </View>
                <Text style={styles.modalOptionDate}>{formatDate(option.date)}</Text>
              </TouchableOpacity>
            ))}

            {/* Pick a Date option */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <View style={styles.modalOptionLeft}>
                <View style={[styles.modalIconCircle, { backgroundColor: '#F0FAF0' }]}>
                  <FontAwesome5 name="calendar-alt" size={14} color="#4A8C4A" />
                </View>
                <Text style={styles.modalOptionLabel}>Pick a Date</Text>
              </View>
              <FontAwesome5 name={showDatePicker ? 'chevron-up' : 'chevron-down'} size={12} color="#717171" />
            </TouchableOpacity>

            {/* Native Date Picker */}
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={addDays(1)}
                  onChange={onDateChange}
                  themeVariant="light"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.confirmPickerButton}
                    onPress={() => handlePostponeConfirm(toISODate(pickerDate))}
                  >
                    <Text style={styles.confirmPickerText}>Move to {formatDate(pickerDate)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => { setPostponeModal({ ...postponeModal, visible: false }); setShowDatePicker(false); }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TimerModal
        visible={timerModal.visible}
        habitTitle={timerModal.habitTitle}
        durationMinutes={timerModal.duration}
        onComplete={handleTimerComplete}
        onClose={() => setTimerModal({ ...timerModal, visible: false })}
      />

      {editTimesModal.visible && (
        <EditTimesModal
          visible={editTimesModal.visible}
          habitId={editTimesModal.habitId}
          habitTitle={editTimesModal.habitTitle}
          initialDueTime={editTimesModal.dueTime}
          initialReminderTime={editTimesModal.reminderTime}
          onClose={() => setEditTimesModal(prev => ({ ...prev, visible: false }))}
          onSave={handleEditTimesSave}
        />
      )}
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
  // Postpone Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#EBEBEB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#717171',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE4E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  modalOptionDate: {
    fontSize: 13,
    color: '#717171',
  },
  datePickerContainer: {
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  confirmPickerButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  confirmPickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancel: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD4D4',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  // Postponed Section
  postponedSection: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
  },
  postponedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#717171',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  postponedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#FFFAF0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE8C8',
    borderLeftWidth: 4,
    borderLeftColor: '#FFB347',
  },
  postponedInfo: {
    flex: 1,
  },
  postponedItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B7355',
  },
  postponedItemDate: {
    fontSize: 12,
    color: '#B8A080',
    marginTop: 2,
  },
  bringBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bringBackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  // Skipped Section
  skippedSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  skippedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  skippedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
  },
  skippedItemTitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
  },
  undoSkipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  undoSkipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#717171',
  },
});
