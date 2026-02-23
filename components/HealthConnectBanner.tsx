import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useHealth } from '@/src/context/HealthContext';
import { FontAwesome5 } from '@expo/vector-icons';

export const HealthConnectBanner = () => {
    const { metrics, isAuthorized, requestPermissions } = useHealth();

    if (!isAuthorized) {
        return (
            <TouchableOpacity style={styles.promptContainer} onPress={requestPermissions}>
                <View style={styles.iconCircle}>
                    <FontAwesome5 name="heartbeat" size={16} color="#00A699" />
                </View>
                <View style={styles.promptTextContainer}>
                    <Text style={styles.promptTitle}>Connect Health Data</Text>
                    <Text style={styles.promptSubtitle}>Sync steps and sleep automatically</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color="#C4C4C4" />
            </TouchableOpacity>
        );
    }

    const steps = metrics.find(m => m.type === 'steps')?.value || 0;
    const sleep = metrics.find(m => m.type === 'sleep')?.value || 0;

    // Format sleep from minutes to hours/mins
    const sleepHours = Math.floor(sleep / 60);
    const sleepMins = sleep % 60;
    const sleepDisplay = `${sleepHours}h ${sleepMins}m`;

    return (
        <View style={styles.container}>
            <View style={styles.statBox}>
                <FontAwesome5 name="shoe-prints" size={18} color="#FF9F1C" />
                <View style={styles.textContainer}>
                    <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Steps</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statBox}>
                <FontAwesome5 name="bed" size={18} color="#4361EE" />
                <View style={styles.textContainer}>
                    <Text style={styles.statValue}>{sleepDisplay}</Text>
                    <Text style={styles.statLabel}>Sleep</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    promptContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FAF0',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#C5E8C5',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    promptTextContainer: {
        flex: 1,
    },
    promptTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 2,
    },
    promptSubtitle: {
        fontSize: 13,
        color: '#717171',
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
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
        fontSize: 16,
        fontWeight: '700',
        color: '#222222',
    },
    statLabel: {
        fontSize: 12,
        color: '#717171',
        marginTop: 2,
    },
});
