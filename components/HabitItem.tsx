import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { Habit } from '../src/models/types';
import * as Haptics from 'expo-haptics';

interface HabitItemProps {
    habit: Habit;
    onToggle: (id: string) => void;
    onPostpone?: (id: string) => void;
    onSkip?: (id: string) => void;
}

export const HabitItem = ({ habit, onToggle, onPostpone, onSkip }: HabitItemProps) => {
    const scale = useSharedValue(1);
    const isDone = habit.status === 'done';

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
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
    };

    const handlePostpone = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPostpone?.(habit.id);
    };

    return (
        <Pressable onPress={handlePress}>
            <Animated.View style={[styles.container, isDone && styles.containerCompleted, animatedStyle]}>
                <View style={styles.leftContent}>
                    <View style={[styles.checkbox, isDone && styles.checkboxActive]}>
                        {isDone && (
                            <FontAwesome5 name="check" size={14} color="#FFFFFF" />
                        )}
                    </View>
                    <Text style={[styles.title, isDone && styles.titleCompleted]}>
                        {habit.title}
                    </Text>
                </View>
                <View style={styles.rightContent}>
                    {!isDone && onSkip && (
                        <TouchableOpacity style={styles.skipButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSkip(habit.id); }}>
                            <FontAwesome5 name="times" size={12} color="#B0B0B0" />
                        </TouchableOpacity>
                    )}
                    {!isDone && onPostpone && (
                        <TouchableOpacity style={styles.postponeButton} onPress={handlePostpone}>
                            <FontAwesome5 name="calendar-plus" size={14} color="#717171" />
                        </TouchableOpacity>
                    )}
                    <View style={[styles.pointsPill, isDone && styles.pointsPillCompleted]}>
                        <Text style={[styles.pointsText, isDone && styles.pointsTextCompleted]}>+{habit.pointsValue}</Text>
                    </View>
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderLeftWidth: 4,
        borderLeftColor: '#F0F0F0',
    },
    containerCompleted: {
        backgroundColor: '#F0FAF0',
        borderColor: '#C5E8C5',
        borderLeftColor: '#A8D5A2',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#EBEBEB',
        marginRight: 16,
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
    skipButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    postponeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointsPill: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    pointsPillCompleted: {
        backgroundColor: '#2D2D2D',
    },
    pointsText: {
        color: '#717171',
        fontWeight: '700',
        fontSize: 14,
    },
    pointsTextCompleted: {
        color: '#FFFFFF',
    },
});
