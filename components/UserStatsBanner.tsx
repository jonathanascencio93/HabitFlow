import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useHabit } from '../src/context/HabitContext';
import { FontAwesome5 } from '@expo/vector-icons';

export const UserStatsBanner = () => {
    const { userStats } = useHabit();

    return (
        <View style={styles.container}>
            <View style={styles.statBox}>
                <FontAwesome5 name="fire" size={24} color="#FF5A5F" />
                <View style={styles.textContainer}>
                    <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statBox}>
                <FontAwesome5 name="gem" size={24} color="#00A699" />
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
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginVertical: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4, // for android
    },
    statBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    divider: {
        width: 1,
        backgroundColor: '#EBEBEB',
        marginHorizontal: 8,
    },
    textContainer: {
        flexDirection: 'column',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222222',
    },
    statLabel: {
        fontSize: 12,
        color: '#717171',
        marginTop: 2,
    },
});
