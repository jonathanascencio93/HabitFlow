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
            <Animated.View style={[styles.container, animatedStyle]}>
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
                <View style={styles.pointsPill}>
                    <Text style={styles.pointsText}>+{habit.pointsValue}</Text>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
        backgroundColor: '#00A699',
        borderColor: '#00A699',
    },
    title: {
        fontSize: 16,
        color: '#222222',
        fontWeight: '500',
        flex: 1,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: '#717171',
    },
    pointsPill: {
        backgroundColor: '#E8F5F4',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    pointsText: {
        color: '#00A699',
        fontWeight: '700',
        fontSize: 14,
    },
});
