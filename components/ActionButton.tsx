import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import { Plus, X } from 'lucide-react-native';

interface ActionButtonProps {
    variant?: 'primary' | 'danger';
    onClick?: () => void;
}

export default function ActionButton({ variant = 'primary', onClick }: ActionButtonProps) {
    const isDanger = variant === 'danger';

    const IconComponent = isDanger ? X : Plus;

    const gradientColors = isDanger
        ? ['#FF3041', '#FF7675']
        : [COLORS.green, COLORS.lightGreen];

    const borderColors = isDanger
        ? ['#FF7675', '#FF3041']
        : [COLORS.lightGreen, COLORS.green];

    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.8} onPress={onClick} style={styles.shadowWrapper}>
                <LinearGradient colors={borderColors} style={styles.borderGradient}>
                    <LinearGradient colors={gradientColors} style={styles.innerGradient}>
                        <IconComponent size={28} color={COLORS.white} strokeWidth={2} />
                    </LinearGradient>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
    },
    shadowWrapper: {
        borderRadius: 20,
        elevation: 8,
        shadowColor: COLORS.darkGray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    borderGradient: {
        padding: 4,
        borderRadius: 20,
    },
    innerGradient: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});