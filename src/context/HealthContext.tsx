import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Mock logic for MVP purposes since health connect requires complex native setup
// In production, we would use react-native-health (iOS) and react-native-health-connect (Android)

import { HealthMetric } from '../models/types';

interface HealthContextType {
    metrics: HealthMetric[];
    isAuthorized: boolean;
    requestPermissions: () => Promise<boolean>;
    refreshMetrics: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider = ({ children }: { children: ReactNode }) => {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const requestPermissions = async () => {
        // Return mock success
        setIsAuthorized(true);
        return true;
    };

    const refreshMetrics = async () => {
        if (!isAuthorized) return;

        // Generate mock mock data for today
        const today = new Date().toISOString();
        const mockMetrics: HealthMetric[] = [
            { type: 'steps', value: Math.floor(Math.random() * 5000) + 3000, date: today }, // 3k - 8k steps
            { type: 'sleep', value: Math.floor(Math.random() * 120) + 360, date: today },   // 6 - 8 hours (in minutes)
        ];

        setMetrics(mockMetrics);
    };

    useEffect(() => {
        if (isAuthorized) {
            refreshMetrics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthorized]);


    return (
        <HealthContext.Provider value={{ metrics, isAuthorized, requestPermissions, refreshMetrics }}>
            {children}
        </HealthContext.Provider>
    );
};

export const useHealth = () => {
    const context = useContext(HealthContext);
    if (context === undefined) {
        throw new Error('useHealth must be used within a HealthProvider');
    }
    return context;
};
