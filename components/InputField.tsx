import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Type, AtSign, Lock, User, Building2, Calendar, Coins, Clock, Phone } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const icons = {
    letters: Type,
    at: AtSign,
    lock: Lock,
    person: User,
    building: Building2,
    date: Calendar,
    price: Coins,
    duration: Clock,
    contact: Phone,
};

interface InputFieldProps {
    placeholder: string;
    type?: 'text' | 'password' | 'email';
    icon?: keyof typeof icons;
    value?: string;
    onChange?: (value: string) => void;
}

export default function InputField({
    placeholder,
    type = 'text',
    icon = 'letters',
    value,
    onChange,
}: InputFieldProps) {
    const IconComponent = icons[icon] || Type;

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <IconComponent size={24} color={COLORS.darkGray} strokeWidth={2} />
            </View>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.darkGray}
                secureTextEntry={type === 'password'}
                keyboardType={type === 'email' ? 'email-address' : 'default'}
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 10,
        backgroundColor: COLORS.gray,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        backgroundColor: COLORS.gray,
    },
    input: {
        flex: 1,
        color: COLORS.black,
        fontSize: 16,
        padding: 0,
        fontFamily: 'Urbanist_400Regular',
    },
});