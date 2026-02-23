import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const RING_SIZE = width * 0.65;
const RING_THICKNESS = 10;

interface TimerModalProps {
    visible: boolean;
    habitTitle: string;
    durationMinutes: number;
    onComplete: () => void;
    onClose: () => void;
}

export const TimerModal = ({ visible, habitTitle, durationMinutes, onComplete, onClose }: TimerModalProps) => {
    const totalSeconds = durationMinutes * 60;
    const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (visible) {
            setSecondsLeft(durationMinutes * 60);
            setIsRunning(false);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [visible, durationMinutes]);

    useEffect(() => {
        if (isRunning && secondsLeft > 0) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setIsRunning(false);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, secondsLeft]);

    const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const isFinished = secondsLeft === 0;
    const progressColor = isFinished ? '#4A8C4A' : '#FF6B6B';

    const handlePlayPause = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRunning(false);
        setSecondsLeft(totalSeconds);
    };

    // Progress ring built with rotating half-circles (pure Views)
    const renderProgressRing = () => {
        const angle = (1 - progress) * 360;
        const innerSize = RING_SIZE - RING_THICKNESS * 2;

        return (
            <View style={[styles.ringOuter, { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2 }]}>
                {/* Background ring */}
                <View style={[styles.ringBackground, {
                    width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
                    borderWidth: RING_THICKNESS, borderColor: '#F0F0F0',
                }]} />

                {/* Progress overlay — using border approach */}
                <View style={[styles.ringProgress, {
                    width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
                    borderWidth: RING_THICKNESS,
                    borderColor: progressColor,
                    borderRightColor: angle > 90 ? progressColor : 'transparent',
                    borderBottomColor: angle > 180 ? progressColor : 'transparent',
                    borderLeftColor: angle > 270 ? progressColor : 'transparent',
                    borderTopColor: 'transparent',
                    transform: [{ rotate: '-90deg' }],
                }]} />

                {/* Inner white circle */}
                <View style={[styles.ringInner, {
                    width: innerSize, height: innerSize, borderRadius: innerSize / 2,
                }]} />
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <FontAwesome5 name="times" size={20} color="#717171" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.habitTitle}>{habitTitle}</Text>
                <Text style={styles.subtitle}>{durationMinutes} minute session</Text>

                {/* Timer display */}
                <View style={styles.circleContainer}>
                    {renderProgressRing()}
                    <View style={styles.timeOverlay}>
                        {isFinished ? (
                            <>
                                <FontAwesome5 name="check-circle" size={40} color="#4A8C4A" />
                                <Text style={styles.doneText}>Done!</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.timeText}>{timeDisplay}</Text>
                                <Text style={styles.timeLabel}>
                                    {isRunning ? 'Focus time...' : 'Ready'}
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
                        <View style={styles.controlIconCircle}>
                            <FontAwesome5 name="redo" size={16} color="#717171" />
                        </View>
                        <Text style={styles.controlLabel}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.playButton, isFinished && styles.playButtonDone]}
                        onPress={isFinished ? onClose : handlePlayPause}
                    >
                        <FontAwesome5
                            name={isFinished ? 'check' : isRunning ? 'pause' : 'play'}
                            size={24}
                            color="#FFFFFF"
                            style={!isRunning && !isFinished ? { marginLeft: 4 } : undefined}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                        <View style={styles.controlIconCircle}>
                            <FontAwesome5 name="times" size={16} color="#717171" />
                        </View>
                        <Text style={styles.controlLabel}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5EE',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        position: 'absolute',
        top: 60,
        right: 24,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    habitTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#222222',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#717171',
        marginBottom: 48,
    },
    circleContainer: {
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 56,
    },
    ringOuter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringBackground: {
        position: 'absolute',
    },
    ringProgress: {
        position: 'absolute',
    },
    ringInner: {
        backgroundColor: '#FFF5EE',
    },
    timeOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 52,
        fontWeight: '200',
        color: '#222222',
        fontVariant: ['tabular-nums'],
    },
    timeLabel: {
        fontSize: 14,
        color: '#999999',
        marginTop: 4,
        fontWeight: '500',
    },
    doneText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4A8C4A',
        marginTop: 8,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 28,
    },
    controlButton: {
        alignItems: 'center',
        gap: 6,
    },
    controlIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlLabel: {
        fontSize: 13,
        color: '#717171',
        fontWeight: '500',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    playButtonDone: {
        backgroundColor: '#4A8C4A',
        shadowColor: '#4A8C4A',
    },
});
