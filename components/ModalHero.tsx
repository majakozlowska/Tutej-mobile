import React from 'react';
import { COLORS, FONTS } from '../constants/theme';
import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';

interface ModalHeroProps {
    imageUri: string;
    title: string;
    subtitle: string;
}

export default function ModalHero({ imageUri, title, subtitle }: ModalHeroProps) {
    return (
        <View style={styles.heroSection}>
            <Image source={{ uri: imageUri }} style={styles.heroImage} />
            <View style={styles.heroOverlay} />
            <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>{title}</Text>
                <Text style={styles.heroSubtitle}>{subtitle}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heroSection: {
        position: 'relative',
        height: 280,
        justifyContent: 'flex-end',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    heroTextContainer: {
        padding: 20,
        zIndex: 3,
    },
    heroTitle: {
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: FONTS.heading,
        lineHeight: 32,
        marginBottom: 6,
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#E5E7E9',
        fontFamily: FONTS.regular,
        letterSpacing: 0.5,
    },
});