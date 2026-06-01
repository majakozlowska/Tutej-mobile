import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../constants/theme';

interface MiniCalendarProps {
    month: string;
    day: string;
}

export default function MiniCalendar({ month, day }: MiniCalendarProps) {
    return (
        <View style={styles.container}>
            <View style={styles.shadowWrapper}>
                <LinearGradient
                    colors={[COLORS.white, COLORS.gray]}
                    style={styles.borderGradient}
                >
                    <LinearGradient
                        colors={[COLORS.gray, COLORS.white]}
                        style={styles.innerGradient}
                    >
                        <Text style={styles.monthText}>{month}</Text>
                        <Text style={styles.dayText}>{day}</Text>
                    </LinearGradient>
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.gray,
        padding: 3,
        borderRadius: 14,
        alignSelf: 'flex-start',
    },
    shadowWrapper: {
        borderRadius: 11,
        elevation: 6,
        shadowColor: COLORS.darkGray,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    borderGradient: {
        padding: 2,
        borderRadius: 11,
    },
    innerGradient: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 56,
    },
    monthText: {
        fontFamily: FONTS.heading,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.green,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 2,
        includeFontPadding: false,
    },
    dayText: {
        fontFamily: FONTS.heading,
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.black,
        textAlign: 'center',
        lineHeight: 24,
        includeFontPadding: false,
    },
});