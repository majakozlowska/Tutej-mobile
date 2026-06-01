import React from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import Heading from './Heading';
import { COLORS, FONTS } from '../constants/theme';

interface ScreenHeaderProps {
    title: string;
    subtitle: string;
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
    return (
        <View style={styles.header}>
            <Heading text={title} />
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 30,
    },
    subtitle: {
        color: COLORS.darkGray,
        fontFamily: FONTS.regular,
        fontSize: 16,
        marginTop: 5,
        lineHeight: 22,
    },
});