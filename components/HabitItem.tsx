import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
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

// Format HH:MM to readable time
const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
};

interface HabitItemProps {
    habit: Habit;
    onToggle: (id: string) => void;
    onPostpone?: (id: string) => void;
    onSkip?: (id: string) => void;
    onTimer?: (id: string) => void;
    onExtendDue?: (id: string, newTime: string) => void;
    onEditTimes?: (id: string) => void;
}

export const HabitItem = ({ habit, onToggle, onPostpone, onSkip, onTimer, onExtendDue, onEditTimes }: HabitItemProps) => {
    const scale = useSharedValue(1);
    const isDone = habit.status === 'done';
    const [expanded, setExpanded] = useState(false);

    // Check if overdue (past due time and still pending)
    const isOverdue = (() => {
        if (!habit.dueTime || isDone) return false;
        const now = new Date();
        const [h, m] = habit.dueTime.split(':').map(Number);
        const dueDate = new Date();
        dueDate.setHours(h, m, 0, 0);
        return now > dueDate;
    })();

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

    const handleExtend = () => {
        if (!habit.dueTime || !onExtendDue) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const [h, m] = habit.dueTime.split(':').map(Number);
        const date = new Date();
        date.setHours(h + 1, m); // Add 1 hour
        const newDueTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        onExtendDue(habit.id, newDueTime);
        setExpanded(false);
    };

    const swipeableRef = useRef<Swipeable>(null);

    const renderLeftActions = () => {
        if (!onEditTimes) return null;
        return (
            <View style={styles.swipeLeftAction}>
                <FontAwesome5 name="clock" size={20} color="#FFFFFF" />
                <Text style={styles.swipeActionText}>Edit</Text>
            </View>
        );
    };

    const renderRightActions = () => {
        if (isDone || !onSkip) return null;
        return (
            <View style={styles.swipeRightAction}>
                <FontAwesome5 name="fast-forward" size={20} color="#FFFFFF" />
                <Text style={styles.swipeActionText}>Skip</Text>
            </View>
        );
    };

    return (
        <Animated.View style={[animatedStyle, styles.cardWrapper]}>
            <Swipeable
                ref={swipeableRef}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableLeftOpen={() => {
                    swipeableRef.current?.close();
                    if (onEditTimes) onEditTimes(habit.id);
                }}
                onSwipeableRightOpen={() => {
                    swipeableRef.current?.close();
                    if (!isDone) handleSkip();
                }}
                friction={2}
                rightThreshold={40}
                leftThreshold={40}
            >
                <Pressable onPress={handleCardPress}>
                    <View style={[styles.container, isDone && styles.containerCompleted, isOverdue && styles.containerOverdue]}>
                        {/* Main row: checkbox + title + points */}
                        <View style={styles.mainRow}>
                            <TouchableOpacity onPress={handleCheckbox} style={styles.checkboxTouchable}>
                                <View style={[styles.checkbox, isDone && styles.checkboxActive]}>
                                    {isDone && (
                                        <FontAwesome5 name="check" size={14} color="#FFFFFF" />
                                    )}
                                </View>
                            </TouchableOpacity>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.title, isDone && styles.titleCompleted]} numberOfLines={1}>
                                    {habit.title}
                                </Text>
                                {habit.dueTime && !isDone && (
                                    <Text style={[styles.dueTimeText, isOverdue && styles.dueTimeOverdue]}>
                                        {isOverdue ? '⚠ Overdue' : `Due by ${formatTime(habit.dueTime)}`}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.rightRow}>
                                {habit.timerMinutes && !isDone ? (
                                    <View style={styles.timerBadge}>
                                        <FontAwesome5 name="clock" size={10} color="#FF6B6B" />
                                        <Text style={styles.timerBadgeText}>{habit.timerMinutes}m</Text>
                                    </View>
                                ) : null}
                                <View style={[styles.pointsPill, isDone && styles.pointsPillCompleted]}>
                                    <Text style={[styles.pointsText, isDone && styles.pointsTextCompleted]}>+{habit.pointsValue}</Text>
                                </View>
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

                                {onEditTimes ? (
                                    <TouchableOpacity style={styles.actionButton} onPress={() => { setExpanded(false); onEditTimes(habit.id); }}>
                                        <View style={[styles.actionIcon, { backgroundColor: '#F0F5FF' }]}>
                                            <FontAwesome5 name="clock" size={12} color="#4A90E2" />
                                        </View>
                                        <Text style={styles.actionLabel}>Edit</Text>
                                    </TouchableOpacity>
                                ) : null}

                                {habit.timerMinutes && onTimer ? (
                                    <TouchableOpacity style={styles.actionButton} onPress={() => { setExpanded(false); onTimer(habit.id); }}>
                                        <View style={[styles.actionIcon, { backgroundColor: '#FFF0E8' }]}>
                                            <FontAwesome5 name="stopwatch" size={12} color="#FF8C42" />
                                        </View>
                                        <Text style={styles.actionLabel}>Timer</Text>
                                    </TouchableOpacity>
                                ) : null}

                                {isOverdue && onExtendDue ? (
                                    <TouchableOpacity style={styles.actionButton} onPress={handleExtend}>
                                        <View style={[styles.actionIcon, { backgroundColor: '#FFF5E6' }]}>
                                            <FontAwesome5 name="clock" size={12} color="#FF8C42" />
                                        </View>
                                        <Text style={styles.actionLabel}>+1h</Text>
                                    </TouchableOpacity>
                                ) : null}

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
            </Swipeable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardWrapper: {
        marginBottom: 10,
        marginHorizontal: 16,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
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
    containerOverdue: {
        borderColor: '#FFD6A0',
        borderLeftColor: '#FF8C42',
        backgroundColor: '#FFFAF5',
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
    },
    titleCompleted: {
        color: '#4A8C4A',
    },
    titleContainer: {
        flex: 1,
    },
    dueTimeText: {
        fontSize: 12,
        color: '#999999',
        marginTop: 2,
    },
    dueTimeOverdue: {
        color: '#FF6B6B',
        fontWeight: '600',
    },
    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FFF0E8',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
    },
    timerBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FF8C42',
    },
    pointsPill: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
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
    swipeLeftAction: {
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 24,
        flex: 1,
        borderRadius: 16,
    },
    swipeRightAction: {
        backgroundColor: '#B0B0B0',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 24,
        flex: 1,
        borderRadius: 16,
    },
    swipeActionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
});
