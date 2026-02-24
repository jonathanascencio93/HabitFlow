import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useHabit } from '@/src/context/HabitContext';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RecurrenceType, RecurrenceRule } from '@/src/models/types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AddHabitScreen() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<'morning' | 'work' | 'health' | 'chore' | 'habit'>('habit');
    const [points, setPoints] = useState('10');
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [weeklyDay, setWeeklyDay] = useState(new Date().getDay());
    const [dayOfMonth, setDayOfMonth] = useState('1');
    const [timerMinutes, setTimerMinutes] = useState<number>(0);
    const [hasDueTime, setHasDueTime] = useState(false);
    const [dueTime, setDueTime] = useState(new Date());
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showDuePicker, setShowDuePicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const [dailyTarget, setDailyTarget] = useState(1);
    const [reminderFrequencyHours, setReminderFrequencyHours] = useState<number>(0);
    const [reminderEndTime, setReminderEndTime] = useState(new Date());
    const [showReminderEndPicker, setShowReminderEndPicker] = useState(false);

    const { addHabit } = useHabit();
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        );
    };

    const buildRecurrence = (): RecurrenceRule | undefined => {
        const today = new Date().toISOString().split('T')[0];
        switch (recurrenceType) {
            case 'daily':
                return undefined;
            case 'specific_days':
                return { type: 'specific_days', daysOfWeek: selectedDays, startDate: today };
            case 'every_other_day':
                return { type: 'every_other_day', startDate: today };
            case 'weekly':
                return { type: 'weekly', daysOfWeek: [weeklyDay], startDate: today };
            case 'monthly':
                return { type: 'monthly', dayOfMonth: parseInt(dayOfMonth) || 1, startDate: today };
            default:
                return undefined;
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        const toHHMM = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

        addHabit({
            title: title.trim(),
            category,
            pointsValue: parseInt(points) || 10,
            recurrence: buildRecurrence(),
            timerMinutes: timerMinutes > 0 ? timerMinutes : undefined,
            dueTime: hasDueTime ? toHHMM(dueTime) : undefined,
            reminderTime: hasReminder ? toHHMM(reminderTime) : undefined,
            dailyTarget,
            dailyCompletions: 0,
            reminderFrequencyHours: (hasReminder && reminderFrequencyHours > 0) ? reminderFrequencyHours : undefined,
            reminderEndTime: (hasReminder && reminderFrequencyHours > 0) ? toHHMM(reminderEndTime) : undefined,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTitle('');
        router.navigate('/(tabs)');
    };

    const handleMicPress = () => {
        inputRef.current?.focus();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const recurrenceLabel = (type: RecurrenceType): string => {
        switch (type) {
            case 'daily': return 'Daily';
            case 'specific_days': return 'Specific Days';
            case 'every_other_day': return 'Every Other Day';
            case 'weekly': return 'Weekly';
            case 'monthly': return 'Monthly';
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Text style={styles.title}>New Activity</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                ref={inputRef}
                                style={styles.textInput}
                                placeholder="What do you want to achieve?"
                                placeholderTextColor="#A0A0A0"
                                value={title}
                                onChangeText={setTitle}
                                autoFocus
                            />
                            <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
                                <FontAwesome5 name="microphone" size={20} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Category</Text>
                        <View style={styles.pillContainer}>
                            {(['morning', 'work', 'health', 'chore', 'habit'] as const).map((c) => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.pill, category === c && styles.pillActive]}
                                    onPress={() => setCategory(c)}
                                >
                                    <Text style={[styles.pillText, category === c && styles.pillTextActive]}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Points Value</Text>
                        <View style={styles.pillContainer}>
                            {['5', '10', '15', '20'].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.pill, points === p && styles.pillActive]}
                                    onPress={() => setPoints(p)}
                                >
                                    <Text style={[styles.pillText, points === p && styles.pillTextActive]}>
                                        {p}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Repeat</Text>
                        <View style={styles.pillContainer}>
                            {(['daily', 'specific_days', 'every_other_day', 'weekly', 'monthly'] as RecurrenceType[]).map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.pill, recurrenceType === r && styles.pillActive]}
                                    onPress={() => setRecurrenceType(r)}
                                >
                                    <Text style={[styles.pillText, recurrenceType === r && styles.pillTextActive]}>
                                        {recurrenceLabel(r)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Day-of-week picker for 'specific_days' */}
                        {recurrenceType === 'specific_days' && (
                            <View style={styles.dayPickerContainer}>
                                <Text style={styles.dayPickerLabel}>Which days?</Text>
                                <View style={styles.dayRow}>
                                    {DAY_LABELS.map((label, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.dayCircle,
                                                selectedDays.includes(index) && styles.dayCircleActive,
                                            ]}
                                            onPress={() => toggleDay(index)}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                selectedDays.includes(index) && styles.dayTextActive,
                                            ]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Day picker for 'weekly' — pick ONE day */}
                        {recurrenceType === 'weekly' && (
                            <View style={styles.dayPickerContainer}>
                                <Text style={styles.dayPickerLabel}>Which day of the week?</Text>
                                <View style={styles.dayRow}>
                                    {DAY_LABELS.map((label, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.dayCircle,
                                                weeklyDay === index && styles.dayCircleActive,
                                            ]}
                                            onPress={() => setWeeklyDay(index)}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                weeklyDay === index && styles.dayTextActive,
                                            ]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Every other day info */}
                        {recurrenceType === 'every_other_day' && (
                            <View style={styles.dayPickerContainer}>
                                <Text style={styles.dayPickerLabel}>Starts from today and alternates every other day</Text>
                            </View>
                        )}

                        {/* Day-of-month picker for 'monthly' */}
                        {recurrenceType === 'monthly' && (
                            <View style={styles.dayPickerContainer}>
                                <Text style={styles.dayPickerLabel}>Which day of the month? (1-31)</Text>
                                <TextInput
                                    style={styles.monthDayInput}
                                    value={dayOfMonth}
                                    onChangeText={setDayOfMonth}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    placeholder="1"
                                />
                            </View>
                        )}

                        {/* Times Per Day (Intraday Recurrence) */}
                        <Text style={styles.label}>Times per day</Text>
                        <View style={styles.counterRow}>
                            <TouchableOpacity
                                style={styles.counterBtn}
                                onPress={() => setDailyTarget(Math.max(1, dailyTarget - 1))}
                            >
                                <FontAwesome5 name="minus" size={16} color="#4A90E2" />
                            </TouchableOpacity>
                            <Text style={styles.counterValue}>{dailyTarget}</Text>
                            <TouchableOpacity
                                style={styles.counterBtn}
                                onPress={() => setDailyTarget(dailyTarget + 1)}
                            >
                                <FontAwesome5 name="plus" size={16} color="#4A90E2" />
                            </TouchableOpacity>
                        </View>

                        {/* Timer duration */}
                        <Text style={styles.label}>Timer</Text>
                        <View style={styles.pillContainer}>
                            {[0, 5, 10, 15, 30, 60].map(mins => (
                                <TouchableOpacity
                                    key={mins}
                                    style={[styles.pill, timerMinutes === mins && styles.pillActive]}
                                    onPress={() => setTimerMinutes(mins)}
                                >
                                    <Text style={[styles.pillText, timerMinutes === mins && styles.pillTextActive]}>
                                        {mins === 0 ? 'None' : `${mins}m`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Due Time */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <FontAwesome5 name="clock" size={14} color="#FF6B6B" />
                                <Text style={styles.toggleLabel}>Due Time</Text>
                            </View>
                            <Switch
                                value={hasDueTime}
                                onValueChange={(v) => { setHasDueTime(v); if (v && !hasReminder) { setHasReminder(true); const r = new Date(dueTime); r.setMinutes(r.getMinutes() - 15); setReminderTime(r); } }}
                                trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        {hasDueTime && Platform.OS === 'web' ? (
                            <div style={{ marginTop: 8, padding: 14, backgroundColor: '#F7F7F7', borderRadius: 12, border: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <input
                                    type="time"
                                    value={`${dueTime.getHours().toString().padStart(2, '0')}:${dueTime.getMinutes().toString().padStart(2, '0')}`}
                                    onChange={(e) => {
                                        const [h, m] = e.target.value.split(':').map(Number);
                                        const newDate = new Date(dueTime);
                                        newDate.setHours(h, m);
                                        setDueTime(newDate);
                                        if (hasReminder) {
                                            const r = new Date(newDate);
                                            r.setMinutes(r.getMinutes() - 15);
                                            setReminderTime(r);
                                        }
                                    }}
                                    style={{ fontSize: 18, fontWeight: '600', color: '#222', border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%' }}
                                />
                            </div>
                        ) : hasDueTime ? (
                            <>
                                <TouchableOpacity style={styles.timePicker} onPress={() => setShowDuePicker(true)}>
                                    <Text style={styles.timePickerText}>
                                        {dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <FontAwesome5 name="chevron-right" size={12} color="#999" />
                                </TouchableOpacity>
                                {showDuePicker && (
                                    <DateTimePicker
                                        value={dueTime}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(e: DateTimePickerEvent, d?: Date) => {
                                            setShowDuePicker(Platform.OS === 'ios');
                                            if (d) { setDueTime(d); if (hasReminder) { const r = new Date(d); r.setMinutes(r.getMinutes() - 15); setReminderTime(r); } }
                                        }}
                                    />
                                )}
                            </>
                        ) : null}

                        {/* Reminder */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <FontAwesome5 name="bell" size={14} color="#FF8C42" />
                                <Text style={styles.toggleLabel}>Start Reminders At</Text>
                            </View>
                            <Switch
                                value={hasReminder}
                                onValueChange={setHasReminder}
                                trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        {hasReminder && Platform.OS === 'web' ? (
                            <div style={{ marginTop: 8, padding: 14, backgroundColor: '#F7F7F7', borderRadius: 12, border: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <input
                                    type="time"
                                    value={`${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`}
                                    onChange={(e) => {
                                        const [h, m] = e.target.value.split(':').map(Number);
                                        const newDate = new Date(reminderTime);
                                        newDate.setHours(h, m);
                                        setReminderTime(newDate);
                                    }}
                                    style={{ fontSize: 18, fontWeight: '600', color: '#222', border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%' }}
                                />
                            </div>
                        ) : hasReminder ? (
                            <>
                                <TouchableOpacity style={styles.timePicker} onPress={() => setShowReminderPicker(true)}>
                                    <Text style={styles.timePickerText}>
                                        {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <FontAwesome5 name="chevron-right" size={12} color="#999" />
                                </TouchableOpacity>
                                {showReminderPicker && (
                                    <DateTimePicker
                                        value={reminderTime}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(e: DateTimePickerEvent, d?: Date) => {
                                            setShowReminderPicker(Platform.OS === 'ios');
                                            if (d) setReminderTime(d);
                                        }}
                                    />
                                )}
                            </>
                        ) : null}

                        {hasReminder && (
                            <View style={styles.frequencyContainer}>
                                <Text style={styles.frequencyLabel}>Repeat Every (Hours)</Text>
                                <View style={styles.pillContainer}>
                                    {[0, 1, 2, 4, 8].map(hrs => (
                                        <TouchableOpacity
                                            key={hrs}
                                            style={[styles.pill, reminderFrequencyHours === hrs && styles.pillActive]}
                                            onPress={() => setReminderFrequencyHours(hrs)}
                                        >
                                            <Text style={[styles.pillText, reminderFrequencyHours === hrs && styles.pillTextActive]}>
                                                {hrs === 0 ? 'None' : `${hrs}h`}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {reminderFrequencyHours > 0 && (
                                    <>
                                        <Text style={[styles.frequencyLabel, { marginTop: 16 }]}>End Reminders At</Text>
                                        {Platform.OS === 'web' ? (
                                            <div style={{ padding: 14, backgroundColor: '#F7F7F7', borderRadius: 12, border: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <input
                                                    type="time"
                                                    value={`${reminderEndTime.getHours().toString().padStart(2, '0')}:${reminderEndTime.getMinutes().toString().padStart(2, '0')}`}
                                                    onChange={(e) => {
                                                        const [h, m] = e.target.value.split(':').map(Number);
                                                        const newDate = new Date(reminderEndTime);
                                                        newDate.setHours(h, m);
                                                        setReminderEndTime(newDate);
                                                    }}
                                                    style={{ fontSize: 18, fontWeight: '600', color: '#222', border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%' }}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <TouchableOpacity style={[styles.timePicker, { marginTop: 0 }]} onPress={() => setShowReminderEndPicker(true)}>
                                                    <Text style={styles.timePickerText}>
                                                        {reminderEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                    <FontAwesome5 name="chevron-right" size={12} color="#999" />
                                                </TouchableOpacity>
                                                {showReminderEndPicker && (
                                                    <DateTimePicker
                                                        value={reminderEndTime}
                                                        mode="time"
                                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                        onChange={(e: DateTimePickerEvent, d?: Date) => {
                                                            setShowReminderEndPicker(Platform.OS === 'ios');
                                                            if (d) setReminderEndTime(d);
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={!title.trim()}
                    >
                        <Text style={styles.saveButtonText}>Add to Flow</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        padding: 24,
        paddingBottom: 48,
    },
    header: {
        marginBottom: 32,
        marginTop: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#222222',
        letterSpacing: -0.5,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    textInput: {
        flex: 1,
        fontSize: 18,
        color: '#222222',
        paddingVertical: 0,
    },
    micButton: {
        padding: 8,
        backgroundColor: '#FFE4E1',
        borderRadius: 20,
        marginLeft: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 12,
    },
    pillContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
        flexWrap: 'wrap',
    },
    pill: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    pillActive: {
        backgroundColor: '#FF6B6B',
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#717171',
    },
    pillTextActive: {
        color: '#FFFFFF',
    },
    dayPickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    dayPickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#717171',
        marginBottom: 12,
    },
    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleActive: {
        backgroundColor: '#FF6B6B',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#717171',
    },
    dayTextActive: {
        color: '#FFFFFF',
    },
    monthDayInput: {
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#EBEBEB',
        borderRadius: 12,
        padding: 12,
        fontSize: 18,
        color: '#222222',
        width: 60,
        textAlign: 'center',
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 28,
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        borderRadius: 24,
        padding: 4,
        borderWidth: 1,
        borderColor: '#EBEBEB',
    },
    counterBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222222',
        minWidth: 24,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#FF6B6B',
        padding: 18,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#FFB3B5',
        shadowOpacity: 0,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 4,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222222',
    },
    timePicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        padding: 14,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#EBEBEB',
    },
    timePickerText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222222',
    },
    frequencyContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    frequencyLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#717171',
        marginBottom: 8,
    },
});
