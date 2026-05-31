import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface HeadingProps {
    text: string;
}

export default function Heading({ text }: HeadingProps) {
    return <Text style={styles.heading}>{text}</Text>;
}

const styles = StyleSheet.create({
    heading: {
        fontSize: 32,
        fontWeight: '600',
        color: COLORS.black,
        fontFamily: FONTS.heading,
        marginTop: 30,
    },
});