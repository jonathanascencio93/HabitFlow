import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface EditTimesModalProps {
    visible: boolean;
    habitId: string;
    habitTitle: string;
    initialDueTime?: string; // HH:MM
    initialReminderTime?: string; // HH:MM
    onClose: () => void;
    onSave: (id: string, dueTime?: string, reminderTime?: string) => void;
}

export const EditTimesModal = ({ visible, habitId, habitTitle, initialDueTime, initialReminderTime, onClose, onSave }: EditTimesModalProps) => {
    const [hasDue, setHasDue] = useState(!!initialDueTime);
    const [hasReminder, setHasReminder] = useState(!!initialReminderTime);

    const [dueTime, setDueTime] = useState<Date>(() => {
        const d = new Date();
        if (initialDueTime) {
            const [h, m] = initialDueTime.split(':').map(Number);
            d.setHours(h, m, 0, 0);
        } else {
            d.setHours(9, 0, 0, 0);
        }
        return d;
    });

    const [reminderTime, setReminderTime] = useState<Date>(() => {
        const d = new Date();
        if (initialReminderTime) {
            const [h, m] = initialReminderTime.split(':').map(Number);
            d.setHours(h, m, 0, 0);
        } else if (initialDueTime) {
            const [h, m] = initialDueTime.split(':').map(Number);
            d.setHours(h, m - 15, 0, 0);
        } else {
            d.setHours(8, 45, 0, 0);
        }
        return d;
    });

    const [showDuePicker, setShowDuePicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);

    useEffect(() => {
        if (visible) {
            setHasDue(!!initialDueTime);
            setHasReminder(!!initialReminderTime);
            if (initialDueTime) {
                const [h, m] = initialDueTime.split(':').map(Number);
                const d = new Date(); d.setHours(h, m, 0, 0);
                setDueTime(d);
            }
            if (initialReminderTime) {
                const [h, m] = initialReminderTime.split(':').map(Number);
                const d = new Date(); d.setHours(h, m, 0, 0);
                setReminderTime(d);
            }
        }
    }, [visible, initialDueTime, initialReminderTime]);

    const handleSave = () => {
        const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        onSave(
            habitId,
            hasDue ? formatTime(dueTime) : undefined,
            hasReminder && hasDue ? formatTime(reminderTime) : undefined
        );
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Edit Times</Text>
                    <Text style={styles.subtitle}>{habitTitle}</Text>

                    {/* Due Time */}
                    <View style={styles.row}>
                        <View style={styles.iconLabel}>
                            <FontAwesome5 name="clock" size={14} color="#4A90E2" />
                            <Text style={styles.label}>Due Time</Text>
                        </View>
                        <Switch
                            value={hasDue}
                            onValueChange={setHasDue}
                            trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    {hasDue && Platform.OS === 'web' ? (
                        <div style={{ marginTop: 8, padding: 14, backgroundColor: '#F7F7F7', borderRadius: 12, border: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <input
                                type="time"
                                value={`${dueTime.getHours().toString().padStart(2, '0')}:${dueTime.getMinutes().toString().padStart(2, '0')}`}
                                onChange={(e) => {
                                    const [h, m] = e.target.value.split(':').map(Number);
                                    const newDate = new Date(dueTime);
                                    newDate.setHours(h, m);
                                    setDueTime(newDate);
                                }}
                                style={{ fontSize: 18, fontWeight: '600', color: '#222', border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%' }}
                            />
                        </div>
                    ) : hasDue ? (
                        <>
                            <TouchableOpacity style={styles.timePicker} onPress={() => setShowDuePicker(true)}>
                                <Text style={styles.timePickerText}>
                                    {dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <FontAwesome5 name="chevron-right" size={12} color="#999" />
                            </TouchableOpacity>
                            {showDuePicker && (
                                <DateTimePicker
                                    value={dueTime}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(e: DateTimePickerEvent, d?: Date) => {
                                        setShowDuePicker(Platform.OS === 'ios');
                                        if (d) setDueTime(d);
                                    }}
                                />
                            )}
                        </>
                    ) : null}

                    {/* Reminder */}
                    {hasDue && (
                        <>
                            <View style={[styles.row, { marginTop: 16 }]}>
                                <View style={styles.iconLabel}>
                                    <FontAwesome5 name="bell" size={14} color="#FF8C42" />
                                    <Text style={styles.label}>Reminder</Text>
                                </View>
                                <Switch
                                    value={hasReminder}
                                    onValueChange={setHasReminder}
                                    trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>

                            {hasReminder && Platform.OS === 'web' ? (
                                <div style={{ marginTop: 8, padding: 14, backgroundColor: '#F7F7F7', borderRadius: 12, border: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <input
                                        type="time"
                                        value={`${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`}
                                        onChange={(e) => {
                                            const [h, m] = e.target.value.split(':').map(Number);
                                            const newDate = new Date(reminderTime);
                                            newDate.setHours(h, m);
                                            setReminderTime(newDate);
                                        }}
                                        style={{ fontSize: 18, fontWeight: '600', color: '#222', border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%' }}
                                    />
                                </div>
                            ) : hasReminder ? (
                                <>
                                    <TouchableOpacity style={styles.timePicker} onPress={() => setShowReminderPicker(true)}>
                                        <Text style={styles.timePickerText}>
                                            {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        <FontAwesome5 name="chevron-right" size={12} color="#999" />
                                    </TouchableOpacity>
                                    {showReminderPicker && (
                                        <DateTimePicker
                                            value={reminderTime}
                                            mode="time"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={(e: DateTimePickerEvent, d?: Date) => {
                                                setShowReminderPicker(Platform.OS === 'ios');
                                                if (d) setReminderTime(d);
                                            }}
                                        />
                                    )}
                                </>
                            ) : null}
                        </>
                    )}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222222',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#717171',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    timePickerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222222',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F5F5F5',
    },
    saveBtn: {
        backgroundColor: '#FF6B6B',
    },
    cancelText: {
        color: '#717171',
        fontWeight: '600',
        fontSize: 16,
    },
    saveText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
