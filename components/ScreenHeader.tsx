import React from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import Heading from './Heading';

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
        color: '#7F8C8D',
        fontSize: 16,
        marginTop: 5,
        lineHeight: 22,
    },
});