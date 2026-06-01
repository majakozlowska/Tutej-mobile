import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { FONTS } from '../constants/theme';

export default function Text({ style, ...props }: TextProps) {
    return (
        <RNText
            style={[styles.defaultFont, style]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    defaultFont: {
        fontFamily: FONTS.regular,
    },
});