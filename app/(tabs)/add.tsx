import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useHabit } from '@/src/context/HabitContext';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function AddHabitScreen() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<'morning' | 'work' | 'health' | 'chore' | 'habit'>('habit');
    const [points, setPoints] = useState('10');

    const { addHabit } = useHabit();
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);

    const handleSave = () => {
        if (!title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        addHabit({
            title: title.trim(),
            category,
            pointsValue: parseInt(points) || 10,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTitle('');
        router.navigate('/(tabs)');
    };

    const handleMicPress = () => {
        // For MVP: Focuses the input to allow user to use system keyboard dictation
        inputRef.current?.focus();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
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
                            <FontAwesome5 name="microphone" size={20} color="#00A699" />
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
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!title.trim()}
                >
                    <Text style={styles.saveButtonText}>Add to Flow</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    container: {
        flex: 1,
        padding: 24,
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
        paddingVertical: 12,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    textInput: {
        flex: 1,
        fontSize: 18,
        color: '#222222',
        height: 36, // Ensure enough height for touch
    },
    micButton: {
        padding: 8,
        backgroundColor: '#E8F5F4',
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
        gap: 12,
        marginBottom: 32,
        flexWrap: 'wrap',
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#EBEBEB',
    },
    pillActive: {
        backgroundColor: '#00A699',
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#717171',
    },
    pillTextActive: {
        color: '#FFFFFF',
    },
    saveButton: {
        backgroundColor: '#FF5A5F',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#FF5A5F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
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
