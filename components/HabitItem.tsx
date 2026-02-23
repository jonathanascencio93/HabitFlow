import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { Habit } from '../src/models/types';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HabitItemProps {
    habit: Habit;
    onToggle: (id: string) => void;
    onPostpone?: (id: string) => void;
    onSkip?: (id: string) => void;
}

export const HabitItem = ({ habit, onToggle, onPostpone, onSkip }: HabitItemProps) => {
    const scale = useSharedValue(1);
    const isDone = habit.status === 'done';
    const [expanded, setExpanded] = useState(false);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handleCheckbox = () => {
        scale.value = withSequence(
            withSpring(0.95),
            withSpring(1.05),
            withSpring(1)
        );

        if (!isDone) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        onToggle(habit.id);
        if (expanded) setExpanded(false);
    };

    const handleCardPress = () => {
        if (isDone) {
            // Tapping a completed card undoes it
            handleCheckbox();
            return;
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handlePostpone = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setExpanded(false);
        onPostpone?.(habit.id);
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded(false);
        onSkip?.(habit.id);
    };

    return (
        <Animated.View style={[animatedStyle]}>
            <Pressable onPress={handleCardPress}>
                <View style={[styles.container, isDone && styles.containerCompleted]}>
                    {/* Main row: checkbox + title + points */}
                    <View style={styles.mainRow}>
                        <TouchableOpacity onPress={handleCheckbox} style={styles.checkboxTouchable}>
                            <View style={[styles.checkbox, isDone && styles.checkboxActive]}>
                                {isDone && (
                                    <FontAwesome5 name="check" size={14} color="#FFFFFF" />
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.title, isDone && styles.titleCompleted]} numberOfLines={1}>
                            {habit.title}
                        </Text>
                        <View style={[styles.pointsPill, isDone && styles.pointsPillCompleted]}>
                            <Text style={[styles.pointsText, isDone && styles.pointsTextCompleted]}>+{habit.pointsValue}</Text>
                        </View>
                    </View>

                    {/* Expanded action panel */}
                    {expanded && !isDone && (
                        <View style={styles.actionPanel}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleCheckbox}>
                                <View style={[styles.actionIcon, { backgroundColor: '#F0FAF0' }]}>
                                    <FontAwesome5 name="check" size={12} color="#4A8C4A" />
                                </View>
                                <Text style={styles.actionLabel}>Done</Text>
                            </TouchableOpacity>

                            {onSkip && (
                                <TouchableOpacity style={styles.actionButton} onPress={handleSkip}>
                                    <View style={[styles.actionIcon, { backgroundColor: '#F5F5F5' }]}>
                                        <FontAwesome5 name="times" size={12} color="#B0B0B0" />
                                    </View>
                                    <Text style={styles.actionLabel}>Skip</Text>
                                </TouchableOpacity>
                            )}

                            {onPostpone && (
                                <TouchableOpacity style={styles.actionButton} onPress={handlePostpone}>
                                    <View style={[styles.actionIcon, { backgroundColor: '#FFE4E1' }]}>
                                        <FontAwesome5 name="calendar-plus" size={12} color="#FF6B6B" />
                                    </View>
                                    <Text style={styles.actionLabel}>Move</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 10,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderLeftWidth: 4,
        borderLeftColor: '#F0F0F0',
        overflow: 'hidden',
    },
    containerCompleted: {
        backgroundColor: '#F0FAF0',
        borderColor: '#C5E8C5',
        borderLeftColor: '#A8D5A2',
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        paddingLeft: 12,
    },
    checkboxTouchable: {
        padding: 4,
        marginRight: 12,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#EBEBEB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAFA',
    },
    checkboxActive: {
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
    },
    title: {
        fontSize: 16,
        color: '#222222',
        fontWeight: '500',
        flex: 1,
    },
    titleCompleted: {
        color: '#4A8C4A',
    },
    pointsPill: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginLeft: 8,
    },
    pointsPillCompleted: {
        backgroundColor: '#2D2D2D',
    },
    pointsText: {
        color: '#717171',
        fontWeight: '700',
        fontSize: 13,
    },
    pointsTextCompleted: {
        color: '#FFFFFF',
    },
    // Expandable action panel
    actionPanel: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#FAFAFA',
    },
    actionIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555555',
    },
});
