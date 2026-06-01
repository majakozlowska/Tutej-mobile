import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface TextAreaProps {
    placeholder: string;
    value?: string;
    onChange?: (value: string) => void;
}

export default function TextArea({ placeholder, value, onChange }: TextAreaProps) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.darkGray}
                value={value}
                onChangeText={onChange}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
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
        minHeight: 120,
        border: 'none'
    },
    input: {
        flex: 1,
        color: COLORS.black,
        fontSize: 16,
        fontFamily: FONTS.regular,
        padding: 0,
    },
});