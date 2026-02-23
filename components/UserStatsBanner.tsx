import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useHabit } from '../src/context/HabitContext';
import { FontAwesome5 } from '@expo/vector-icons';

export const UserStatsBanner = () => {
    const { userStats } = useHabit();

    return (
        <View style={styles.container}>
            <View style={styles.statBox}>
                <View style={styles.iconCircle}>
                    <FontAwesome5 name="fire" size={18} color="#FF5A5F" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
            </View>

            <View style={styles.statBox}>
                <View style={[styles.iconCircle, styles.iconCircleGreen]}>
                    <FontAwesome5 name="gem" size={18} color="#A8D5A2" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.statValue}>{userStats.totalPoints}</Text>
                    <Text style={styles.statLabel}>Total Points</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 16,
        marginHorizontal: 16,
    },
    statBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        gap: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleGreen: {
        backgroundColor: '#F0FAF0',
    },
    textContainer: {
        flexDirection: 'column',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#222222',
    },
    statLabel: {
        fontSize: 12,
        color: '#717171',
        marginTop: 2,
    },
});
