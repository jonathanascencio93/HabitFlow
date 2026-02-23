import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useHabit } from '@/src/context/HabitContext';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RecurrenceType, RecurrenceRule } from '@/src/models/types';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AddHabitScreen() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<'morning' | 'work' | 'health' | 'chore' | 'habit'>('habit');
    const [points, setPoints] = useState('10');
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
    const [dayOfMonth, setDayOfMonth] = useState('1');

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
                return undefined; // No rule = daily (backward compatible)
            case 'specific_days':
                return { type: 'specific_days', daysOfWeek: selectedDays, startDate: today };
            case 'every_other_day':
                return { type: 'every_other_day', startDate: today };
            case 'weekly':
                return { type: 'weekly', startDate: today };
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

        addHabit({
            title: title.trim(),
            category,
            pointsValue: parseInt(points) || 10,
            recurrence: buildRecurrence(),
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

                        {/* Day-of-month picker for 'monthly' */}
                        {recurrenceType === 'monthly' && (
                            <View style={styles.dayPickerContainer}>
                                <Text style={styles.dayPickerLabel}>Day of month</Text>
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
});
