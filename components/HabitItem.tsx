import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
}

export const HabitItem = ({ habit, onToggle }: HabitItemProps) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(habit.isCompleted ? 0.6 : 1);

    useEffect(() => {
        opacity.value = withTiming(habit.isCompleted ? 0.6 : 1, { duration: 300 });
    }, [habit.isCompleted, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handlePress = () => {
        // Micro-animation for the click
        scale.value = withSequence(
            withSpring(0.95),
            withSpring(1.05),
            withSpring(1)
        );

        // Haptic feedback to make it feel tangible/rewarding
        if (!habit.isCompleted) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        onToggle(habit.id);
    };

    return (
        <Pressable onPress={handlePress}>
            <Animated.View style={[styles.container, habit.isCompleted && styles.containerCompleted, animatedStyle]}>
                <View style={styles.leftContent}>
                    <View style={[styles.checkbox, habit.isCompleted && styles.checkboxActive]}>
                        {habit.isCompleted && (
                            <FontAwesome5 name="check" size={14} color="#FFFFFF" />
                        )}
                    </View>
                    <Text style={[styles.title, habit.isCompleted && styles.titleCompleted]}>
                        {habit.title}
                    </Text>
                </View>
                <View style={[styles.pointsPill, habit.isCompleted && styles.pointsPillCompleted]}>
                    <Text style={[styles.pointsText, habit.isCompleted && styles.pointsTextCompleted]}>+{habit.pointsValue}</Text>
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
